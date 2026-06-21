<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $connection = 'platform';
    protected $fillable = [
        'name',
        'slug',
        'monthly_price',
        'yearly_price',
        'features',
        'reservation_limit',
        'max_staff',
        'ai_credits_limit',
        'sms_credits_limit',
        'is_active',
        'is_popular',
    ];

    protected $casts = [
        'features'           => 'array',
        'is_active'          => 'boolean',
        'is_popular'         => 'boolean',
        'reservation_limit'  => 'integer',
        'max_staff'          => 'integer',
        'ai_credits_limit'   => 'integer',
        'sms_credits_limit'  => 'integer',
    ];
}
