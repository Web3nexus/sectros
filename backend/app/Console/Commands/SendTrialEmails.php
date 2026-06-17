<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Models\EmailTemplate;
use App\Models\SaaSSetting;
use App\Models\User;
use App\Mail\SystemMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendTrialEmails extends Command
{
    protected $signature = 'trial:send-emails';
    protected $description = 'Send trial reminder emails to tenants based on their trial period';

    public function handle()
    {
        $trialDays = (int) SaaSSetting::get('trial_days', 14);
        $platformName = SaaSSetting::get('platform_name', config('app.name'));
        $centralDomain = SaaSSetting::get('central_domain', config('tenancy.central_domains')[0] ?? 'sectrosweb.test');

        // Get all active tenants who are on free plan with a trial_ends_at value
        $tenants = Tenant::where('plan', 'free')
            ->whereNotNull('trial_ends_at')
            ->where('status', 'active')
            ->get();

        $sent = 0;

        foreach ($tenants as $tenant) {
            $now = now();
            $trialEnd = $tenant->trial_ends_at;

            if (!$trialEnd || $now->greaterThan($trialEnd)) {
                continue;
            }

            $daysRemaining = $now->diffInDays($trialEnd);
            $totalDays = $now->diffInDays($trialEnd->copy()->subDays($trialDays)) ?: $trialDays;
            $daysElapsed = $trialDays - $daysRemaining;

            $owner = User::on('tenant')
                ->where('tenant_id', $tenant->id)
                ->where('email', $tenant->owner_email)
                ->first();

            if (!$owner) {
                continue;
            }

            $domain = $tenant->domains()->first()?->domain;
            $pricingUrl = $domain
                ? "https://{$domain}/billing"
                : url('/pricing');

            $commonData = [
                'name' => $owner->name,
                'platform_name' => $platformName,
                'trial_days' => (string) $trialDays,
                'trial_end_date' => $trialEnd->format('F j, Y'),
                'days_remaining' => (string) $daysRemaining,
                'pricing_url' => $pricingUrl,
            ];

            // Determine which email to send based on days elapsed
            $slug = null;

            if ($daysElapsed === 0) {
                // Day 1: trial_started (already sent via welcome email, skip)
                continue;
            } elseif ($daysRemaining === 1) {
                // Last day: trial_ending
                $slug = 'trial_ending';
            } elseif ($daysRemaining <= 2) {
                // Within 2 days of ending: trial_ending
                $slug = 'trial_ending';
            } elseif ((int) round($daysElapsed) === (int) round($trialDays / 2) || $daysElapsed >= ($trialDays / 2) && $daysElapsed < ($trialDays / 2 + 1)) {
                // Midpoint: trial_midpoint
                $slug = 'trial_midpoint';
            } else {
                continue;
            }

            try {
                $template = EmailTemplate::where('slug', $slug)->first();
                if (!$template) {
                    Log::warning("Trial email template '{$slug}' not found");
                    continue;
                }

                Mail::to($owner->email)->send(new SystemMail(
                    $template->subject,
                    $template->content,
                    $commonData
                ));

                $sent++;
                Log::info("Trial email '{$slug}' sent to {$owner->email} for tenant {$tenant->id}");
            } catch (\Exception $e) {
                Log::error("Failed to send trial email '{$slug}' to {$owner->email}: " . $e->getMessage());
            }
        }

        $this->info("Sent {$sent} trial notification emails.");
        return Command::SUCCESS;
    }
}
