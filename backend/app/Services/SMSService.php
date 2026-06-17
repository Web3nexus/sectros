<?php

namespace App\Services;

use App\Models\SaaSSetting;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class SMSService
{
    /**
     * Send an SMS message using Twilio, consuming one SMS credit.
     * Returns false if credits exhausted or Twilio fails.
     */
    public static function send($to, $message)
    {
        $sid = SaaSSetting::where('key', 'twilio_sid')->value('value');
        $token = SaaSSetting::where('key', 'twilio_auth_token')->value('value');
        $from = SaaSSetting::where('key', 'twilio_from_number')->value('value');

        if (!$sid || !$token || !$from) {
            Log::error("SMS Service: Twilio credentials not configured.");
            return false;
        }

        $tenant = tenant();
        if ($tenant && !self::checkAndConsumeCredit($tenant)) {
            return false;
        }

        try {
            $client = new Client($sid, $token);
            $client->messages->create($to, [
                'from' => $from,
                'body' => $message
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error("SMS Service Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if tenant has SMS credits available and consume one.
     */
    private static function checkAndConsumeCredit($tenant): bool
    {
        if (!$tenant) return true;

        if ($tenant->sms_credits_reset_at && $tenant->sms_credits_reset_at->isPast()) {
            $tenant->sms_credits_used = 0;
            $tenant->sms_credits_reset_at = now()->addMonth()->startOfMonth();
        } elseif (!$tenant->sms_credits_reset_at) {
            $tenant->sms_credits_reset_at = now()->addMonth()->startOfMonth();
        }

        $plan = SubscriptionPlan::where('slug', $tenant->plan ?? 'free')->first();
        $monthlyLimit = $plan ? $plan->sms_credits_limit : 0;
        $totalLimit = $monthlyLimit + ($tenant->sms_credits_topup ?? 0);

        if ($totalLimit === 0) {
            Log::warning("SMS credits exhausted for tenant {$tenant->id}");
            self::notifyCreditStatus($tenant, 'empty');
            return false;
        }

        if ($tenant->sms_credits_used < $monthlyLimit) {
            $tenant->increment('sms_credits_used');
        } elseif ($tenant->sms_credits_topup > 0) {
            $tenant->decrement('sms_credits_topup');
        } else {
            self::notifyCreditStatus($tenant, 'empty');
            Log::warning("SMS credits exhausted for tenant {$tenant->id}");
            return false;
        }

        $remaining = ($monthlyLimit - $tenant->sms_credits_used) + ($tenant->sms_credits_topup ?? 0);
        if ($totalLimit > 0 && ($remaining / $totalLimit) <= 0.1) {
            self::notifyCreditStatus($tenant, 'low');
        }

        return true;
    }

    private static function notifyCreditStatus($tenant, string $status): void
    {
        $cacheKey = "sms_notify_{$tenant->id}_{$status}";
        if (Cache::has($cacheKey)) return;

        $title = $status === 'low' ? 'SMS Credits Low (10%)' : 'SMS Credits Exhausted';
        $message = $status === 'low'
            ? 'You have less than 10% of your SMS credits remaining. Top up to avoid interruption.'
            : 'Your SMS credits have run out. Reservation and waitlist notifications are paused. Top up to resume.';

        \App\Http\Controllers\Api\NotificationController::dispatch(
            'sms_limit',
            $title,
            $message,
            'bot'
        );

        Cache::put($cacheKey, true, now()->addDay());
    }

    /**
     * Return current SMS credit state for the tenant.
     */
    public static function getCreditsArray()
    {
        $tenant = tenant();
        if (!$tenant) return null;

        $plan = SubscriptionPlan::where('slug', $tenant->plan ?? 'free')->first();

        return [
            'used' => $tenant->sms_credits_used ?? 0,
            'limit' => $plan ? $plan->sms_credits_limit : 0,
            'topup' => $tenant->sms_credits_topup ?? 0,
        ];
    }
}
