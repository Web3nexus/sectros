<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class DailyCash extends Model
{
    use BelongsToTenant;

    protected $table = 'daily_cashes';
    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'date',
        'opening_float',
        'cash_sales',
        'card_sales',
        'counted_cash',
        'total_sales',
        'tips_surplus',
        'vat_7_amount',
        'vat_19_amount',
        'notes',
        'status',
        'verified_by',
    ];

    protected $casts = [
        'date' => 'date',
        'opening_float' => 'decimal:2',
        'cash_sales' => 'decimal:2',
        'card_sales' => 'decimal:2',
        'counted_cash' => 'decimal:2',
        'total_sales' => 'decimal:2',
        'tips_surplus' => 'decimal:2',
        'vat_7_amount' => 'decimal:2',
        'vat_19_amount' => 'decimal:2',
    ];

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}

