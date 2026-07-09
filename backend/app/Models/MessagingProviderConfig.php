<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class MessagingProviderConfig extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'provider_key',
        'provider_name',
        'provider_type',
        'config_json',
        'is_active',
        'is_default',
        'status',
        'last_tested_at',
        'api_key',
        'api_secret',
        'webhook_secret',
        'webhook_verify_token',
    ];

    protected $casts = [
        'config_json' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'last_tested_at' => 'datetime',
    ];

    protected $hidden = [
        'api_key_encrypted',
        'api_secret_encrypted',
        'webhook_secret_encrypted',
        'webhook_verify_token_encrypted',
    ];

    public function setApiKeyAttribute($value): void
    {
        $this->attributes['api_key_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getApiKeyAttribute(): ?string
    {
        if (!$this->api_key_encrypted) return null;
        try {
            return Crypt::decryptString($this->api_key_encrypted);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function setApiSecretAttribute($value): void
    {
        $this->attributes['api_secret_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getApiSecretAttribute(): ?string
    {
        if (!$this->api_secret_encrypted) return null;
        try {
            return Crypt::decryptString($this->api_secret_encrypted);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function setWebhookSecretAttribute($value): void
    {
        $this->attributes['webhook_secret_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getWebhookSecretAttribute(): ?string
    {
        if (!$this->webhook_secret_encrypted) return null;
        try {
            return Crypt::decryptString($this->webhook_secret_encrypted);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function setWebhookVerifyTokenAttribute($value): void
    {
        $this->attributes['webhook_verify_token_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getWebhookVerifyTokenAttribute(): ?string
    {
        if (!$this->webhook_verify_token_encrypted) return null;
        try {
            return Crypt::decryptString($this->webhook_verify_token_encrypted);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('provider_type', $type);
    }
}
