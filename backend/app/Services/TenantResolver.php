<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Request;

class TenantResolver
{
    protected static ?Tenant $resolved = null;

    public static function resolve(): ?Tenant
    {
        if (self::$resolved) {
            return self::$resolved;
        }

        if (tenancy()->initialized && ($t = tenant())) {
            self::$resolved = $t;
            return self::$resolved;
        }

        if (auth()->check() && ($tid = auth()->user()->tenant_id)) {
            self::$resolved = \Illuminate\Support\Facades\Cache::remember("tenant:{$tid}", 300, function () use ($tid) {
                return Tenant::find($tid);
            });
            if (self::$resolved) {
                return self::$resolved;
            }
        }

        try {
            $domain = request()->getHost();
            if ($domain) {
                $cacheKey = 'tenant:domain:' . md5($domain);
                self::$resolved = \Illuminate\Support\Facades\Cache::remember($cacheKey, 300, function () use ($domain) {
                    return Tenant::whereHas('domains', function ($q) use ($domain) {
                        $q->where('domain', $domain);
                    })->first();
                });
                if (self::$resolved) {
                    return self::$resolved;
                }
            }
        } catch (\Exception $e) {
            // Table may not exist (e.g., during testing)
        }

        return null;
    }

    public static function resolveOrFail(): Tenant
    {
        $tenant = self::resolve();
        if (!$tenant) {
            abort(403, 'Tenant context could not be resolved.');
        }
        return $tenant;
    }

    public static function set(?Tenant $tenant): void
    {
        self::$resolved = $tenant;
    }

    public static function clear(): void
    {
        if (self::$resolved) {
            self::forgetCache(self::$resolved->id);
        }
        self::$resolved = null;
    }

    public static function forgetCache(string $tenantId, ?string $domain = null): void
    {
        \Illuminate\Support\Facades\Cache::forget("tenant:{$tenantId}");
        if ($domain) {
            \Illuminate\Support\Facades\Cache::forget('tenant:domain:' . md5($domain));
        }
    }

    public static function isResolved(): bool
    {
        return self::$resolved !== null;
    }

    public static function id(): ?string
    {
        return self::resolve()?->id;
    }

    public static function storagePath(string $path = ''): string
    {
        $id = self::id();
        if (!$id) {
            return storage_path($path);
        }
        return storage_path("tenants/{$id}/" . ltrim($path, '/'));
    }
}
