<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\VoiceAgentPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminVoiceAgentPlanController extends Controller
{
    public function index(): JsonResponse
    {
        $plans = VoiceAgentPlan::orderBy('sort_order')->orderBy('monthly_price')->get();

        return response()->json(['plans' => $plans]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'plan_name' => 'required|string|max:255',
            'plan_description' => 'nullable|string',
            'monthly_price' => 'required|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'currency' => 'string|size:3',
            'trial_days' => 'integer|min:0',
            'included_minutes_monthly' => 'required|integer|min:0',
            'included_minutes_yearly' => 'nullable|integer|min:0',
            'extra_minute_rate' => 'required|numeric|min:0',
            'max_call_duration_minutes' => 'nullable|integer|min:0',
            'max_calls_per_month' => 'nullable|integer|min:0',
            'features' => 'nullable|array',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $plan = VoiceAgentPlan::create($validator->validated());

        return response()->json([
            'message' => 'Plan created',
            'plan' => $plan,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $plan = VoiceAgentPlan::findOrFail($id);

        return response()->json(['plan' => $plan]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $plan = VoiceAgentPlan::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'plan_name' => 'string|max:255',
            'plan_description' => 'nullable|string',
            'monthly_price' => 'numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'currency' => 'string|size:3',
            'trial_days' => 'integer|min:0',
            'included_minutes_monthly' => 'integer|min:0',
            'included_minutes_yearly' => 'nullable|integer|min:0',
            'extra_minute_rate' => 'numeric|min:0',
            'max_call_duration_minutes' => 'nullable|integer|min:0',
            'max_calls_per_month' => 'nullable|integer|min:0',
            'features' => 'nullable|array',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $plan->update($validator->validated());

        return response()->json([
            'message' => 'Plan updated',
            'plan' => $plan->fresh(),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $plan = VoiceAgentPlan::findOrFail($id);

        $subscriptionCount = $plan->subscriptions()->count();
        if ($subscriptionCount > 0) {
            $plan->update(['is_active' => false]);
            return response()->json(['message' => 'Plan has active subscriptions, deactivated instead']);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan deleted']);
    }
}
