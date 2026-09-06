<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class TenantConnectionManager
{
    public static function bootForTenant(Tenant $tenant): string
    {
        return 'tenant';
    }

    public static function setAsCurrent(string $connectionName): void
    {
        // Shared database: connection is persistent, no purge/reconnect needed
    }

    public static function connectionName(Tenant $tenant): string
    {
        return 'tenant';
    }

    public static function disconnect(string $connectionName): void
    {
        // No-op: shared connection is persistent
    }

    public static function disconnectAll(): void
    {
        DB::disconnect('tenant');
    }

    public static function activeCount(): int
    {
        return 1;
    }
}
