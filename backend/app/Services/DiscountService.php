<?php

namespace App\Services;

use App\Exceptions\DiscountException;
use App\Models\Discount;
use App\Models\DiscountRedemption;
use App\Models\SaaSSetting;
use App\Models\Tenant;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DiscountService
{
    public const SCOPES = ['subscription', 'addon', 'theme'];

    /**
     * Resolve a discount code for a checkout and compute the final amount.
     * Gateway-facing callers decide how to apply:
     *  - Paddle: pass the code through (Paddle computes the discount).
     *  - Other gateways: pass `final_amount` as the sale amount.
     *
     * @throws DiscountException
     */
    public function resolve(string $code, string $scope, float $amount, string $currency, ?Tenant $tenant = null, array $entity = []): array
    {
        $code = strtoupper(trim($code));

        $discount = Discount::where('code', $code)->first();
        if (!$discount) {
            throw new DiscountException('That discount code is not valid.');
        }

        if (!$discount->isUsableNow()) {
            throw new DiscountException('This discount code has expired or is no longer active.');
        }

        $scopes = $discount->scopes();
        if (!empty($scopes) && !in_array($scope, $scopes, true)) {
            throw new DiscountException('This discount code cannot be used for this purchase.');
        }

        if ($scope === 'subscription' && !empty($discount->planSlugs())) {
            $planSlug = strtolower((string) ($entity['plan_slug'] ?? ''));
            if (!in_array($planSlug, array_map('strtolower', $discount->planSlugs()), true)) {
                throw new DiscountException('This discount code cannot be used for this plan.');
            }
        }

        if ($scope === 'addon' && !empty($discount->addonIds())) {
            $addonId = (string) ($entity['addon_id'] ?? '');
            if (!in_array($addonId, array_map('strval', $discount->addonIds()), true)) {
                throw new DiscountException('This discount code cannot be used for this add-on.');
            }
        }

        if ($scope === 'theme' && !empty($discount->templateIds())) {
            $templateId = (string) ($entity['template_id'] ?? '');
            if (!in_array($templateId, array_map('strval', $discount->templateIds()), true)) {
                throw new DiscountException('This discount code cannot be used for this theme.');
            }
        }

        if ($discount->min_subtotal !== null && $amount < $discount->min_subtotal) {
            throw new DiscountException(
                'This discount code requires a minimum order total of ' .
                number_format($discount->min_subtotal, 2) . ' ' . strtoupper($currency) . '.'
            );
        }

        if ($tenant && $discount->per_customer_limit !== null) {
            $used = DiscountRedemption::where('discount_id', $discount->id)
                ->where('tenant_id', $tenant->id)
                ->count();
            if ($used >= $discount->per_customer_limit) {
                throw new DiscountException('This discount code has already been used for this account.');
            }
        }

        $discountAmount = $this->computeDiscount($discount, $amount, $currency);

        return [
            'discount' => $discount,
            'code' => $code,
            'scope' => $scope,
            'original_amount' => (float) $amount,
            'discount_amount' => round($discountAmount, 2),
            'final_amount' => max(0.0, round($amount - $discountAmount, 2)),
            'currency' => strtoupper($currency),
        ];
    }

    public function computeDiscount(Discount $discount, float $amount, string $currency): float
    {
        $currency = strtoupper($currency);

        if ($discount->type === 'fixed') {
            if ($discount->currency_code && strtoupper($discount->currency_code) !== $currency) {
                throw new DiscountException(
                    'This discount code can only be used for payments in ' . strtoupper($discount->currency_code) . '.'
                );
            }
            return (float) $discount->value;
        }

        $percent = max(0.0, min(100.0, (float) $discount->value));
        $amount = (float) $amount * $percent / 100;

        if ($discount->max_discount !== null && $amount > (float) $discount->max_discount) {
            $amount = (float) $discount->max_discount;
        }

        return $amount;
    }

    /**
     * Record an idempotent redemption (called from webhooks after a successful payment).
     */
    public function recordRedemption(string $code, string $tenantId, string $scope, string $gateway, ?string $transactionId = null, ?float $amountOff = null): void
    {
        if (empty($code)) return;

        $discount = Discount::where('code', strtoupper(trim($code)))->first();
        if (!$discount) return;

        if ($transactionId) {
            $existing = DiscountRedemption::where('discount_id', $discount->id)
                ->where('transaction_id', $transactionId)
                ->exists();
            if ($existing) return;

            DiscountRedemption::create([
                'discount_id' => $discount->id,
                'tenant_id' => $tenantId,
                'scope' => $scope,
                'gateway' => $gateway,
                'transaction_id' => $transactionId,
                'amount_off' => $amountOff,
            ]);
        } else {
            DiscountRedemption::create([
                'discount_id' => $discount->id,
                'tenant_id' => $tenantId,
                'scope' => $scope,
                'gateway' => $gateway,
            ]);
        }

        if ($discount->usage_limit !== null) {
            $count = DiscountRedemption::where('discount_id', $discount->id)->count();
            $discount->usage_count = $count;
            $discount->save();
        } else {
            $discount->increment('usage_count');
        }
    }

    /**
     * Extract a discount code from gateway custom_data/metadata payloads.
     */
    public function codeFromCustomData(array $customData): ?string
    {
        $candidates = [
            $customData['discount_code'] ?? null,
            $customData['coupon'] ?? null,
            $customData['promo_code'] ?? null,
        ];

        foreach ($candidates as $candidate) {
            if (is_string($candidate) && $candidate !== '') {
                return strtoupper(trim($candidate));
            }
        }

        return null;
    }

    /**
     * Create or update this discount in the Paddle dashboard (sync).
     * Returns the Paddle discount id on success, null otherwise.
     */
    public function syncToPaddle(Discount $discount): ?string
    {
        $apiKey = SaaSSetting::where('key', 'paddle_api_key')->value('value') ?: env('PADDLE_API_KEY');
        if (!$apiKey) {
            throw new \RuntimeException('Paddle API Key is not configured.');
        }

        $environment = SaaSSetting::where('key', 'paddle_environment')->value('value') ?: env('PADDLE_ENVIRONMENT', 'sandbox');
        $baseUrl = $environment === 'production' ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com';

        $payload = [
            'description' => ($discount->description ?: $discount->code),
            'type' => $discount->type === 'fixed' ? 'flat' : 'percentage',
            'amount' => (string) ($discount->type === 'fixed' ? (int) round($discount->value * 100) : (float) $discount->value),
            'code' => $discount->code,
            'enabled_for_checkout' => (bool) $discount->is_active,
            'custom_data' => ['discount_id' => (string) $discount->id],
        ];

        if ($discount->type === 'fixed') {
            $payload['currency_code'] = strtoupper($discount->currency_code ?: 'USD');
        }

        if ($discount->is_recurring) {
            $payload['recur'] = true;
            if ($discount->maximum_recurring_intervals) {
                $payload['maximum_recurring_intervals'] = (int) $discount->maximum_recurring_intervals;
            }
        }

        if ($discount->expires_at) {
            $payload['expires_at'] = $discount->expires_at->toIso8601String();
        }

        if ($discount->usage_limit !== null) {
            $payload['usage_limit'] = (int) $discount->usage_limit;
        }

        $response = $discount->paddle_id
            ? Http::withToken($apiKey)->timeout(30)->patch("{$baseUrl}/discounts/{$discount->paddle_id}", $payload)
            : Http::withToken($apiKey)->timeout(30)->post("{$baseUrl}/discounts", $payload);

        if ($response->failed()) {
            Log::error("Paddle discount sync failed: " . $response->body());
            $detail = $response->json('error.detail') ?? $response->json('message') ?? 'Failed to sync discount to Paddle.';
            throw new \RuntimeException($detail);
        }

        $id = $response->json('data.id');
        if ($id) {
            $discount->paddle_id = $id;
            $discount->save();
        }

        return $id;
    }

    /**
     * Archive/disable the discount on Paddle.
     */
    public function archiveOnPaddle(Discount $discount): void
    {
        if (empty($discount->paddle_id)) return;

        $apiKey = SaaSSetting::where('key', 'paddle_api_key')->value('value') ?: env('PADDLE_API_KEY');
        if (!$apiKey) return;

        $environment = SaaSSetting::where('key', 'paddle_environment')->value('value') ?: env('PADDLE_ENVIRONMENT', 'sandbox');
        $baseUrl = $environment === 'production' ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com';

        Http::withToken($apiKey)->timeout(30)->patch("{$baseUrl}/discounts/{$discount->paddle_id}", [
            'enabled_for_checkout' => false,
        ]);
    }

    /**
     * Create or update the equivalent coupon in Stripe (sync).
     */
    public function syncToStripe(Discount $discount): ?string
    {
        $secretKey = SaaSSetting::where('key', 'stripe_secret_key')->value('value');
        if (!$secretKey) {
            throw new \RuntimeException('Stripe Secret Key is not configured.');
        }

        $payload = [
            'name' => $discount->code,
        ];

        if (!$discount->is_active) {
            return $discount->stripe_coupon_id;
        }

        if ($discount->type === 'fixed') {
            $payload['amount_off'] = (int) round($discount->value * 100);
            $payload['currency'] = strtolower($discount->currency_code ?: 'usd');
        } else {
            $payload['percent_off'] = (float) $discount->value;
        }

        if ($discount->is_recurring) {
            $payload['duration'] = 'repeating';
            $payload['duration_in_months'] = $discount->maximum_recurring_intervals ?: 3;
        } else {
            $payload['duration'] = 'once';
        }

        if (empty($discount->stripe_coupon_id)) {
            $id = $this->createStripeCoupon($secretKey, $payload);
            $discount->stripe_coupon_id = $id;
            $discount->save();
            return $id;
        }

        // Stripe coupons are immutable (amount, currency, duration). Detect any
        // price-relevant change and replace the coupon so checkouts use the new
        // terms instead of silently continuing with the stale one.
        $existing = Http::withToken($secretKey)->get('https://api.stripe.com/v1/coupons/' . $discount->stripe_coupon_id);
        $matches = $existing->successful()
            && (int) ($existing->json('amount_off') ?? 0) === (int) ($payload['amount_off'] ?? 0)
            && (float) ($existing->json('percent_off') ?? 0) === (float) ($payload['percent_off'] ?? 0)
            && $existing->json('duration') === ($payload['duration'] ?? 'once');

        if ($matches) {
            return $discount->stripe_coupon_id;
        }

        Http::asForm()->withToken($secretKey)->delete('https://api.stripe.com/v1/coupons/' . $discount->stripe_coupon_id);
        $discount->stripe_coupon_id = null;
        $id = $this->createStripeCoupon($secretKey, $payload);
        $discount->stripe_coupon_id = $id;
        $discount->save();
        return $id;
    }

    private function createStripeCoupon(string $secretKey, array $payload): string
    {
        $response = Http::asForm()->withToken($secretKey)->post('https://api.stripe.com/v1/coupons', $payload);
        if ($response->failed()) {
            Log::error("Stripe coupon create failed: " . $response->body());
            throw new \RuntimeException($response->json('error.message') ?? 'Failed to create Stripe coupon.');
        }
        return $response->json('id');
    }

    /**
     * Disable the coupon on Stripe (delete).
     */
    public function archiveOnStripe(Discount $discount): void
    {
        if (empty($discount->stripe_coupon_id)) return;

        $secretKey = SaaSSetting::where('key', 'stripe_secret_key')->value('value');
        if (!$secretKey) return;

        Http::asForm()->withToken($secretKey)->delete("https://api.stripe.com/v1/coupons/{$discount->stripe_coupon_id}");
    }
}