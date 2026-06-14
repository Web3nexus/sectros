<?php

namespace App\Http\Middleware;

use App\Services\TenantResolver;
use Closure;
use Illuminate\Http\Request;

class TenantScopeMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $tenant = TenantResolver::resolveOrFail();

        if (auth()->check()) {
            $user = auth()->user();
            if ($user->tenant_id && $user->tenant_id !== $tenant->id) {
                abort(403, 'Cross-tenant access denied.');
            }
        }

        return $next($request);
    }
}
