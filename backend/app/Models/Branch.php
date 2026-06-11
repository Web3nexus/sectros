<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $fillable = [
        'name',
        'address',
        'phone',
        'email',
        'is_active',
        'is_main',
        'settings',
        'franchise_id'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_main' => 'boolean',
        'settings' => 'json'
    ];

    public function franchise(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Franchise::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function staff(): HasMany
    {
        return $this->hasMany(StaffProfile::class);
    }

    public function tables(): HasMany
    {
        return $this->hasMany(RestaurantTable::class);
    }
}
