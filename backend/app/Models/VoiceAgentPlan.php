<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoiceAgentPlan extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'plan_name',
        'plan_description',
        'monthly_price',
        'yearly_price',
        'currency',
        'trial_days',
        'included_minutes_monthly',
        'included_minutes_yearly',
        'extra_minute_rate',
        'max_call_duration_minutes',
        'max_calls_per_month',
        'features',
        'is_popular',
        'is_active',
        'sort_order',
        'provider_price_id_monthly',
        'provider_price_id_yearly',
    ];

    protected $casts = [
        'monthly_price' => 'decimal:2',
        'yearly_price' => 'decimal:2',
        'extra_minute_rate' => 'decimal:4',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
        'features' => 'array',
    ];
}
