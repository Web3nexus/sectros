<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebhookEvent extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'tenant_id',
        'webhook_endpoint_id',
        'event_type',
        'payload',
        'response_code',
        'response_body',
        'status',
        'error_message',
        'duration_ms',
        'ip_address',
        'user_agent',
        'delivered_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'delivered_at' => 'datetime',
        'duration_ms' => 'integer',
    ];

    public function endpoint()
    {
        return $this->belongsTo(WebhookEndpoint::class, 'webhook_endpoint_id');
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopeFailed($query)
    {
        return $query->whereIn('status', ['failed', 'timeout']);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeForEventType($query, string $eventType)
    {
        return $query->where('event_type', $eventType);
    }
}
