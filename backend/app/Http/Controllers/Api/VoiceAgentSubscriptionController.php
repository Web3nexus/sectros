<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VoiceAgentPlan;
use App\Models\VoiceAgentSubscription;
use App\Services\Voice\VoiceAgentBillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoiceAgentSubscriptionController extends Controller
{
    protected VoiceAgentBillingService $billingService;

    public function __construct(VoiceAgentBillingService $billingService)
    {
        $this->billingService = $billingService;
    }

    public function current(): JsonResponse
    {
        $tenantId = tenant('id');
        $subscription = VoiceAgentSubscription::where('tenant_id', $tenantId)->first();

        return response()->json([
            'subscription' => $subscription?->load('plan'),
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|integer',
            'billing_interval' => 'in:monthly,yearly',
        ]);

        $plan = VoiceAgentPlan::on('platform')->find($validated['plan_id']);
        if (!$plan) {
            return response()->json(['message' => 'Invalid plan'], 422);
        }

        $tenantId = tenant('id');
        $existingSubscription = VoiceAgentSubscription::where('tenant_id', $tenantId)->first();

        if ($existingSubscription && $existingSubscription->status !== 'cancelled') {
            return response()->json(['message' => 'Already has an active subscription'], 422);
        }

        if (!$plan->is_active) {
            return response()->json(['message' => 'Plan is not available'], 422);
        }

        $subscription = $this->billingService->createSubscription(
            $tenantId,
            $plan,
            $validated['billing_interval'] ?? 'monthly'
        );

        return response()->json([
            'message' => 'Subscribed successfully',
            'subscription' => $subscription->load('plan'),
        ], 201);
    }

    public function cancel(): JsonResponse
    {
        $tenantId = tenant('id');
        $subscription = VoiceAgentSubscription::where('tenant_id', $tenantId)->firstOrFail();

        $subscription->cancel_at_period_end = true;
        $subscription->cancelled_at = now();
        $subscription->save();

        return response()->json(['message' => 'Subscription will be cancelled at end of billing period']);
    }

    public function plans(): JsonResponse
    {
        $plans = VoiceAgentPlan::on('platform')->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('monthly_price')
            ->get();

        return response()->json(['plans' => $plans]);
    }
}
