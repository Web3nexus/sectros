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

        TenantConnectionManager::setAsCurrent('tenant');
    }

    public function end(): void
    {
        // No-op: shared connection persists
    }
}
