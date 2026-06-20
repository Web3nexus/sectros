<?php

namespace App\Http\Controllers;

use App\Models\TenantSetting;
use App\Models\SaaSSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class Controller
{
    protected function paginate($query, int $max = 50, int $defaultPerPage = 25): LengthAwarePaginator
    {
        $perPage = min((int) request('per_page', $defaultPerPage), $max);

        return $query->paginate($perPage);
    }

    protected function cacheTenantSettings(?string $tenantId = null): array
    {
        $tenantId ??= tenant()?->getTenantKey();
        if (!$tenantId) {
            throw new \RuntimeException('Cannot access tenant settings without tenant context');
        }

        return Cache::remember("tenant:{$tenantId}:settings", 3600, function () {
            return TenantSetting::pluck('value', 'key')->toArray();
        });
    }

    protected function cacheSetting(string $key, $default = null, ?string $tenantId = null): mixed
    {
        $tenantId ??= tenant()?->getTenantKey();
        if (!$tenantId) {
            throw new \RuntimeException('Cannot access tenant settings without tenant context');
        }

        return Cache::remember("tenant:{$tenantId}:setting:{$key}", 3600, function () use ($key, $default) {
            return TenantSetting::get($key, $default);
        });
    }

    protected function cacheSaaSSettings(): array
    {
        return Cache::remember('saas:settings', 3600, function () {
            return SaaSSetting::pluck('value', 'key')->toArray();
        });
    }

    protected function transaction(callable $callback, int $attempts = 3, ?string $connection = null)
    {
        $connection ??= 'tenant';
        return DB::connection($connection)->transaction($callback, $attempts);
    }
}
