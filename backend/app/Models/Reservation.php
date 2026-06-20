<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'reservation_time',
        'end_time',
        'duration_minutes',
        'party_size',
        'restaurant_table_id',
        'resource_type',
        'resource_id',
        'status',
        'payment_status',
        'deposit_amount',
        'stripe_payment_id',
        'payment_method',
        'special_requests',
        'dynamic_fields',
        'source',
        'branch_id'
    ];

    protected $casts = [
        'reservation_time' => 'datetime',
        'end_time' => 'datetime',
        'deposit_amount' => 'decimal:2',
        'dynamic_fields' => 'json',
        'tenant_id' => 'string',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'restaurant_table_id');
    }
}
