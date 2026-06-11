<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $table = 'tenant_inventory_items';

    protected $fillable = [
        'name',
        'description',
        'category',
        'sku',
        'unit',
        'stock_qty',
        'min_stock_level',
        'cost_per_unit',
        'supplier',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'stock_qty' => 'decimal:2',
        'min_stock_level' => 'decimal:2',
        'cost_per_unit' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
