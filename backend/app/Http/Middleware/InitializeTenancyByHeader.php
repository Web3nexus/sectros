<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\User;
use App\Services\TenantResolver;
use Laravel\Sanctum\PersonalAccessToken;

class InitializeTenancyByHeader
{
    public function handle(Request $request, Closure $next)
    {
        $tenantDomain = $request->header('X-Tenant-Domain');

        if ($tenantDomain && !TenantResolver::resolve()) {
            $cleaned = preg_replace('#^https?://#', '', $tenantDomain);
            $cleaned = explode(':', $cleaned)[0];

            $tenant = Tenant::whereHas('domains', function ($query) use ($cleaned, $tenantDomain) {
                $query->where('domain', $cleaned)->orWhere('domain', $tenantDomain);
            })->orWhere('id', $cleaned)->orWhere('id', $tenantDomain)->first();

            if ($tenant) {
                TenantResolver::set($tenant);
                tenancy()->initialize($tenant);
            }
        }

        // Fallback: If tenancy is still not resolved, resolve from authenticated Bearer token
        if (!TenantResolver::resolve() && ($bearerToken = $request->bearerToken())) {
            try {
                $pat = PersonalAccessToken::findToken($bearerToken);
                if ($pat && ($pat->tokenable_type === User::class || is_subclass_of($pat->tokenable_type, User::class))) {
                    $user = User::withoutGlobalScopes()->find($pat->tokenable_id);
                    if ($user && $user->tenant_id) {
                        $tenant = Tenant::find($user->tenant_id);
                        if ($tenant) {
                            TenantResolver::set($tenant);
                            tenancy()->initialize($tenant);
                        }
                    }
                }
            } catch (\Throwable $e) {
                // Ignore and proceed
            }
        }

        return $next($request);
    }
}
