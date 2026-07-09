<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class MessageStatus extends Model
{
    use BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'message_id',
        'status',
        'error_message',
        'provider_response',
        'status_changed_at',
    ];

    protected $casts = [
        'provider_response' => 'array',
        'status_changed_at' => 'datetime',
    ];

    public function message()
    {
        return $this->belongsTo(Message::class);
    }
}
