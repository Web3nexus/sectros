<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class AiReplyLog extends Model
{
    use BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'message_id',
        'conversation_id',
        'channel_id',
        'action',
        'original_message',
        'suggested_reply',
        'final_reply',
        'status',
        'ai_metadata',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'ai_metadata' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function message()
    {
        return $this->belongsTo(Message::class);
    }
}
