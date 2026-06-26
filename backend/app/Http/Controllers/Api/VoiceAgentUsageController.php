<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VoiceAgentUsage;
use App\Models\VoiceAgentSubscription;
use App\Models\VoiceAgentCall;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoiceAgentUsageController extends Controller
{
    public function index(): JsonResponse
    {
        $tenantId = tenant('id');
        $usageRecords = VoiceAgentUsage::where('tenant_id', $tenantId)
            ->orderBy('billing_month', 'desc')
            ->paginate(50);

        return response()->json($usageRecords);
    }

    public function current(): JsonResponse
    {
        $tenantId = tenant('id');
        $now = now();
        $currentMonth = $now->format('Y-m');

        $subscription = VoiceAgentSubscription::where('tenant_id', $tenantId)->first();
        $usage = VoiceAgentUsage::where('tenant_id', $tenantId)
            ->where('billing_month', $currentMonth)
            ->first();

        $startOfMonth = $now->copy()->startOfMonth()->toDateString();
        $endOfMonth = $now->copy()->endOfMonth()->toDateString();

        $totalCallsThisMonth = VoiceAgentCall::where('tenant_id', $tenantId)
            ->whereDate('call_started_at', '>=', $startOfMonth)
            ->whereDate('call_started_at', '<=', $endOfMonth)
            ->count();

        $avgDuration = VoiceAgentCall::where('tenant_id', $tenantId)
            ->whereDate('call_started_at', '>=', $startOfMonth)
            ->whereDate('call_started_at', '<=', $endOfMonth)
            ->whereNotNull('call_duration_seconds')
            ->avg('call_duration_seconds');

        return response()->json([
            'subscription' => $subscription?->load('plan'),
            'usage' => $usage,
            'total_calls_this_month' => $totalCallsThisMonth,
            'average_call_duration_seconds' => round($avgDuration ?? 0),
        ]);
    }
}
