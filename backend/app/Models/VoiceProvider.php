<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class VoiceProvider extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'provider_name',
        'provider_key',
        'is_active',
        'is_default',
        'status',
        'last_tested_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'last_tested_at' => 'datetime',
    ];

    public function setApiKeyAttribute($value)
    {
        $this->attributes['api_key_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getApiKeyAttribute()
    {
        if (!$this->api_key_encrypted) return null;
        try {
            return Crypt::decryptString($this->api_key_encrypted);
        } catch (DecryptException $e) {
            Log::error('Failed to decrypt API key for provider: ' . $this->id);
            return null;
        }
    }

    public function setWebhookSecretAttribute($value)
    {
        $this->attributes['webhook_secret_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getWebhookSecretAttribute()
    {
        if (!$this->webhook_secret_encrypted) return null;
        try {
            return Crypt::decryptString($this->webhook_secret_encrypted);
        } catch (DecryptException $e) {
            Log::error('Failed to decrypt webhook secret for provider: ' . $this->id);
            return null;
        }
    }
}
