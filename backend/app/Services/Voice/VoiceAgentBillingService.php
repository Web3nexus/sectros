<?php

namespace App\Services\Voice;

use App\Models\VoiceAgentSubscription;
use App\Models\VoiceAgentUsage;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class VoiceAgentBillingService
{
    public function createSubscription($tenantId, $plan, string $billingInterval = 'monthly'): VoiceAgentSubscription
    {
        $now = Carbon::now();
        $trialDays = $plan->trial_days ?? 7;
        $trialEnd = $now->copy()->addDays($trialDays);

        $includedMinutes = $billingInterval === 'yearly'
            ? ($plan->included_minutes_yearly ?? $plan->included_minutes_monthly * 12)
            : $plan->included_minutes_monthly;

        return VoiceAgentSubscription::create([
            'tenant_id' => $tenantId,
            'plan_id' => $plan->id,
            'plan_name_snapshot' => $plan->plan_name,
            'billing_interval' => $billingInterval,
            'status' => 'trial',
            'trial_started_at' => $now,
            'trial_ends_at' => $trialEnd,
            'current_period_start' => $now,
            'current_period_end' => $trialEnd,
            'included_minutes_snapshot' => $includedMinutes,
            'extra_minute_rate_snapshot' => $plan->extra_minute_rate,
        ]);
    }

    public function getOrCreateMonthlyUsage($tenantId, $subscription): VoiceAgentUsage
    {
        $billingMonth = Carbon::now()->format('Y-m');

        $usage = VoiceAgentUsage::where('tenant_id', $tenantId)
            ->where('billing_month', $billingMonth)
            ->first();

        if (!$usage) {
            $usage = VoiceAgentUsage::create([
                'tenant_id' => $tenantId,
                'billing_month' => $billingMonth,
                'included_minutes' => $subscription->included_minutes_snapshot,
                'used_minutes' => 0,
                'remaining_minutes' => $subscription->included_minutes_snapshot,
                'extra_minutes' => 0,
                'extra_minute_rate' => $subscription->extra_minute_rate_snapshot,
                'estimated_extra_charge' => 0,
            ]);
        }

        return $usage;
    }

    public function recordUsage($tenantId, int $secondsUsed): VoiceAgentUsage
    {
        if ($secondsUsed < 0) {
            throw new \InvalidArgumentException('Call duration cannot be negative');
        }

        $subscription = VoiceAgentSubscription::where('tenant_id', $tenantId)->first();

        if (!$subscription) {
            throw new \Exception('No active subscription found for tenant');
        }

        return DB::transaction(function () use ($tenantId, $subscription, $secondsUsed) {
            $billingMonth = Carbon::now()->format('Y-m');
            $usage = VoiceAgentUsage::where('tenant_id', $tenantId)
                ->where('billing_month', $billingMonth)
                ->lockForUpdate()
                ->first();

            if (!$usage) {
                $usage = VoiceAgentUsage::create([
                    'tenant_id' => $tenantId,
                    'billing_month' => $billingMonth,
                    'included_minutes' => $subscription->included_minutes_snapshot,
                    'used_minutes' => 0,
                    'remaining_minutes' => $subscription->included_minutes_snapshot,
                    'extra_minutes' => 0,
                    'extra_minute_rate' => $subscription->extra_minute_rate_snapshot,
                    'estimated_extra_charge' => 0,
                ]);
            }

            $minutesUsed = max(1, ceil($secondsUsed / 60));
            $usage->used_minutes += $minutesUsed;

            if ($usage->used_minutes <= $usage->included_minutes) {
                $usage->remaining_minutes = $usage->included_minutes - $usage->used_minutes;
                $usage->extra_minutes = 0;
            } else {
                $usage->remaining_minutes = 0;
                $usage->extra_minutes = $usage->used_minutes - $usage->included_minutes;
            }

            $usage->estimated_extra_charge = $usage->extra_minutes * $usage->extra_minute_rate;
            $usage->save();

            return $usage;
        });
    }
}
