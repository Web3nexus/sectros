<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebhookEndpoint;
use App\Models\WebhookEvent;
use App\Services\WebhookDispatchService;
use App\Services\UsageMonitorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookManagementController extends Controller
{
    private WebhookDispatchService $webhookService;
    private UsageMonitorService $usageMonitor;

    public function __construct()
    {
        $this->webhookService = new WebhookDispatchService();
        $this->usageMonitor = new UsageMonitorService();
    }

    public function index(Request $request)
    {
        $query = WebhookEndpoint::query();

        if ($request->filled('tenant_id')) {
            $query->forTenant($request->input('tenant_id'));
        }

        if ($request->filled('event')) {
            $query->forEvent($request->input('event'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        $endpoints = $query->latest()->paginate(50);

        return response()->json([
            'endpoints' => $endpoints->items(),
            'paginator' => [
                'current_page' => $endpoints->currentPage(),
                'total' => $endpoints->total(),
                'per_page' => $endpoints->perPage(),
                'last_page' => $endpoints->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|string|exists:tenants,id',
            'url' => 'required|url|max:1024',
            'events' => 'required|array|min:1',
            'events.*' => 'string|in:' . implode(',', $this->getValidEvents()),
            'description' => 'nullable|string|max:500',
            'secret' => 'nullable|string|min:16|max:128',
        ]);

        $validated['user_id'] = $request->user()?->id;
        $validated['is_active'] = true;

        $endpoint = WebhookEndpoint::create($validated);

        return response()->json([
            'message' => 'Webhook endpoint created',
            'endpoint' => $endpoint,
        ], 201);
    }

    public function show(string $id)
    {
        $endpoint = WebhookEndpoint::findOrFail($id);

        $recentEvents = WebhookEvent::where('webhook_endpoint_id', $endpoint->id)
            ->latest()
            ->take(20)
            ->get();

        return response()->json([
            'endpoint' => $endpoint,
            'recent_events' => $recentEvents,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $endpoint = WebhookEndpoint::findOrFail($id);

        $validated = $request->validate([
            'url' => 'sometimes|url|max:1024',
            'events' => 'sometimes|array|min:1',
            'events.*' => 'string|in:' . implode(',', $this->getValidEvents()),
            'is_active' => 'sometimes|boolean',
            'description' => 'nullable|string|max:500',
            'secret' => 'nullable|string|min:16|max:128',
        ]);

        $endpoint->update($validated);

        return response()->json([
            'message' => 'Webhook endpoint updated',
            'endpoint' => $endpoint,
        ]);
    }

    public function destroy(string $id)
    {
        $endpoint = WebhookEndpoint::findOrFail($id);

        WebhookEvent::where('webhook_endpoint_id', $endpoint->id)->delete();
        $endpoint->delete();

        return response()->json(['message' => 'Webhook endpoint deleted']);
    }

    public function test(Request $request, string $id)
    {
        $endpoint = WebhookEndpoint::findOrFail($id);

        if (!$endpoint->is_active) {
            return response()->json(['error' => 'Cannot test an inactive endpoint'], 400);
        }

        try {
            $result = $this->webhookService->sendToEndpoint(
                $endpoint,
                'test.ping',
                [
                    'message' => 'This is a test webhook from Sectros.',
                    'timestamp' => now()->toIso8601String(),
                ]
            );

            return response()->json([
                'message' => $result['success'] ? 'Webhook delivered successfully' : 'Webhook delivery failed',
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('Webhook test failed', ['endpoint_id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Webhook test failed: ' . $e->getMessage()], 500);
        }
    }

    public function events()
    {
        return response()->json([
            'events' => $this->getValidEvents(),
        ]);
    }

    public function usage(Request $request)
    {
        $tenantId = $request->input('tenant_id');

        if ($tenantId) {
            $days = min((int) ($request->input('days', 30)), 90);
            $usage = $this->usageMonitor->getTenantUsageSummary($tenantId, $days);
        } else {
            $usage = $this->usageMonitor->getSystemOverview();
        }

        $limits = [];
        if ($tenantId) {
            $limits = $this->usageMonitor->enforceQuota($tenantId);
        }

        return response()->json([
            'usage' => $usage,
            'quota' => $limits,
        ]);
    }

    public function failedEvents(Request $request)
    {
        $limit = min((int) ($request->input('limit', 50)), 200);

        $query = WebhookEvent::failed()->with('endpoint');

        if ($request->filled('tenant_id')) {
            $query->forTenant($request->input('tenant_id'));
        }

        return response()->json([
            'failed_events' => $query->latest()->take($limit)->get(),
        ]);
    }

    public function stats(Request $request)
    {
        $tenantId = $request->input('tenant_id');
        $days = min((int) ($request->input('days', 7)), 90);

        $successRate = $this->usageMonitor->getWebhookSuccessRate($tenantId, $days);

        $eventsByType = WebhookEvent::when($tenantId, fn($q) => $q->forTenant($tenantId))
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('event_type, COUNT(*) as total, SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as successful', ['delivered'])
            ->groupBy('event_type')
            ->get();

        $dailyStats = WebhookEvent::when($tenantId, fn($q) => $q->forTenant($tenantId))
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total, SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as successful', ['delivered'])
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success_rate' => $successRate,
            'events_by_type' => $eventsByType,
            'daily_stats' => $dailyStats,
        ]);
    }

    private function getValidEvents(): array
    {
        return [
            'reservation.created',
            'reservation.updated',
            'reservation.cancelled',
            'order.created',
            'order.updated',
            'order.completed',
            'order.cancelled',
            'staff.created',
            'staff.updated',
            'staff.deleted',
            'menu.updated',
            'review.created',
            'tenant.registered',
            'tenant.updated',
            'payment.received',
            'payment.refunded',
            'test.ping',
        ];
    }
}
