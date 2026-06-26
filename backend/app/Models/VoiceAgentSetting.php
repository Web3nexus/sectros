<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class VoiceAgentSetting extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'provider_id',
        'provider_agent_id',
        'assigned_phone_number_id',
        'business_name',
        'business_type',
        'business_phone_number',
        'assigned_voice_phone_number',
        'escalation_phone_number',
        'language',
        'voice_style',
        'voice_id',
        'opening_hours',
        'off_hours_behavior',
        'booking_enabled',
        'booking_rules',
        'max_party_size',
        'reservation_duration_minutes',
        'advance_booking_days',
        'fallback_message',
        'system_prompt',
        'agent_token',
        'is_active',
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'booking_rules' => 'array',
        'booking_enabled' => 'boolean',
        'is_active' => 'boolean',
        'max_party_size' => 'integer',
        'reservation_duration_minutes' => 'integer',
        'advance_booking_days' => 'integer',
    ];

    protected static function booted()
    {
        static::creating(function ($settings) {
            if (empty($settings->agent_token)) {
                $settings->agent_token = Str::random(64);
            }
        });
    }

    public function provider()
    {
        return $this->belongsTo(VoiceProvider::class, 'provider_id');
    }

    public function assignedPhoneNumber()
    {
        return $this->belongsTo(VoiceAgentPhoneNumber::class, 'assigned_phone_number_id');
    }
}
