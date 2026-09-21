<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SaaSSetting;
use App\Models\SubscriptionPlan;
use App\Models\PaddleCustomer;
use App\Models\PaddleSubscription;
use App\Services\TenantResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class PaymentWebhookController extends Controller
{
    public function handleStripe(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        
        // Get webhook secret from SaaS settings
        $webhookSecret = SaaSSetting::where('key', 'stripe_webhook_secret')->value('value');

        if (!$webhookSecret) {
            Log::error("Stripe Webhook Secret not configured in SaaS settings.");
            return response()->json(['message' => 'Webhook secret missing'], 500);
        }

        try {
            // Verify and construct the event
            $event = Webhook::constructEvent(
                $payload, $sig_header, $webhookSecret
            );
            
            if ($event->type === 'checkout.session.completed') {
                $session = $event->data->object;
                
                // Determine if this is a subscription or a one-time theme purchase
                $type = $session->metadata->type ?? 'subscription';
                $tenantId = $session->metadata->tenant_id ?? $session->client_reference_id;

                if ($type === 'theme_purchase') {
                    $templateId = $session->metadata->template_id ?? null;
                    if ($tenantId && $templateId) {
                        $this->fulfillThemePurchase($tenantId, $templateId, $session->amount_total / 100);
                    }
                } elseif ($type === 'addon_purchase') {
                    $addonId = $session->metadata->addon_id ?? null;
                    $quantity = $session->metadata->quantity ?? 1;
                    if ($tenantId && $addonId) {
                        $this->fulfillAddonPurchase($tenantId, $addonId, (int) $quantity);
                    }
                } elseif ($type === 'reservation_deposit') {
                    $reservationId = $session->metadata->reservation_id ?? null;
                    if ($tenantId && $reservationId) {
                        $this->fulfillReservationDeposit($tenantId, $reservationId, $session->id, 'stripe');
                    }
                } else {
                    $planSlug = $session->metadata->plan_slug ?? null;
                    $subscriptionId = $session->subscription;
                    if ($tenantId && $planSlug) {
                        $this->updateTenantSubscription($tenantId, 'stripe', $subscriptionId, $planSlug);
                    }
                }

                $this->recordRedemption(isset($session->metadata) ? $session->metadata->toArray() : [], 'stripe', $session->id ?? null, $this->redemptionScope($type), $tenantId);
            }

            return response()->json(['status' => 'success']);
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            Log::error("Stripe Webhook Invalid Payload: " . $e->getMessage());
            return response()->json(['message' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            // Invalid signature
            Log::error("Stripe Webhook Invalid Signature: " . $e->getMessage());
            return response()->json(['message' => 'Invalid signature'], 401);
        } catch (\Exception $e) {
            Log::error("Stripe Webhook Error: " . $e->getMessage());
            return response()->json(['message' => 'Webhook handling failed'], 400);
        }
    }

    public function handlePaystack(Request $request)
    {
        $secretKey = SaaSSetting::where('key', 'paystack_secret_key')->value('value');
        $signature = $request->header('x-paystack-signature');

        if (!$signature || $signature !== hash_hmac('sha512', $request->getContent(), $secretKey)) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');
        if ($event === 'charge.success') {
            $data = $request->input('data');
            $tenantId = $data['metadata']['tenant_id'] ?? null;
            $type = $data['metadata']['type'] ?? 'subscription';
            
            if ($type === 'theme_purchase') {
                $templateId = $data['metadata']['template_id'] ?? null;
                if ($tenantId && $templateId) {
                    $this->fulfillThemePurchase($tenantId, $templateId, $data['amount'] / 100);
                }
            } elseif ($type === 'addon_purchase') {
                $addonId = $data['metadata']['addon_id'] ?? null;
                $quantity = $data['metadata']['quantity'] ?? 1;
                if ($tenantId && $addonId) {
                    $this->fulfillAddonPurchase($tenantId, $addonId, (int) $quantity);
                }
            } elseif ($type === 'reservation_deposit') {
                $reservationId = $data['metadata']['reservation_id'] ?? null;
                if ($tenantId && $reservationId) {
                    $this->fulfillReservationDeposit($tenantId, $reservationId, $data['reference'], 'paystack');
                }
            } else {
                $planSlug = $data['metadata']['plan_slug'] ?? null;
                $reference = $data['reference'];
                if ($tenantId && $planSlug) {
                    $this->updateTenantSubscription($tenantId, 'paystack', $reference, $planSlug);
                }
            }

            $this->recordRedemption((array) ($data['metadata'] ?? []), 'paystack', $data['reference'] ?? null, $this->redemptionScope($type), $tenantId);
        }

        return response()->json(['status' => 'success']);
    }

    public function handleFlutterwave(Request $request)
    {
        $secretHash = SaaSSetting::where('key', 'flutterwave_encryption_key')->value('value');
        $signature = $request->header('verif-hash');

        if (!$secretHash || $signature !== $secretHash) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $status = $request->input('status');
        if ($status === 'successful') {
            $data = $request->input('data');
            $tenantId = $data['meta']['tenant_id'] ?? null;
            $type = $data['meta']['type'] ?? 'subscription';
            
            if ($type === 'theme_purchase') {
                $templateId = $data['meta']['template_id'] ?? null;
                if ($tenantId && $templateId) {
                    $this->fulfillThemePurchase($tenantId, $templateId, $data['amount']);
                }
            } elseif ($type === 'addon_purchase') {
                $addonId = $data['meta']['addon_id'] ?? null;
                $quantity = $data['meta']['quantity'] ?? 1;
                if ($tenantId && $addonId) {
                    $this->fulfillAddonPurchase($tenantId, $addonId, (int) $quantity);
                }
            } elseif ($type === 'reservation_deposit') {
                $reservationId = $data['meta']['reservation_id'] ?? null;
                if ($tenantId && $reservationId) {
                    $this->fulfillReservationDeposit($tenantId, $reservationId, $data['id'], 'flutterwave');
                }
            } else {
                $planSlug = $data['meta']['plan_slug'] ?? null;
                $txRef = $data['tx_ref'];
                if ($tenantId && $planSlug) {
                    $this->updateTenantSubscription($tenantId, 'flutterwave', $txRef, $planSlug);
                }
            }

            $reference = $data['tx_ref'] ?? $data['id'] ?? null;
            $this->recordRedemption((array) ($data['meta'] ?? []), 'flutterwave', $reference ? (string) $reference : null, $this->redemptionScope($type), $tenantId);
        }

        return response()->json(['status' => 'success']);
    }

    public function handleDodo(Request $request)
    {
        $webhookSecret = SaaSSetting::where('key', 'dodo_webhook_secret')->value('value');
        $signature = $request->header('webhook-signature');
        $timestamp = $request->header('webhook-timestamp');
        $payload = $request->getContent();

        if (!$webhookSecret) {
            Log::error("Dodo Webhook Secret not configured.");
            return response()->json(['message' => 'Webhook secret missing'], 500);
        }

        if (!$signature || !$timestamp) {
            Log::error("Dodo Webhook missing required headers");
            return response()->json(['message' => 'Missing signature headers'], 401);
        }

        $signedPayload = "{$timestamp}.{$payload}";
        $expected = base64_encode(hash_hmac('sha256', $signedPayload, $webhookSecret, true));

        $parts = explode(',', $signature);
        $actual = trim(end($parts));

        if (!hash_equals($expected, $actual)) {
            Log::error("Dodo Webhook Invalid Signature");
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');
        if ($event === 'payment.completed') {
            $data = $request->input('data');
            $metadata = $data['metadata'] ?? [];
            $tenantId = $metadata['tenant_id'] ?? null;
            $type = $metadata['type'] ?? 'subscription';

            if ($type === 'theme_purchase') {
                $templateId = $metadata['template_id'] ?? null;
                if ($tenantId && $templateId) {
                    $this->fulfillThemePurchase($tenantId, $templateId, $data['amount'] / 100);
                }
            } elseif ($type === 'addon_purchase') {
                $addonId = $metadata['addon_id'] ?? null;
                $quantity = $metadata['quantity'] ?? 1;
                if ($tenantId && $addonId) {
                    $this->fulfillAddonPurchase($tenantId, $addonId, (int) $quantity);
                }
            } elseif ($type === 'reservation_deposit') {
                $reservationId = $metadata['reservation_id'] ?? null;
                if ($tenantId && $reservationId) {
                    $this->fulfillReservationDeposit($tenantId, $reservationId, $data['payment_id'], 'dodo');
                }
            } else {
                $planSlug = $metadata['plan_slug'] ?? null;
                $paymentId = $data['payment_id'] ?? null;
                if ($tenantId && $planSlug) {
                    $this->updateTenantSubscription($tenantId, 'dodo', $paymentId, $planSlug);
                }
            }

            $this->recordRedemption((array) $metadata, 'dodo', $data['payment_id'] ?? null, $this->redemptionScope($type), $tenantId);
        }

        return response()->json(['status' => 'success']);
    }

    public function handlePaddle(Request $request)
    {
        $webhookSecret = SaaSSetting::where('key', 'paddle_webhook_secret')->value('value');
        $signatureHeader = $request->header('Paddle-Signature') ?? $request->header('paddle-signature');
        $payload = $request->getContent();

        if (!$webhookSecret) {
            Log::error("Paddle Webhook Secret not configured in SaaS settings.");
            return response()->json(['message' => 'Webhook secret missing'], 500);
        }

        if (!$signatureHeader) {
            Log::error("Paddle Webhook missing Paddle-Signature header");
            return response()->json(['message' => 'Missing signature header'], 401);
        }

        // Parse Paddle-Signature (format: ts=...;h1=...)
        $ts = null;
        $h1 = null;
        foreach (explode(';', $signatureHeader) as $part) {
            $pair = explode('=', trim($part), 2);
            if (count($pair) === 2) {
                if ($pair[0] === 'ts') $ts = $pair[1];
                if ($pair[0] === 'h1') $h1 = $pair[1];
            }
        }

        if (!$ts || !$h1) {
            Log::error("Paddle Webhook invalid signature format");
            return response()->json(['message' => 'Invalid signature format'], 401);
        }

        // Replay attack check: verify timestamp within 5 minutes (300 seconds)
        if (abs(time() - (int) $ts) > 300) {
            Log::error("Paddle Webhook timestamp expired: ts={$ts}");
            return response()->json(['message' => 'Signature timestamp expired'], 401);
        }

        // Compute HMAC-SHA256 of ts:raw_payload
        $expectedHash = hash_hmac('sha256', "{$ts}:{$payload}", $webhookSecret);
        if (!hash_equals($expectedHash, $h1)) {
            Log::error("Paddle Webhook signature mismatch");
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event_type');
        $data = $request->input('data') ?? [];

        Log::info("Paddle Webhook received: {$event}", ['id' => $data['id'] ?? null]);

        try {
            switch ($event) {
                case 'customer.created':
                case 'customer.updated':
                    $this->handlePaddleCustomer($data);
                    break;

                case 'subscription.created':
                case 'subscription.activated':
                case 'subscription.updated':
                case 'subscription.canceled':
                case 'subscription.past_due':
                case 'subscription.paused':
                    $this->handlePaddleSubscription($data, $event);
                    break;

                case 'transaction.completed':
                case 'transaction.paid':
                    $this->handlePaddleTransaction($data);
                    break;

                default:
                    Log::info("Paddle Webhook unhandled event type: {$event}");
                    break;
            }
        } catch (\Throwable $e) {
            Log::error("Paddle Webhook handling error for {$event}: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Webhook processing failed: ' . $e->getMessage()], 500);
        }

        return response()->json(['status' => 'success']);
    }

    private function handlePaddleCustomer(array $data): void
    {
        $customerId = $data['id'] ?? null;
        if (!$customerId) return;

        $email = $data['email'] ?? null;
        $name = $data['name'] ?? null;
        $locale = $data['locale'] ?? null;
        $customData = $data['custom_data'] ?? [];
        $tenantId = $customData['tenant_id'] ?? null;

        if (!$tenantId && $email) {
            $tenantId = Tenant::where('owner_email', $email)->value('id');
        }

        PaddleCustomer::updateOrCreate(
            ['id' => $customerId],
            [
                'tenant_id' => $tenantId,
                'email' => $email ?? 'unknown@paddle.com',
                'name' => $name,
                'locale' => $locale,
            ]
        );

        Log::info("Mirrored Paddle customer: {$customerId} for tenant " . ($tenantId ?? 'unknown'));
    }

    private function handlePaddleSubscription(array $data, string $event): void
    {
        $subscriptionId = $data['id'] ?? null;
        if (!$subscriptionId) return;

        $customerId = $data['customer_id'] ?? null;
        $status = $data['status'] ?? 'active';
        $firstItem = $data['items'][0] ?? [];
        $priceId = $firstItem['price']['id'] ?? null;
        $productId = $firstItem['price']['product_id'] ?? null;
        $interval = $firstItem['price']['billing_cycle']['interval'] ?? 'month';

        $customData = $data['custom_data'] ?? [];
        $tenantId = $customData['tenant_id'] ?? null;
        $planSlug = $customData['plan_slug'] ?? null;

        // Dynamic plan resolution from database if plan_slug is not in custom_data
        if (!$planSlug && $priceId) {
            $matchedPlan = SubscriptionPlan::on('platform')
                ->where('paddle_monthly_price_id', $priceId)
                ->orWhere('paddle_yearly_price_id', $priceId)
                ->first();
            if ($matchedPlan) {
                $planSlug = $matchedPlan->slug;
            }
        }
        if (!$planSlug && $productId) {
            $matchedPlan = SubscriptionPlan::on('platform')
                ->where('paddle_product_id', $productId)
                ->first();
            if ($matchedPlan) {
                $planSlug = $matchedPlan->slug;
            }
        }

        // Resolve tenant if missing
        if (!$tenantId && $customerId) {
            $tenantId = PaddleCustomer::where('id', $customerId)->value('tenant_id');
        }
        if (!$tenantId) {
            $tenantId = Tenant::where('subscription_id', $subscriptionId)->value('id');
        }

        // Scheduled change
        $scheduledAction = $data['scheduled_change']['action'] ?? null;
        $scheduledAt = !empty($data['scheduled_change']['effective_at']) 
            ? \Carbon\Carbon::parse($data['scheduled_change']['effective_at']) 
            : null;

        // Billing period timestamps
        $startsAt = !empty($data['current_billing_period']['starts_at']) 
            ? \Carbon\Carbon::parse($data['current_billing_period']['starts_at']) 
            : null;
        $endsAt = !empty($data['current_billing_period']['ends_at']) 
            ? \Carbon\Carbon::parse($data['current_billing_period']['ends_at']) 
            : null;
        $canceledAt = !empty($data['canceled_at']) 
            ? \Carbon\Carbon::parse($data['canceled_at']) 
            : null;

        if ($event === 'subscription.canceled') {
            $status = 'canceled';
            if (!$canceledAt) {
                $canceledAt = now();
            }
        }

        // Idempotent upsert into mirrored table
        PaddleSubscription::updateOrCreate(
            ['id' => $subscriptionId],
            [
                'customer_id' => $customerId ?? 'ctm_unknown',
                'tenant_id' => $tenantId,
                'status' => $status,
                'price_id' => $priceId,
                'product_id' => $productId,
                'plan_slug' => $planSlug,
                'billing_interval' => $interval,
                'scheduled_change_action' => $scheduledAction,
                'scheduled_change_at' => $scheduledAt,
                'current_billing_period_starts_at' => $startsAt,
                'current_billing_period_ends_at' => $endsAt,
                'canceled_at' => $canceledAt,
            ]
        );

        // Synchronize tenant state
        $tenant = null;
        if ($tenantId) {
            $tenant = Tenant::find($tenantId);
        }
        if (!$tenant) {
            $tenant = Tenant::where('subscription_id', $subscriptionId)->first();
        }

        if ($tenant) {
            if ($planSlug) {
                $tenant->plan = $planSlug;
            }
            $tenant->subscription_id = $subscriptionId;
            $tenant->subscription_provider = 'paddle';

            // Access check rule:
            // Status active or trialing grants paid access.
            // When user cancels, Paddle status remains 'active' until effective date (scheduled_change.action = 'cancel').
            // We preserve active status until Paddle actually sends status 'canceled'.
            if (in_array($status, ['active', 'trialing'])) {
                $tenant->subscription_status = 'active';
            } elseif ($status === 'canceled') {
                $tenant->subscription_status = 'canceled';
            } elseif ($status === 'past_due') {
                $tenant->subscription_status = 'past_due';
            } elseif ($status === 'paused') {
                $tenant->subscription_status = 'paused';
            }

            if ($endsAt) {
                $tenant->subscription_ends_at = $endsAt;
            }
            $tenant->save();

            Log::info("Synchronized Paddle subscription {$subscriptionId} for tenant {$tenant->id} (plan: {$tenant->plan}, status: {$tenant->subscription_status})");
        }
    }

    private function handlePaddleTransaction(array $data): void
    {
        $customData = $data['custom_data'] ?? [];
        $tenantId = $customData['tenant_id'] ?? null;
        $type = $customData['type'] ?? 'subscription';

        if ($type === 'theme_purchase') {
            $templateId = $customData['template_id'] ?? null;
            $total = isset($data['details']['totals']['total']) ? ((float) $data['details']['totals']['total']) / 100 : 0;
            if ($tenantId && $templateId) {
                $this->fulfillThemePurchase($tenantId, $templateId, $total);
                $this->recordRedemption($customData, 'paddle', $data['id'] ?? null, 'theme', $tenantId);
            }
        } elseif ($type === 'addon_purchase') {
            $addonId = $customData['addon_id'] ?? null;
            $quantity = (int) ($customData['quantity'] ?? 1);
            if ($tenantId && $addonId) {
                $this->fulfillAddonPurchase($tenantId, $addonId, $quantity);
                $this->recordRedemption($customData, 'paddle', $data['id'] ?? null, 'addon', $tenantId);
            }
        } elseif ($type === 'reservation_deposit') {
            $reservationId = $customData['reservation_id'] ?? null;
            if ($tenantId && $reservationId) {
                $this->fulfillReservationDeposit($tenantId, $reservationId, $data['id'], 'paddle');
            }
        } else {
            // Subscription transaction
            $planSlug = $customData['plan_slug'] ?? null;
            $subId = $data['subscription_id'] ?? $data['id'];

            // If plan_slug not in custom_data, resolve dynamically from items
            if (!$planSlug && !empty($data['items'][0]['price']['id'])) {
                $priceId = $data['items'][0]['price']['id'];
                $matchedPlan = SubscriptionPlan::on('platform')
                    ->where('paddle_monthly_price_id', $priceId)
                    ->orWhere('paddle_yearly_price_id', $priceId)
                    ->first();
                if ($matchedPlan) {
                    $planSlug = $matchedPlan->slug;
                }
            }

            if ($tenantId && $planSlug) {
                $this->updateTenantSubscription($tenantId, 'paddle', $subId, $planSlug);
            }

            $this->recordRedemption(
                $customData,
                'paddle',
                $data['id'] ?? null,
                'subscription',
                $tenantId
            );
        }
    }

    private function redemptionScope(?string $type): string
    {
        return match ($type) {
            'theme_purchase' => 'theme',
            'addon_purchase' => 'addon',
            default => 'subscription',
        };
    }

    private function recordRedemption(array $customData, string $gateway, ?string $transactionId, string $scope, ?string $tenantId = null): void
    {
        try {
            $code = $customData['discount_code'] ?? $customData['coupon'] ?? $customData['promo_code'] ?? null;
            if (empty($code) || empty($tenantId) || empty($transactionId)) return;

            app(\App\Services\DiscountService::class)->recordRedemption(
                (string) $code,
                (string) $tenantId,
                $scope,
                $gateway,
                $transactionId
            );
        } catch (\Throwable $e) {
            Log::warning("Discount redemption recording failed: " . $e->getMessage());
        }
    }

    private function updateTenantSubscription($tenantId, $provider, $subscriptionId, $planSlug)
    {
        $tenant = Tenant::find($tenantId);
        if ($tenant) {
            $tenant->plan = $planSlug;
            $tenant->subscription_id = $subscriptionId;
            $tenant->subscription_provider = $provider;
            $tenant->subscription_status = 'active';
            $tenant->subscription_ends_at = now()->addMonth(); // Simplified
            $tenant->save();
            
            Log::info("Tenant {$tenantId} subscription updated via {$provider} to plan {$planSlug}");

            // Send Payment Success Email
            $template = \App\Models\EmailTemplate::where('slug', 'payment_success')->first();
            if ($template) {
                $platformName = \App\Models\SaaSSetting::get('platform_name', config('app.name'));
                $plan = \App\Models\SubscriptionPlan::where('slug', $planSlug)->first();
                
                $planName = $plan ? $plan->name : 'Premium';

                try {
                    \Illuminate\Support\Facades\Mail::to($tenant->owner_email)->send(new \App\Mail\SystemMail($template->subject, $template->content, [
                        'business_name' => $tenant->business_name,
                        'plan_name' => $planName,
                        'invoice_id' => $subscriptionId,
                        'amount' => 'Check Dashboard',
                        'platform_name' => $platformName
                    ]));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Failed to send payment success email to tenant {$tenantId}: " . $e->getMessage());
                }
            }
        }
    }

    private function fulfillThemePurchase($tenantId, $templateId, $amount)
    {
        $tenant = Tenant::find($tenantId);
        $template = \App\Models\WebsiteTemplate::find($templateId);

        if ($tenant && $template) {
            TenantResolver::set($tenant);
            \App\Models\TenantTheme::updateOrCreate(
                ['tenant_id' => $tenantId, 'website_template_id' => $templateId],
                ['purchased_at' => now(), 'price_paid' => $amount]
            );

            Log::info("Tenant {$tenantId} successfully purchased theme: {$template->name} ({$templateId})");

            // Optional: Send Theme Purchase Confirmation Email
            try {
                $platformName = \App\Models\SaaSSetting::get('platform_name', config('app.name'));
                $subject = "Theme Unlocked: Access your new design";
                $content = "Great news! You have successfully unlocked the '{$template->name}' theme in your {$platformName} Website Builder. It is now permanently available for all your business pages.";
                
                \Illuminate\Support\Facades\Mail::to($tenant->owner_email)->send(new \App\Mail\SystemMail($subject, $content));
            } catch (\Exception $e) {
                Log::error("Failed to send theme purchase email: " . $e->getMessage());
            }
        }
    }

    private function fulfillAddonPurchase($tenantId, $addonId, int $quantity)
    {
        $tenant = Tenant::find($tenantId);
        $addon = \App\Models\Addon::find($addonId);

        if ($tenant && $addon) {
            TenantResolver::set($tenant);
            $wasAlreadyActive = \App\Models\TenantAddon::where('tenant_id', $tenantId)
                ->where('addon_id', $addonId)
                ->where('status', 'active')
                ->exists();

            \App\Models\TenantAddon::updateOrCreate(
                ['tenant_id' => $tenantId, 'addon_id' => $addonId],
                [
                    'quantity' => $quantity,
                    'status' => 'active',
                    'started_at' => now(),
                ]
            );

            $features = $addon->features ?? [];
            $currentFeatures = $tenant->features ?? [];
            foreach ($features as $feature) {
                if (!in_array($feature, $currentFeatures)) {
                    $currentFeatures[] = $feature;
                }
            }
            $tenant->features = $currentFeatures;
            $tenant->save();

            Log::info("Tenant {$tenantId} purchased add-on: {$addon->name} ({$addonId})");

            if (!$wasAlreadyActive) {
                try {
                    $platformName = \App\Models\SaaSSetting::get('platform_name', config('app.name'));
                    $subject = "Add-on Activated: {$addon->name}";
                    $content = "Your {$addon->name} add-on has been activated on your {$platformName} account.";
                    \Illuminate\Support\Facades\Mail::to($tenant->owner_email)->send(new \App\Mail\SystemMail($subject, $content));
                } catch (\Exception $e) {
                    Log::error("Failed to send add-on purchase email: " . $e->getMessage());
                }
            }
        }
    }

    private function fulfillReservationDeposit($tenantId, $reservationId, $paymentId, $provider = 'stripe')
    {
        $tenant = Tenant::find($tenantId);
        if (!$tenant) return;

        // Switch to tenant context to update the reservation
        $tenant->run(function () use ($reservationId, $paymentId, $provider) {
            $reservation = \App\Models\Reservation::find($reservationId);
            if ($reservation) {
                $reservation->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed',
                    'stripe_payment_id' => $paymentId,
                    'payment_method' => $provider
                ]);

                Log::info("Reservation {$reservationId} deposit fulfilled for tenant " . tenant('id'));

                // Notify guest
                // (Logic for automated confirmation email/SMS could go here)
            }
        });
    }
}
