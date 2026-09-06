<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles  Can be comma-separated or multiple arguments
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Expand any comma-separated or pipe-separated roles
        $allowedRoles = [];
        foreach ($roles as $roleGroup) {
            foreach (preg_split('/[,|]/', $roleGroup) as $r) {
                $r = trim($r);
                if (!empty($r)) {
                    $allowedRoles[] = strtolower($r);
                }
            }
        }

        $userRole = strtolower($user->role ?? '');
        $tenant = function_exists('tenant') ? tenant() : null;
        $isTenantOwner = $tenant && strtolower($user->email ?? '') === strtolower($tenant->owner_email ?? '');

        // Check if user is owner
        if ($isTenantOwner && (in_array('owner', $allowedRoles) || in_array('admin', $allowedRoles))) {
            return $next($request);
        }

        // Direct user role column check
        if (!empty($userRole) && in_array($userRole, $allowedRoles)) {
            return $next($request);
        }

        // Spatie role check if method exists
        if (method_exists($user, 'hasAnyRole')) {
            try {
                if ($user->hasAnyRole($allowedRoles)) {
                    return $next($request);
                }
            } catch (\Throwable $e) {
                // Ignore Spatie role lookup failures
            }
        }

        return response()->json([
            'message' => 'Forbidden: You do not have permission to access this resource.',
            'required_roles' => $allowedRoles,
        ], 403);
    }
}
