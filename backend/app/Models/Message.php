<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'conversation_id',
        'contact_id',
        'channel_id',
        'channel_type',
        'integration_mode',
        'provider_name',
        'external_message_id',
        'sender_id',
        'recipient_id',
        'direction',
        'message_type',
        'text',
        'media_url',
        'media_mime_type',
        'metadata',
        'raw_payload',
        'external_timestamp',
        'is_ai_generated',
        'is_ai_reviewed',
    ];

    protected $casts = [
        'metadata' => 'array',
        'raw_payload' => 'array',
        'external_timestamp' => 'datetime',
        'is_ai_generated' => 'boolean',
        'is_ai_reviewed' => 'boolean',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function statuses()
    {
        return $this->hasMany(MessageStatus::class);
    }

    public function aiLogs()
    {
        return $this->hasMany(AiReplyLog::class, 'message_id');
    }

    public function scopeIncoming($query)
    {
        return $query->where('direction', 'incoming');
    }

    public function scopeOutgoing($query)
    {
        return $query->where('direction', 'outgoing');
    }
}
