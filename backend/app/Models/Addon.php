<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'name', 'slug', 'description', 'category',
        'price', 'unit_price', 'unit_label', 'billing_type',
        'features', 'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'unit_price' => 'decimal:4',
    ];
}
