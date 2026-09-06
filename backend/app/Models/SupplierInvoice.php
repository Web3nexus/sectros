<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class SupplierInvoice extends Model
{
    use BelongsToTenant;

    protected $table = 'supplier_invoices';
    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'supplier_name',
        'invoice_number',
        'invoice_date',
        'total_net',
        'total_gross',
        'tax_rate',
        'file_url',
        'status',
        'raw_ocr_data',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'total_net' => 'decimal:2',
        'total_gross' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'raw_ocr_data' => 'array',
    ];

    public function items()
    {
        return $this->hasMany(SupplierInvoiceItem::class, 'supplier_invoice_id');
    }
}

