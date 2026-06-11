<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantAddon extends Model
{
    protected $connection = 'mysql';

    protected $table = 'tenant_addon';

    protected $fillable = [
        'tenant_id', 'addon_id', 'quantity',
        'status', 'started_at', 'expires_at',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function addon()
    {
        return $this->belongsTo(Addon::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }
}
