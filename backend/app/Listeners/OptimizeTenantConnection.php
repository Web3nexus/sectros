<?php

namespace App\Listeners;

use App\Services\TenantConnectionManager;
use Stancl\Tenancy\Events\TenancyInitialized;

class OptimizeTenantConnection
{
    public function handle(TenancyInitialized $event): void
    {
        $tenant = $event->tenant;
        if (!$tenant) return;

        try {
            TenantConnectionManager::bootForTenant($tenant);
        } catch (\Exception $e) {
            \Log::error('Failed to optimize tenant connection', [
                'tenant_id' => $tenant->getTenantKey(),
                'error' => $e->getMessage(),
            ]);
        }
    }
}
