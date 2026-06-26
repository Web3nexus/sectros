<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use App\Models\WebhookEvent;
use App\Models\WebhookEndpoint;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UsageMonitorService
{
    public function recordApiCall(string $tenantId, string $endpoint, int $statusCode, int $durationMs): void
    {
        $dateKey = now()->format('Y-m-d');
        $hourKey = now()->format('Y-m-d-H');

        $this->incrementCounter("api_usage:{$tenantId}:{$dateKey}:total");
        $this->incrementCounter("api_usage:{$tenantId}:{$hourKey}:total");

        if ($statusCode >= 400) {
            $this->incrementCounter("api_usage:{$tenantId}:{$dateKey}:errors");
        }

        Cache::put("api_usage:{$tenantId}:{$hourKey}:last_endpoint", $endpoint, 3600);
        Cache::put("api_usage:{$tenantId}:{$hourKey}:last_status", $statusCode, 3600);
    }

    public function getTenantUsage(string $tenantId, ?string $date = null): array
    {
        $date = $date ?? now()->format('Y-m-d');
        $plan = $this->getTenantPlan($tenantId);
        $limits = $this->getPlanLimits($plan);

        $totalCalls = Cache::get("api_usage:{$tenantId}:{$date}:total", 0);
        $errors = Cache::get("api_usage:{$tenantId}:{$date}:errors", 0);

        $webhookDelivered = WebhookEvent::forTenant($tenantId)
            ->whereDate('created_at', $date)
            ->successful()
            ->count();

        $webhookFailed = WebhookEvent::forTenant($tenantId)
            ->whereDate('created_at', $date)
            ->failed()
            ->count();

        return [
            'date' => $date,
            'api_calls' => [
                'total' => $totalCalls,
                'errors' => $errors,
                'success_rate' => $totalCalls > 0 ? round((($totalCalls - $errors) / $totalCalls) * 100, 2) : 100,
            ],
            'webhooks' => [
                'delivered' => $webhookDelivered,
                'failed' => $webhookFailed,
                'total' => $webhookDelivered + $webhookFailed,
                'success_rate' => ($webhookDelivered + $webhookFailed) > 0
                    ? round(($webhookDelivered / ($webhookDelivered + $webhookFailed)) * 100, 2)
                    : 100,
            ],
            'limits' => $limits,
            'usage_percent' => $limits['api_calls_limit'] > 0
                ? round(($totalCalls / $limits['api_calls_limit']) * 100, 2)
                : 0,
        ];
    }

    public function getTenantUsageSummary(string $tenantId, int $days = 30): array
    {
        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $data[] = $this->getTenantUsage($tenantId, $date);
        }

        $totals = [
            'total_api_calls' => array_sum(array_column($data, 'api_calls.total')),
            'total_api_errors' => array_sum(array_column($data, 'api_calls.errors')),
            'total_webhooks_delivered' => array_sum(array_column($data, 'webhooks.delivered')),
            'total_webhooks_failed' => array_sum(array_column($data, 'webhooks.failed')),
        ];

        return [
            'daily' => $data,
            'totals' => $totals,
            'average_daily_api_calls' => $days > 0 ? round($totals['total_api_calls'] / $days, 1) : 0,
        ];
    }

    public function getSystemOverview(): array
    {
        $today = now()->format('Y-m-d');
        $hourKey = now()->format('Y-m-d-H');

        $activeTenants = Tenant::where('status', 'active')->count();
        $totalEndpoints = WebhookEndpoint::count();
        $activeEndpoints = WebhookEndpoint::active()->count();

        $todayDelivered = WebhookEvent::whereDate('created_at', $today)->successful()->count();
        $todayFailed = WebhookEvent::whereDate('created_at', $today)->failed()->count();
        $todayTotal = WebhookEvent::whereDate('created_at', $today)->count();

        $failedEndpoints = WebhookEndpoint::where('failure_count', '>', 10)
            ->where('is_active', true)
            ->count();

        $peakApiCalls = 0;
        $peakHour = null;
        for ($h = 0; $h < 24; $h++) {
            $key = now()->format('Y-m-d') . '-' . str_pad((string)$h, 2, '0', STR_PAD_LEFT);
            $count = Tenant::all()->reduce(function ($carry, $tenant) use ($key) {
                return $carry + Cache::get("api_usage:{$tenant->id}:{$key}:total", 0);
            }, 0);

            if ($count > $peakApiCalls) {
                $peakApiCalls = $count;
                $peakHour = $h;
            }
        }

        return [
            'timestamp' => now()->toIso8601String(),
            'active_tenants' => $activeTenants,
            'webhook_endpoints' => [
                'total' => $totalEndpoints,
                'active' => $activeEndpoints,
                'failing' => $failedEndpoints,
            ],
            'today_webhooks' => [
                'total' => $todayTotal,
                'delivered' => $todayDelivered,
                'failed' => $todayFailed,
                'success_rate' => $todayTotal > 0
                    ? round(($todayDelivered / $todayTotal) * 100, 2)
                    : 100,
            ],
            'peak_hour' => $peakHour !== null ? "{$peakHour}:00" : null,
            'peak_calls_in_hour' => $peakApiCalls,
        ];
    }

    public function checkRateLimit(string $tenantId, string $identifier, int $maxRequests, int $decayMinutes = 1): bool
    {
        $key = "rate_limit:{$tenantId}:{$identifier}:" . now()->format('Y-m-d-H-i');
        $count = Cache::get($key, 0);

        if ($count >= $maxRequests) {
            return false;
        }

        Cache::put($key, $count + 1, now()->addMinutes($decayMinutes));
        return true;
    }

    public function enforceQuota(string $tenantId): array
    {
        $plan = $this->getTenantPlan($tenantId);
        $limits = $this->getPlanLimits($plan);
        $usage = $this->getTenantUsage($tenantId);

        $exceeded = [];

        if ($limits['api_calls_limit'] > 0 && $usage['api_calls']['total'] >= $limits['api_calls_limit']) {
            $exceeded[] = 'api_calls';
        }

        if ($limits['webhook_events_limit'] > 0) {
            $webhookTotal = $usage['webhooks']['total'];
            if ($webhookTotal >= $limits['webhook_events_limit']) {
                $exceeded[] = 'webhook_events';
            }
        }

        return [
            'within_limits' => empty($exceeded),
            'exceeded' => $exceeded,
            'usage' => $usage,
            'limits' => $limits,
        ];
    }

    private function incrementCounter(string $key): void
    {
        Cache::increment($key);
        $ttl = 86400 * 31;
        Cache::put($key, Cache::get($key, 1), now()->addSeconds($ttl));
    }

    private function getTenantPlan(string $tenantId): ?SubscriptionPlan
    {
        $tenant = Tenant::find($tenantId);
        if (!$tenant || empty($tenant->plan)) {
            return null;
        }

        return SubscriptionPlan::where('slug', $tenant->plan)->first();
    }

    private function getPlanLimits(?SubscriptionPlan $plan): array
    {
        if (!$plan) {
            return [
                'api_calls_limit' => 1000,
                'webhook_events_limit' => 100,
                'concurrent_requests' => 5,
            ];
        }

        $features = $plan->features ?? [];

        return [
            'api_calls_limit' => (int) ($features['api_calls_limit'] ?? ($plan->slug === 'free' ? 1000 : ($plan->slug === 'pro' ? 10000 : 50000))),
            'webhook_events_limit' => (int) ($features['webhook_events_limit'] ?? ($plan->slug === 'free' ? 100 : ($plan->slug === 'pro' ? 1000 : 10000))),
            'concurrent_requests' => (int) ($features['concurrent_requests'] ?? ($plan->slug === 'free' ? 5 : ($plan->slug === 'pro' ? 20 : 100))),
            'plan_name' => $plan->name,
            'plan_slug' => $plan->slug,
        ];
    }

    public function getFailedWebhooks(int $limit = 50): array
    {
        return WebhookEvent::failed()
            ->with('endpoint')
            ->latest()
            ->take($limit)
            ->get()
            ->toArray();
    }

    public function getWebhookSuccessRate(?string $tenantId = null, int $days = 7): array
    {
        $query = WebhookEvent::where('created_at', '>=', now()->subDays($days));

        if ($tenantId) {
            $query->forTenant($tenantId);
        }

        $total = (clone $query)->count();
        $successful = (clone $query)->successful()->count();
        $failed = (clone $query)->failed()->count();

        return [
            'period_days' => $days,
            'total' => $total,
            'successful' => $successful,
            'failed' => $failed,
            'success_rate' => $total > 0 ? round(($successful / $total) * 100, 2) : 100,
        ];
    }
}
