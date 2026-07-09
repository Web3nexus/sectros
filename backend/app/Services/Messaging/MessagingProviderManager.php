<?php

namespace App\Services\Messaging;

use App\Contracts\MessagingProviderAdapter;
use App\Models\Channel;
use App\Models\MessagingProviderConfig;
use Exception;

class MessagingProviderManager
{
    protected array $adapters = [];

    public function resolve(?MessagingProviderConfig $config = null): MessagingProviderAdapter
    {
        if (!$config) {
            $config = MessagingProviderConfig::where('is_active', true)->where('is_default', true)->first();
        }

        if (!$config) {
            throw new Exception('No active messaging provider configured');
        }

        return $this->resolveByKey($config->provider_key, $config);
    }

    public function resolveByKey(string $providerKey, ?MessagingProviderConfig $config = null): MessagingProviderAdapter
    {
        return match ($providerKey) {
            'meta_direct' => new MetaDirectProvider($config),
            '360dialog' => new WhatsApp360DialogAdapter($config),
            'twilio' => new WhatsAppTwilioAdapter($config),
            default => throw new Exception('Unsupported messaging provider: ' . $providerKey),
        };
    }

    public function resolveForChannel(Channel $channel): MessagingProviderAdapter
    {
        $providerKey = $channel->provider_name;

        if ($channel->integration_mode === 'direct') {
            $providerKey = 'meta_direct';
        }

        if ($channel->integration_mode === 'partner') {
            throw new Exception('Partner mode channels use the existing SocialMessengerService');
        }

        $config = MessagingProviderConfig::where('provider_key', $providerKey)
            ->where('is_active', true)
            ->first();

        if (!$config) {
            throw new Exception("No active configuration found for provider: {$providerKey}");
        }

        return $this->resolveByKey($providerKey, $config);
    }

    public function getActiveProviders(): array
    {
        return MessagingProviderConfig::where('is_active', true)->get()->toArray();
    }

    public function getProviderByChannelType(string $channelType): ?MessagingProviderConfig
    {
        $typeMap = [
            'facebook' => 'meta_direct',
            'instagram' => 'meta_direct',
            'whatsapp' => 'meta_direct',
        ];

        $providerKey = $typeMap[$channelType] ?? null;
        if (!$providerKey) return null;

        return MessagingProviderConfig::where('provider_key', $providerKey)
            ->where('is_active', true)
            ->first();
    }
}
