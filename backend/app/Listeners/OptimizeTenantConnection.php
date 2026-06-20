<?php

namespace App\Listeners;

use App\Services\TenantConnectionManager;
use Stancl\Tenancy\Events\TenancyInitialized;

class OptimizeTenantConnection
{
    public function handle(TenancyInitialized $event): void
    {
        // Shared connection — no per-tenant DB setup needed
    }
}
