<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\User;
use App\Services\TenantResolver;
use App\Models\PersonalAccessToken;

class InitializeTenancyByHeader
{
    public function handle(Request $request, Closure $next)
    {
        // 1. Try resolving via X-Tenant-Domain / X-Tenant header
        $tenantDomain = $request->header('X-Tenant-Domain') ?: $request->header('X-Tenant');

        if ($tenantDomain && !TenantResolver::resolve()) {
            $cleaned = preg_replace('#^https?://#', '', trim($tenantDomain));
            $cleaned = explode(':', $cleaned)[0];
            $subdomain = explode('.', $cleaned)[0];

            $tenant = Tenant::where(function ($q) use ($cleaned, $subdomain, $tenantDomain) {
                $q->where('id', $cleaned)
                  ->orWhere('id', $subdomain)
                  ->orWhere('id', $tenantDomain);
            })->orWhereHas('domains', function ($query) use ($cleaned, $subdomain, $tenantDomain) {
                $query->where('domain', $cleaned)
                      ->orWhere('domain', $subdomain)
                      ->orWhere('domain', $tenantDomain);
            })->first();

            if ($tenant) {
                TenantResolver::set($tenant);
                try {
                    tenancy()->initialize($tenant);
                } catch (\Throwable $e) {}
            }
        }

        // 2. Fallback: Resolve tenant from Bearer token if not yet resolved
        if (!TenantResolver::resolve() && ($bearerToken = $request->bearerToken())) {
            try {
                $pat = PersonalAccessToken::findToken($bearerToken)
                    ?? \Laravel\Sanctum\PersonalAccessToken::findToken($bearerToken);

                if ($pat) {
                    $user = User::withoutGlobalScopes()->find($pat->tokenable_id)
                        ?? $pat->tokenable;

                    if ($user && $user->tenant_id) {
                        $tenant = Tenant::find($user->tenant_id);
                        if ($tenant) {
                            TenantResolver::set($tenant);
                            try {
                                tenancy()->initialize($tenant);
                            } catch (\Throwable $e) {}
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
