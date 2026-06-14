<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        // Basic JSON detect
        if ($val && (str_starts_with($val, '[') || str_starts_with($val, '{'))) {
            return json_decode($val, true);
        }

        // Cast boolean strings
        if ($val === 'true' || $val === '1') return true;
        if ($val === 'false' || $val === '0') return false;
        
        return $val;
    }
}
