<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class VoiceAgentKnowledgeBase extends Model
{
    use BelongsToTenant;

    protected $table = 'voice_agent_knowledge_base';

    protected $fillable = [
        'tenant_id',
        'title',
        'content',
        'category',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
