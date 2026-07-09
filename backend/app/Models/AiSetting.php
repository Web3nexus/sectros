<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class AiSetting extends Model
{
    use BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'channel_id',
        'auto_reply_enabled',
        'suggested_replies_enabled',
        'ai_tone',
        'custom_instructions',
        'business_rules',
    ];

    protected $casts = [
        'auto_reply_enabled' => 'boolean',
        'suggested_replies_enabled' => 'boolean',
        'business_rules' => 'array',
    ];
}
