<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'description',
        'amount',
        'expense_date',
        'category',
        'receipt_url'
    ];

    protected $casts = [
        'expense_date' => 'date',
        'tenant_id' => 'string',
    ];
}
