<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Services\TenantResolver;

class InitializeTenancyByHeader
{
    public function handle(Request $request, Closure $next)
    {
        $tenantDomain = $request->header('X-Tenant-Domain');

        if ($tenantDomain && !TenantResolver::resolve()) {
            $tenant = Tenant::whereHas('domains', function ($query) use ($tenantDomain) {
                $query->where('domain', $tenantDomain);
            })->first();

            if ($tenant) {
                TenantResolver::set($tenant);
            }
        }

        return $next($request);
    }
}
