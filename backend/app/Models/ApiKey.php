<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'name',
        'key',
        'secret',
        'scopes',
        'last_used_at',
        'expires_at',
        'is_active'
    ];

    protected $casts = [
        'scopes' => 'json',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    protected $hidden = [
        'secret'
    ];
}
