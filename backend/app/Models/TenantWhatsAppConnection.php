<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class TenantWhatsAppConnection extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'tenant_id',
        'meta_business_id',
        'waba_id',
        'phone_number_id',
        'display_phone_number',
        'access_token_encrypted',
        'token_expires_at',
        'status',
        'webhook_subscription_id',
        'webhook_subscribed_at',
    ];

    protected $casts = [
        'token_expires_at' => 'datetime',
        'webhook_subscribed_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    public function setAccessTokenAttribute(string $value): void
    {
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
        return $query->where('status', 'connected');
    }

    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function isExpired(): bool
    {
        return $this->token_expires_at && $this->token_expires_at->isPast();
    }

    public function isActive(): bool
    {
        return $this->status === 'connected' && !$this->isExpired();
    }
}
