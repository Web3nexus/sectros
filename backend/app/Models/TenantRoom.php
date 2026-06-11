<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantRoom extends Model
{
    protected $fillable = [
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
