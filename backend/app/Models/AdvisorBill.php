<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class AdvisorBill extends Model
{
    use BelongsToTenant;

    protected $table = 'advisor_bills';
    protected $connection = 'tenant';

    protected $fillable = [
        'tax_advisor_id',
        'tenant_id',
        'invoice_number',
        'amount',
        'bill_date',
        'file_url',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'bill_date' => 'date',
    ];

    public function taxAdvisor()
    {
        return $this->belongsTo(TaxAdvisor::class, 'tax_advisor_id');
    }
}

