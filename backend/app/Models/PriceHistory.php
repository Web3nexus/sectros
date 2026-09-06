<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class PriceHistory extends Model
{
    use BelongsToTenant;

    protected $table = 'price_histories';
    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'product_catalog_id',
        'supplier_name',
        'price',
        'recorded_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'recorded_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(ProductCatalog::class, 'product_catalog_id');
    }
}

