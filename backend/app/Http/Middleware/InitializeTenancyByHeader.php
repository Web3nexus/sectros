<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant;
use Stancl\Tenancy\Resolvers\DomainTenantResolver;

class InitializeTenancyByHeader
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $tenantDomain = $request->header('X-Tenant-Domain');

        if ($tenantDomain && !tenant()) {
            $tenant = Tenant::whereHas('domains', function($query) use ($tenantDomain) {
                $query->where('domain', $tenantDomain);
            })->first();

            if ($tenant) {
                tenancy()->initialize($tenant);
            }
        }

        return $next($request);
    }
}
