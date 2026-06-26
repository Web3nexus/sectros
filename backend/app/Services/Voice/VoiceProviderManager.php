<?php

namespace App\Services\Voice;

use App\Contracts\VoiceProviderInterface;
use App\Models\VoiceProvider;
use Exception;

class VoiceProviderManager
{
    protected ?VoiceProviderInterface $activeProvider = null;

    public function provider(?VoiceProvider $providerModel = null): VoiceProviderInterface
    {
        $provider = $providerModel ?? VoiceProvider::where('is_active', true)->where('is_default', true)->first();

        if (!$provider) {
            throw new Exception('No active voice provider configured');
        }

        return $this->resolve($provider);
    }

    public function resolve(VoiceProvider $provider): VoiceProviderInterface
    {
        return match ($provider->provider_key) {
            'vapi' => new VapiVoiceService($provider),
            'retell' => new RetellVoiceService($provider),
            'elevenlabs' => new ElevenLabsVoiceService($provider),
            default => throw new Exception('Unsupported voice provider: ' . $provider->provider_key),
        };
    }

    public function getDefaultProvider(): ?VoiceProvider
    {
        return VoiceProvider::where('is_active', true)->where('is_default', true)->first();
    }

    public function getActiveProviders()
    {
        return VoiceProvider::where('is_active', true)->get();
    }
}
