<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantService extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'price',
        'duration_minutes',
        'image_url',
        'category',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration_minutes' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
