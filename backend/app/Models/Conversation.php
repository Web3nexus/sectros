<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'channel_id',
        'contact_id',
        'external_conversation_id',
        'channel_type',
        'status',
        'assigned_to',
        'ai_active',
        'human_taken_over',
        'last_message_at',
        'unread_count',
    ];

    protected $casts = [
        'ai_active' => 'boolean',
        'human_taken_over' => 'boolean',
        'last_message_at' => 'datetime',
        'unread_count' => 'integer',
    ];

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function channel()
    {
        return $this->belongsTo(Channel::class, 'channel_id', 'external_account_id');
    }

    public function aiLogs()
    {
        return $this->hasMany(AiReplyLog::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByChannel($query, string $channelId)
    {
        return $query->where('channel_id', $channelId);
    }
}
