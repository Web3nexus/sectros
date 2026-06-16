<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class ConnectedAccount extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'tenant_id',
        'provider',
        'channel',
        'meta_user_id',
        'meta_business_id',
        'page_id',
        'page_name',
        'instagram_business_account_id',
        'instagram_username',
        'access_token',
        'token_expires_at',
        'scopes',
        'webhook_subscribed',
        'webhook_subscribed_at',
        'status',
        'last_error',
        'last_webhook_received_at',
    ];

    protected $casts = [
        'token_expires_at' => 'datetime',
        'webhook_subscribed_at' => 'datetime',
        'webhook_subscribed' => 'boolean',
        'last_webhook_received_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    public function setAccessTokenAttribute(?string $value): void
    {
        if ($value === null) {
            $this->attributes['access_token_encrypted'] = null;
            return;
        }
        $this->attributes['access_token_encrypted'] = Crypt::encryptString($value);
    }

    public function getAccessTokenAttribute(): ?string
    {
        if (empty($this->attributes['access_token_encrypted'])) {
            return null;
        }
        try {
            return Crypt::decryptString($this->attributes['access_token_encrypted']);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    public function isExpired(): bool
    {
        return $this->token_expires_at && $this->token_expires_at->isPast();
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && !$this->isExpired();
    }
}
