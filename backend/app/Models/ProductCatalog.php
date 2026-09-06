<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class ProductCatalog extends Model
{
    use BelongsToTenant;

    protected $table = 'product_catalogs';
    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'category',
        'name',
        'unit',
        'sku',
        'supplier_name',
        'current_price',
        'target_price',
        'is_active',
    ];

    protected $casts = [
        'current_price' => 'decimal:2',
        'target_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function priceHistories()
    {
        return $this->hasMany(PriceHistory::class, 'product_catalog_id');
    }
}

