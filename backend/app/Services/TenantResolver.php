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
            self::$resolved = Tenant::find($tid);
            if (self::$resolved) {
                return self::$resolved;
            }
        }

        try {
            $domain = request()->getHost();
            if ($domain) {
                self::$resolved = Tenant::whereHas('domains', function ($q) use ($domain) {
                    $q->where('domain', $domain);
                })->first();
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
        self::$resolved = null;
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
