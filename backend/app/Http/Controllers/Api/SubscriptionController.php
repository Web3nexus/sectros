<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Services\PaymentService;
use App\Services\SMSService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    /**
     * Get all available subscription plans.
     */
    public function getPlans()
    {
        try {
            $currentTenant = function_exists('tenant') ? tenant() : null;
            $tenantPlan = $currentTenant?->plan ?? 'free';

            $plans = SubscriptionPlan::on('platform')
                ->where('is_active', true)
                ->orderBy('monthly_price', 'asc')
                ->get()
                ->map(function ($p) use ($tenantPlan) {
                    return [
                        'id'          => $p->id,
                        'name'        => $p->name,
                        'slug'        => $p->slug,
                        'description' => $p->description ?? ($p->name . ' tier for hospitality teams'),
                        'price'       => (float) ($p->monthly_price ?? $p->price_monthly ?? 0),
                        'interval'    => 'month',
                        'features'    => (array) ($p->features ?? []),
                        'is_current'  => strtolower($p->slug) === strtolower($tenantPlan),
                        'sms_credits_limit' => $p->sms_credits_limit ?? 0,
                        'ai_credits_limit'  => $p->ai_credits_limit ?? 0,
                    ];
                });

            $currentPlan = $plans->firstWhere('is_current', true) ?? $plans->first();

            try {
                $smsCredits = SMSService::getCreditsArray();
            } catch (\Throwable $smsErr) {
                \Illuminate\Support\Facades\Log::warning('SMSService::getCreditsArray failed: ' . $smsErr->getMessage());
                $smsCredits = ['used' => 0, 'limit' => 0, 'topup' => 0];
            }

            $usage = [
                'plan_name'        => $currentPlan['name'] ?? 'Free',
                'plan_slug'        => $tenantPlan,
                'status'           => $currentTenant?->subscription_status ?? 'active',
                'ai_credits_used'  => $currentTenant?->ai_credits_used ?? 0,
                'ai_credits_topup' => $currentTenant?->ai_credits_topup ?? 0,
                'sms_credits'      => $smsCredits,
                'ends_at'          => $currentTenant?->subscription_ends_at ?? null,
            ];

            return response()->json([
                'plans'        => $plans,
                'current_plan' => $currentPlan,
                'usage'        => $usage,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('getPlans error: ' . $e->getMessage());
            return response()->json([
                'plans'        => [],
                'current_plan' => null,
                'usage'        => [
                    'plan_name'        => 'Free',
                    'plan_slug'        => 'free',
                    'status'           => 'active',
                    'ai_credits_used'  => 0,
                    'ai_credits_topup' => 0,
                    'sms_credits'      => ['used' => 0, 'limit' => 0, 'topup' => 0],
                    'ends_at'          => null,
                ],
            ]);
        }
    }

    /**
     * Get the current subscription status for the authenticated user's tenant.
     * Uses tenant() helper because Auth::user() in a tenant context has no central tenant_id.
     */
    public function currentStatus(Request $request)
    {
        // Get the active tenant from the tenancy context (set by domain middleware).
        $currentTenant = tenant();

        if (!$currentTenant) {
            return response()->json(['message' => 'Could not identify tenant context.'], 422);
        }

        $plan = SubscriptionPlan::on('platform')->where('slug', $currentTenant->plan)->first();

        $salesEmail = \App\Models\SaaSSetting::on('platform')->where('key', 'sales_email')->value('value') ?? 'sales@sectros.com';

        return response()->json([
            'plan_name'         => $plan ? $plan->name : 'Free',
            'plan_slug'         => $currentTenant->plan ?? 'free',
            'status'            => $currentTenant->subscription_status ?? 'active',
            'provider'          => $currentTenant->subscription_provider ?? null,
            'ends_at'           => $currentTenant->subscription_ends_at ?? null,
            'country'           => $currentTenant->country ?? null,
            'ai_credits_limit'  => $plan?->ai_credits_limit,
            'ai_credits_used'   => $currentTenant->ai_credits_used ?? 0,
            'ai_credits_topup'  => $currentTenant->ai_credits_topup ?? 0,
            'sales_email'       => $salesEmail,
            'is_testing'        => $currentTenant->is_testing ?? false,
            'testing_ends_at'   => $currentTenant->testing_ends_at ?? null,
            'sms_credits'       => (function () {
                try { return SMSService::getCreditsArray(); }
                catch (\Throwable $e) { return ['used' => 0, 'limit' => 0, 'topup' => 0]; }
            })(),
        ]);
    }

    /**
     * Initialize a payment session or plan switch.
     */
    public function subscribe(Request $request, PaymentService $paymentService)
    {
        $planSlug = $request->input('plan_slug');
        if (!$planSlug && $request->filled('plan_id')) {
            $p = SubscriptionPlan::on('platform')->find($request->input('plan_id'));
            $planSlug = $p?->slug;
        }

        if (!$planSlug) {
            return response()->json(['message' => 'Please provide a valid plan.'], 422);
        }

        $currentTenant = tenant();
        if (!$currentTenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        if ($request->filled('country')) {
            $currentTenant->country = strtoupper($request->country);
            $currentTenant->save();
        }

        $plan = SubscriptionPlan::on('platform')->where('slug', $planSlug)->first();
        if (!$plan) {
            return response()->json(['message' => 'Plan not found.'], 404);
        }

        // Direct switch for free plan
        if ((float)($plan->price_monthly ?? 0) <= 0) {
            $currentTenant->update([
                'plan' => $plan->slug,
                'subscription_status' => 'active',
            ]);
            return response()->json([
                'message' => "Successfully switched to {$plan->name} plan.",
                'checkout_url' => null,
                'status' => 'success',
            ]);
        }

        $interval = $request->input('interval', 'monthly');
        if ($interval === 'month') $interval = 'monthly';
        if ($interval === 'year') $interval = 'yearly';

        try {
            $paymentInfo = $paymentService->initializePayment($currentTenant, $plan, $interval);
            $url = $paymentInfo['checkout_url'] ?? $paymentInfo['payment_url'] ?? $paymentInfo['url'] ?? null;
            return response()->json(array_merge($paymentInfo, [
                'checkout_url' => $url,
            ]));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Purchase additional AI credits (Top-up).
     */
    public function purchaseCredits(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $currentTenant = tenant();

        if (!$currentTenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        // Logic here would normally involve a payment check
        $currentTenant->increment('ai_credits_topup', $request->amount);

        return response()->json([
            'message'          => "Successfully purchased {$request->amount} AI credits.",
            'ai_credits_topup' => $currentTenant->ai_credits_topup
        ]);
    }

    /**
     * Purchase additional SMS credits (Top-up).
     */
    public function purchaseSmsCredits(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $currentTenant = tenant();

        if (!$currentTenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        // Logic here would normally involve a payment check
        $currentTenant->increment('sms_credits_topup', $request->amount);

        return response()->json([
            'message'             => "Successfully purchased {$request->amount} SMS credits.",
            'sms_credits_topup'   => $currentTenant->sms_credits_topup,
            'credits'             => SMSService::getCreditsArray(),
        ]);
    }
}
