<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class TenantSetting extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = ['tenant_id', 'key', 'value'];

    protected $casts = [
        'value' => 'json'
    ];

    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) return $default;

        $val = $setting->value;
        if ($val && (str_starts_with($val, '[') || str_starts_with($val, '{'))) {
            return json_decode($val, true);
        }

        if ($val === 'true' || $val === '1') return true;
        if ($val === 'false' || $val === '0') return false;

        return $val;
    }

    public static function forgetCache(?string $tenantId = null): void
    {
        $tenantId ??= tenant()?->getTenantKey();
        if ($tenantId) {
            Cache::forget("tenant:{$tenantId}:settings");
        }
    }

    protected static function booted(): void
    {
        static::saved(function ($setting) {
            $tid = $setting->tenant_id ?? tenant()?->getTenantKey();
            if ($tid) {
                Cache::forget("tenant:{$tid}:settings");
                Cache::forget("tenant:{$tid}:setting:{$setting->key}");
            }
        });

        static::deleted(function ($setting) {
            $tid = $setting->tenant_id ?? tenant()?->getTenantKey();
            if ($tid) {
                Cache::forget("tenant:{$tid}:settings");
                Cache::forget("tenant:{$tid}:setting:{$setting->key}");
            }
        });
    }
}
