<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class WebhookEndpoint extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'tenant_id',
        'user_id',
        'url',
        'secret',
        'events',
        'is_active',
        'description',
        'last_success_at',
        'last_failure_at',
        'failure_count',
    ];

    protected $casts = [
        'events' => 'array',
        'is_active' => 'boolean',
        'last_success_at' => 'datetime',
        'last_failure_at' => 'datetime',
        'failure_count' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function ($endpoint) {
            if (empty($endpoint->secret)) {
                $endpoint->secret = 'whsec_' . Str::random(32);
            }
        });
    }

    public function markSuccess(): void
    {
        $this->update([
            'last_success_at' => now(),
            'failure_count' => 0,
        ]);
    }

    public function markFailure(): void
    {
        $this->update([
            'last_failure_at' => now(),
            'failure_count' => $this->failure_count + 1,
        ]);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeForEvent($query, string $event)
    {
        return $query->whereJsonContains('events', $event);
    }
}
