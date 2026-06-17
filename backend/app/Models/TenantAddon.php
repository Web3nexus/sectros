<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class TenantAddon extends Model
{
    use BelongsToTenant;

    protected $connection = 'platform';

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
}
