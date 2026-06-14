<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantRoom extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'price',
        'image_url',
        'amenities',
        'capacity',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'amenities' => 'json',
        'capacity' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
