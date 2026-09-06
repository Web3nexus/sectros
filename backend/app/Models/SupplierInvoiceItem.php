<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class SupplierInvoiceItem extends Model
{
    use BelongsToTenant;

    protected $table = 'supplier_invoice_items';
    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'supplier_invoice_id',
        'product_catalog_id',
        'item_name',
        'quantity',
        'unit_price',
        'total_price',
        'vat_rate',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'vat_rate' => 'decimal:2',
    ];

    public function supplierInvoice()
    {
        return $this->belongsTo(SupplierInvoice::class, 'supplier_invoice_id');
    }

    public function productCatalog()
    {
        return $this->belongsTo(ProductCatalog::class, 'product_catalog_id');
    }
}

