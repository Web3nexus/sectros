<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Channel extends Model
{
    use BelongsToTenant;

    protected $connection = 'platform';

    protected $fillable = [
        'tenant_id',
        'integration_mode',
        'channel_type',
        'provider_name',
        'external_account_id',
        'page_id',
        'page_name',
        'instagram_account_id',
        'instagram_username',
        'phone_number_id',
        'display_phone_number',
        'waba_id',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'scopes',
        'webhook_status',
        'webhook_subscribed_at',
        'webhook_subscription_id',
        'connection_status',
        'last_error',
        'last_sync_at',
        'created_by',
    ];

    protected $casts = [
        'token_expires_at' => 'datetime',
        'webhook_subscribed_at' => 'datetime',
        'last_sync_at' => 'datetime',
    ];

    protected $hidden = [
        'access_token_encrypted',
        'refresh_token_encrypted',
    ];

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

    public function setRefreshTokenAttribute(?string $value): void
    {
        if ($value === null) {
            $this->attributes['refresh_token_encrypted'] = null;
            return;
        }
        $this->attributes['refresh_token_encrypted'] = Crypt::encryptString($value);
    }

    public function getRefreshTokenAttribute(): ?string
    {
        if (empty($this->attributes['refresh_token_encrypted'])) {
            return null;
        }
        try {
            return Crypt::decryptString($this->attributes['refresh_token_encrypted']);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function scopeActive($query)
    {
        return $query->where('connection_status', 'connected');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('channel_type', $type);
    }

    public function scopeByIntegrationMode($query, string $mode)
    {
        return $query->where('integration_mode', $mode);
    }

    public function isConnected(): bool
    {
        return $this->connection_status === 'connected';
    }

    public function isExpired(): bool
    {
        return $this->token_expires_at && $this->token_expires_at->isPast();
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'channel_id', 'external_account_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
