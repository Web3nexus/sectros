<?php

namespace App\Services\Messaging;

use App\Models\Channel;
use App\Models\MessagingProviderConfig;

class WhatsApp360DialogAdapter extends WhatsAppBSPAdapter
{
    public function getProviderName(): string
    {
        return '360dialog';
    }

    public function getProviderKey(): string
    {
        return '360dialog';
    }

    protected function getBaseUrl(): string
    {
        return $this->config?->config_json['api_base_url'] ?? 'https://waba.360dialog.io/v1';
    }

    protected function getHeaders(Channel $channel): array
    {
        $apiKey = $this->config?->api_key ?? '';
        return [
            'D360-API-KEY' => $apiKey,
            'Content-Type' => 'application/json',
        ];
    }

    public function connectAccount(Channel $channel, array $config): array
    {
        try {
            $apiKey = $config['api_key'] ?? $this->config?->api_key ?? '';

            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'D360-API-KEY' => $apiKey,
                'Content-Type' => 'application/json',
            ])->get($this->getBaseUrl() . '/configs/webhook');

            if ($response->successful()) {
                $channel->connection_status = 'connected';
                $channel->provider_name = '360dialog';
                if (!empty($config['phone_number_id'])) {
                    $channel->phone_number_id = $config['phone_number_id'];
                }
                if (!empty($config['waba_id'])) {
                    $channel->waba_id = $config['waba_id'];
                }
                $channel->save();
                return ['success' => true, 'channel' => $channel];
            }

            return ['success' => false, 'error' => '360dialog connection failed: ' . ($response->json()['error']['message'] ?? 'unknown')];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function disconnectAccount(Channel $channel): array
    {
        $channel->connection_status = 'disconnected';
        $channel->access_token = null;
        $channel->save();
        return ['success' => true];
    }
}
