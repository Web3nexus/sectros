<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantService extends Model
{
    protected $fillable = [
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
