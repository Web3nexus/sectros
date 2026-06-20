<?php

namespace App\Bootstrappers;

use App\Services\TenantConnectionManager;
use Illuminate\Support\Facades\DB;
use Stancl\Tenancy\Bootstrappers\DatabaseTenancyBootstrapper;

class TenantDatabaseBootstrapper extends DatabaseTenancyBootstrapper
{
    public function bootstrap(\Stancl\Tenancy\Contracts\Tenant $tenant): void
    {
        TenantConnectionManager::setAsCurrent('tenant');
    }

    public function revert(): void
    {
        DB::purge('tenant');
    }
}
