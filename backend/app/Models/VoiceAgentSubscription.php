<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class VoiceAgentSubscription extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'plan_id',
        'plan_name_snapshot',
        'billing_interval',
        'status',
        'trial_started_at',
        'trial_ends_at',
        'current_period_start',
        'current_period_end',
        'included_minutes_snapshot',
        'extra_minute_rate_snapshot',
        'provider_subscription_id',
        'provider_customer_id',
        'cancel_at_period_end',
    ];

    protected $casts = [
        'trial_started_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'cancel_at_period_end' => 'boolean',
        'extra_minute_rate_snapshot' => 'decimal:4',
    ];

    public function plan()
    {
        return $this->belongsTo(VoiceAgentPlan::class, 'plan_id');
    }
}
