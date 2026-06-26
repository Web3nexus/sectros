<?php

namespace App\Services\Voice;

use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class VoiceAgentCreditService
{
    public static function checkAndConsumeCredit($tenant, int $minutes = 1): bool
    {
        if (!$tenant) return false;

        if ($tenant->voice_credits_reset_at && $tenant->voice_credits_reset_at->isPast()) {
            $tenant->voice_credits_used = 0;
            $tenant->voice_credits_reset_at = now()->addMonth()->startOfMonth();
            $tenant->save();
        } elseif (!$tenant->voice_credits_reset_at) {
            $tenant->voice_credits_reset_at = now()->addMonth()->startOfMonth();
            $tenant->save();
        }

        $plan = SubscriptionPlan::where('slug', $tenant->plan ?? 'free')->first();
        $monthlyLimit = $plan ? $plan->voice_credits_limit : 0;
        $totalLimit = $monthlyLimit + ($tenant->voice_credits_topup ?? 0);

        if ($totalLimit === 0) {
            Log::warning("Voice credits exhausted for tenant {$tenant->id}");
            self::notifyCreditStatus($tenant, 'empty');
            return false;
        }

        $needed = $minutes;

        $availableFromMonthly = max(0, $monthlyLimit - ($tenant->voice_credits_used ?? 0));
        $availableFromTopup = $tenant->voice_credits_topup ?? 0;

        if ($availableFromMonthly + $availableFromTopup < $needed) {
            self::notifyCreditStatus($tenant, 'empty');
            Log::warning("Voice credits insufficient for tenant {$tenant->id}: need {$needed}, have " . ($availableFromMonthly + $availableFromTopup));
            return false;
        }

        $toUseFromMonthly = min($needed, $availableFromMonthly);
        $toUseFromTopup = $needed - $toUseFromMonthly;

        if ($toUseFromMonthly > 0) {
            $tenant->increment('voice_credits_used', $toUseFromMonthly);
        }
        if ($toUseFromTopup > 0) {
            $tenant->decrement('voice_credits_topup', $toUseFromTopup);
        }

        $tenant->refresh();

        $remaining = $availableFromMonthly - $toUseFromMonthly + ($tenant->voice_credits_topup ?? 0);
        if ($totalLimit > 0 && ($remaining / $totalLimit) <= 0.1) {
            self::notifyCreditStatus($tenant, 'low');
        }

        return true;
    }

    public static function getCreditsArray()
    {
        $tenant = tenant();
        if (!$tenant) return null;

        $plan = SubscriptionPlan::where('slug', $tenant->plan ?? 'free')->first();

        $monthlyLimit = $plan ? $plan->voice_credits_limit : 0;
        $used = $tenant->voice_credits_used ?? 0;
        $topup = $tenant->voice_credits_topup ?? 0;
        $remainingFromMonthly = max(0, $monthlyLimit - $used);

        return [
            'used' => $used,
            'limit' => $monthlyLimit,
            'topup' => $topup,
            'remaining' => $remainingFromMonthly + $topup,
            'total' => $monthlyLimit + $topup,
        ];
    }

    private static function notifyCreditStatus($tenant, string $status): void
    {
        $cacheKey = "voice_credits_notify_{$tenant->id}_{$status}";
        if (Cache::has($cacheKey)) return;

        $title = $status === 'low' ? 'Voice Agent Credits Low' : 'Voice Agent Credits Exhausted';
        $message = $status === 'low'
            ? 'You have less than 10% of your voice agent credits remaining. Top up to avoid interruption.'
            : 'Your voice agent credits have run out. Incoming calls will not be answered. Top up to resume service.';

        \App\Http\Controllers\Api\NotificationController::dispatch(
            'voice_credits',
            $title,
            $message,
            'phone'
        );

        Cache::put($cacheKey, true, now()->addDay());
    }
}
