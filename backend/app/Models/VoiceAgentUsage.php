<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class VoiceAgentUsage extends Model
{
    use BelongsToTenant;

    protected $table = 'voice_agent_usage';

    protected $fillable = [
        'tenant_id',
        'billing_month',
        'included_minutes',
        'used_minutes',
        'remaining_minutes',
        'extra_minutes',
        'extra_minute_rate',
        'estimated_extra_charge',
    ];

    protected $casts = [
        'extra_minute_rate' => 'decimal:4',
        'estimated_extra_charge' => 'decimal:2',
    ];
}
