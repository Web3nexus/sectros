<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class VoiceAgentCall extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'provider_id',
        'provider_call_id',
        'provider_agent_id',
        'assigned_phone_number_id',
        'customer_name',
        'customer_phone_number',
        'call_direction',
        'call_status',
        'call_duration_seconds',
        'call_started_at',
        'call_ended_at',
        'transcript',
        'summary',
        'outcome',
        'reservation_id',
        'recording_url',
        'raw_provider_payload',
    ];

    protected $casts = [
        'raw_provider_payload' => 'array',
        'call_started_at' => 'datetime',
        'call_ended_at' => 'datetime',
    ];

    public function provider()
    {
        return $this->belongsTo(VoiceProvider::class, 'provider_id');
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id');
    }

    public function assignedPhoneNumber()
    {
        return $this->belongsTo(VoiceAgentPhoneNumber::class, 'assigned_phone_number_id');
    }
}
