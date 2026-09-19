<?php

use App\Models\Tenant;
use App\Models\User;

if (!function_exists('hasPaidAccess')) {
    /**
     * Determine if a tenant or user has paid subscription access across any configured gateway.
     * Evaluates testing/trial status, high-level tenant subscription status, and mirrored Paddle subscription state.
     * Preserves access during scheduled cancellation until status explicitly becomes 'canceled'.
     *
     * @param Tenant|User|string|int|null $target
     * @return bool
     */
    function hasPaidAccess($target = null): bool
    {
        if ($target instanceof Tenant) {
            return $target->hasPaidAccess();
        }

        if (is_string($target) || is_numeric($target)) {
            // 1. Try resolving as Tenant ID
            $tenant = Tenant::find($target);
            if ($tenant) {
                return $tenant->hasPaidAccess();
            }

            // 2. Try resolving as User ID
            $user = User::find($target);
            if ($user && !empty($user->tenant_id)) {
                $tenant = Tenant::find($user->tenant_id);
                if ($tenant) {
                    return $tenant->hasPaidAccess();
                }
            }
            return false;
        }

        if ($target instanceof User) {
            if (!empty($target->tenant_id)) {
                $tenant = Tenant::find($target->tenant_id);
                return $tenant ? $tenant->hasPaidAccess() : false;
            }
            return false;
        }

        // 3. Fallback to active tenancy context
        if (function_exists('tenant') && tenant()) {
            return tenant()->hasPaidAccess();
        }

        // 4. Fallback to authenticated user
        if (auth()->check() && !empty(auth()->user()->tenant_id)) {
            $tenant = Tenant::find(auth()->user()->tenant_id);
            return $tenant ? $tenant->hasPaidAccess() : false;
        }

        return false;
    }
}

