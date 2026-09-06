<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class ProcurementItem extends Model
{
    use BelongsToTenant;

    protected $table = 'procurement_items';
    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'procurement_list_id',
        'product_catalog_id',
        'item_name',
        'quantity',
        'unit',
        'estimated_price',
        'status',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'estimated_price' => 'decimal:2',
    ];

    public function procurementList()
    {
        return $this->belongsTo(ProcurementList::class, 'procurement_list_id');
    }

    public function product()
    {
        return $this->belongsTo(ProductCatalog::class, 'product_catalog_id');
    }
}

