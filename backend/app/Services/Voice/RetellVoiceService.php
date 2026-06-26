<?php

namespace App\Services\Voice;

use App\Contracts\VoiceProviderInterface;
use App\Models\VoiceProvider;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RetellVoiceService implements VoiceProviderInterface
{
    protected VoiceProvider $provider;
    protected string $apiBase = 'https://api.retellai.com';

    public function __construct(VoiceProvider $provider)
    {
        $this->provider = $provider;
    }

    public function testConnection(): array
    {
        try {
            $response = Http::timeout(10)->withHeaders([
                'Authorization' => 'Bearer ' . $this->provider->api_key,
            ])->get($this->apiBase . '/list-agents');

            if ($response->successful()) {
                return ['success' => true, 'message' => 'Connected successfully'];
            }

            return ['success' => false, 'message' => 'Connection failed: ' . $response->body()];
        } catch (\Exception $e) {
            Log::error('Retell connection test failed: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function createAgent(array $config): array
    {
        try {
            $payload = [
                'agent_name' => $config['business_name'] ?? 'Voice Agent',
                'voice_id' => $config['voice_style'] ?? 'friendly_receptionist',
                'language' => $config['language'] ?? 'en',
                'llm_websocket_url' => $config['llm_websocket_url'] ?? '',
                'enable_transcript' => true,
            ];

            if (!empty($config['system_prompt'])) {
                $payload['agent_prompt'] = $config['system_prompt'];
            }

            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer ' . $this->provider->api_key,
                'Content-Type' => 'application/json',
            ])->post($this->apiBase . '/create-agent', $payload);

            if ($response->successful()) {
                $data = $response->json();
                if (empty($data['agent_id'])) {
                    Log::error('Retell create agent missing agent_id: ' . $response->body());
                    return ['success' => false, 'message' => 'Agent created but no agent_id returned'];
                }
                return [
                    'success' => true,
                    'agent_id' => $data['agent_id'],
                    'data' => $data,
                ];
            }

            Log::error('Retell create agent failed: ' . $response->body());
            return ['success' => false, 'message' => $response->body()];
        } catch (\Exception $e) {
            Log::error('Retell create agent exception: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function updateAgent(string $agentId, array $config): array
    {
        try {
            $payload = [];

            if (isset($config['business_name'])) {
                $payload['agent_name'] = $config['business_name'];
            }
            if (isset($config['voice_style'])) {
                $payload['voice_id'] = $config['voice_style'];
            }
            if (isset($config['system_prompt'])) {
                $payload['agent_prompt'] = $config['system_prompt'];
            }

            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer ' . $this->provider->api_key,
                'Content-Type' => 'application/json',
            ])->patch($this->apiBase . '/update-agent/' . $agentId, $payload);

            if ($response->successful()) {
                return ['success' => true, 'data' => $response->json()];
            }

            Log::error('Retell update agent failed: ' . $response->body());
            return ['success' => false, 'message' => $response->body()];
        } catch (\Exception $e) {
            Log::error('Retell update agent exception: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function deactivateAgent(string $agentId): array
    {
        try {
            $response = Http::timeout(10)->withHeaders([
                'Authorization' => 'Bearer ' . $this->provider->api_key,
            ])->delete($this->apiBase . '/delete-agent/' . $agentId);

            if ($response->successful() || $response->status() === 404) {
                return ['success' => true, 'message' => 'Agent deactivated'];
            }

            return ['success' => false, 'message' => $response->body()];
        } catch (\Exception $e) {
            Log::error('Retell deactivate agent failed: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function createTestCall(string $agentId, string $phoneNumber): array
    {
        try {
            $response = Http::timeout(15)->withHeaders([
                'Authorization' => 'Bearer ' . $this->provider->api_key,
                'Content-Type' => 'application/json',
            ])->post($this->apiBase . '/create-phone-call', [
                'agent_id' => $agentId,
                'from_number' => $phoneNumber,
                'to_number' => $phoneNumber,
            ]);

            if ($response->successful()) {
                return ['success' => true, 'data' => $response->json()];
            }

            return ['success' => false, 'message' => $response->body()];
        } catch (\Exception $e) {
            Log::error('Retell test call failed: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function parseWebhookPayload(array $payload): array
    {
        $event = $payload['event'] ?? $payload['type'] ?? 'unknown';
        $callData = [];

        if ($event === 'call_ended' || $event === 'call_completed') {
            $call = $payload['data'] ?? $payload['call'] ?? $payload;
            $callData = [
                'provider_call_id' => $call['call_id'] ?? $payload['call_id'] ?? null,
                'provider_agent_id' => $call['agent_id'] ?? $payload['agent_id'] ?? null,
                'call_status' => 'completed',
                'call_duration_seconds' => isset($call['duration_ms']) ? intval($call['duration_ms'] / 1000) : ($call['duration_seconds'] ?? null),
                'call_started_at' => $call['start_timestamp'] ?? $call['started_at'] ?? null,
                'call_ended_at' => $call['end_timestamp'] ?? $call['ended_at'] ?? null,
                'transcript' => $call['transcript'] ?? $payload['transcript'] ?? null,
                'summary' => $call['call_summary'] ?? $payload['summary'] ?? null,
                'outcome' => $call['disconnect_reason'] ?? $call['outcome'] ?? null,
                'recording_url' => $call['recording_url'] ?? $payload['recording_url'] ?? null,
                'customer_phone_number' => $call['from_number'] ?? $payload['from_number'] ?? null,
                'customer_name' => $call['customer_name'] ?? $payload['customer_name'] ?? null,
                'call_direction' => $call['direction'] ?? $payload['direction'] ?? 'inbound',
                'raw_provider_payload' => $payload,
            ];
        } elseif ($event === 'call_started' || $event === 'call_ringing') {
            $call = $payload['data'] ?? $payload['call'] ?? $payload;
            return [
                'event_type' => 'call_started',
                'provider_call_id' => $call['call_id'] ?? $payload['call_id'] ?? null,
                'provider_agent_id' => $call['agent_id'] ?? $payload['agent_id'] ?? null,
                'call_status' => 'in_progress',
                'raw_provider_payload' => $payload,
            ];
        }

        return $callData;
    }

    public function getProviderName(): string
    {
        return $this->provider->provider_name;
    }

    public function getProviderKey(): string
    {
        return $this->provider->provider_key;
    }

    public function getVoices(): array
    {
        return [];
    }
}
