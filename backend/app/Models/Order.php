<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'restaurant_table_id',
        'table_code',
        'staff_profile_id',
        'total_amount',
        'tip_amount',
        'status',
        'kitchen_status',
        'served_at',
        'payment_status',
        'payment_method',
        'cash_remitted',
        'cash_remitted_at',
        'cash_remitted_by',
        'branch_id',
        'customer_name',
        'dining_mode',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'tip_amount' => 'decimal:2',
        'served_at' => 'datetime',
        'cash_remitted' => 'boolean',
        'cash_remitted_at' => 'datetime',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'restaurant_table_id');
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(StaffProfile::class, 'staff_profile_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function tips(): HasMany
    {
        return $this->hasMany(TipRecord::class, 'order_id');
    }
}
