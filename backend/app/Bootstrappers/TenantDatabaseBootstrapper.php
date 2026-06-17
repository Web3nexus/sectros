<?php

namespace App\Bootstrappers;

use App\Services\TenantConnectionManager;
use Stancl\Tenancy\Bootstrappers\DatabaseTenancyBootstrapper;

class TenantDatabaseBootstrapper extends DatabaseTenancyBootstrapper
{
    public function start(): void
    {
        $tenant = tenant();
        if (!$tenant) return;

        try {
            $connectionName = TenantConnectionManager::bootForTenant($tenant);
            TenantConnectionManager::setAsCurrent($connectionName);
        } catch (\Exception $e) {
            \Log::error('Failed to bootstrap tenant database', [
                'tenant_id' => $tenant->getTenantKey(),
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function end(): void
    {
        $tenant = tenant();
        if ($tenant) {
            $connectionName = TenantConnectionManager::connectionName($tenant);
            TenantConnectionManager::disconnect($connectionName);
        }
    }
}
