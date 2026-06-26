<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    protected $connection = 'platform';
    
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'plan',
            'business_name',
            'business_type',
            'owner_name',
            'owner_email',
            'status',
            'trial_ends_at',
            'is_testing',
            'testing_ends_at',
            'ai_credits_used',
            'ai_credits_topup',
            'ai_credits_reset_at',
            'sms_credits_used',
            'sms_credits_topup',
            'sms_credits_reset_at',
            'voice_credits_used',
            'voice_credits_topup',
            'voice_credits_reset_at',
            'features',
            'country',
            'created_at',
            'updated_at',
        ];
    }

    protected $casts = [
        'features' => 'array',
        'ai_credits_used' => 'integer',
        'ai_credits_topup' => 'integer',
        'ai_credits_reset_at' => 'datetime',
        'sms_credits_used' => 'integer',
        'sms_credits_topup' => 'integer',
        'sms_credits_reset_at' => 'datetime',
        'voice_credits_used' => 'integer',
        'voice_credits_topup' => 'integer',
        'voice_credits_reset_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'is_testing' => 'boolean',
        'testing_ends_at' => 'datetime',
    ];
}
