<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiscountRedemption extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'discount_id',
        'tenant_id',
        'scope',
        'gateway',
        'transaction_id',
        'amount_off',
    ];

    protected $casts = [
        'amount_off' => 'float',
    ];
}