<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SaaSSetting extends Model
{
    protected $connection = 'platform';
    protected $fillable = ['key', 'value'];

    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) return $default;

        $val = $setting->value;
        if (str_starts_with($val, '[') || str_starts_with($val, '{')) {
            return json_decode($val, true);
        }

        if ($val === 'true' || $val === '1') return true;
        if ($val === 'false' || $val === '0') return false;

        return $val;
    }

    public static function forgetCache(): void
    {
        Cache::forget('saas:settings');
    }

    protected static function booted(): void
    {
        static::saved(function () {
            static::forgetCache();
        });

        static::deleted(function () {
            static::forgetCache();
        });
    }
}
