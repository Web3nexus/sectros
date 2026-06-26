<?php

namespace App\Services\Voice;

use App\Contracts\VoiceProviderInterface;
use App\Models\VoiceProvider;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VapiVoiceService implements VoiceProviderInterface
{
    protected VoiceProvider $provider;
    protected string $apiBase = 'https://api.vapi.ai';

    public function __construct(VoiceProvider $provider)
    {
        $this->provider = $provider;
    }

    public function testConnection(): array
    {
        try {
            $response = Http::timeout(10)->withHeaders([
                'Authorization' => 'Bearer ' . $this->provider->api_key,
            ])->get($this->apiBase . '/assistant');

            if ($response->successful()) {
                return ['success' => true, 'message' => 'Connected successfully'];
            }

            return ['success' => false, 'message' => 'Connection failed: ' . $response->body()];
        } catch (\Exception $e) {
            Log::error('Vapi connection test failed: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function createAgent(array $config): array
    {
        try {
            $payload = [
                'name' => $config['business_name'] ?? 'Voice Agent',
                'voice' => $config['voice_style'] ?? 'friendly_receptionist',
                'language' => $config['language'] ?? 'en',
                'model' => [
                    'provider' => 'openai',
                    'model' => 'gpt-4',
                    'systemPrompt' => $config['system_prompt'] ?? '',
                ],
                'serverMessages' => [
                    'conversation-update',
                    'end-of-call-report',
                    'transcript',
                    'hang',
                ],
            ];

            if (!empty($config['business_phone_number'])) {
                $payload['phoneNumber'] = $config['business_phone_number'];
            }

            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer ' . $this->provider->api_key,
                'Content-Type' => 'application/json',
            ])->post($this->apiBase . '/assistant', $payload);

            if ($response->successful()) {
                $data = $response->json();
                if (empty($data['id'])) {
                    Log::error('Vapi create agent missing id: ' . $response->body());
                    return ['success' => false, 'message' => 'Agent created but no agent_id returned'];
                }
                return [
                    'success' => true,
                    'agent_id' => $data['id'],
                    'data' => $data,
                ];
            }

            Log::error('Vapi create agent failed: ' . $response->body());
            return ['success' => false, 'message' => $response->body()];
        } catch (\Exception $e) {
            Log::error('Vapi create agent exception: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function updateAgent(string $agentId, array $config): array
    {
        try {
            $payload = [];

            if (isset($config['business_name'])) {
                $payload['name'] = $config['business_name'];
            }
            if (isset($config['voice_style'])) {
                $payload['voice'] = $config['voice_style'];
            }
            if (isset($config['system_prompt'])) {
                if (!isset($payload['model'])) {
                    $payload['model'] = [];
                }
                $payload['model']['systemPrompt'] = $config['system_prompt'];
            }

            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer ' . $this->provider->api_key,
                'Content-Type' => 'application/json',
            ])->patch($this->apiBase . '/assistant/' . $agentId, $payload);

            if ($response->successful()) {
                return ['success' => true, 'data' => $response->json()];
            }

            Log::error('Vapi update agent failed: ' . $response->body());
            return ['success' => false, 'message' => $response->body()];
        } catch (\Exception $e) {
            Log::error('Vapi update agent exception: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function deactivateAgent(string $agentId): array
    {
        try {
            $response = Http::timeout(10)->withHeaders([
                'Authorization' => 'Bearer ' . $this->provider->api_key,
            ])->delete($this->apiBase . '/assistant/' . $agentId);

            if ($response->successful() || $response->status() === 404) {
                return ['success' => true, 'message' => 'Agent deactivated'];
            }

            return ['success' => false, 'message' => $response->body()];
        } catch (\Exception $e) {
            Log::error('Vapi deactivate agent failed: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function createTestCall(string $agentId, string $phoneNumber): array
    {
        try {
            $response = Http::timeout(15)->withHeaders([
                'Authorization' => 'Bearer ' . $this->provider->api_key,
                'Content-Type' => 'application/json',
            ])->post($this->apiBase . '/call', [
                'assistantId' => $agentId,
                'phoneNumber' => $phoneNumber,
            ]);

            if ($response->successful()) {
                return ['success' => true, 'data' => $response->json()];
            }

            return ['success' => false, 'message' => $response->body()];
        } catch (\Exception $e) {
            Log::error('Vapi test call failed: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function parseWebhookPayload(array $payload): array
    {
        $messageType = $payload['type'] ?? $payload['message'] ?? 'unknown';
        $callData = [];

        if ($messageType === 'end-of-call-report' || ($payload['status'] ?? null) === 'ended') {
            $callData = [
                'provider_call_id' => $payload['call']['id'] ?? $payload['callId'] ?? null,
                'provider_agent_id' => $payload['call']['assistantId'] ?? $payload['assistantId'] ?? null,
                'call_status' => 'completed',
                'call_duration_seconds' => $payload['call']['durationSeconds'] ?? $payload['durationSeconds'] ?? null,
                'call_started_at' => $payload['call']['startedAt'] ?? $payload['startedAt'] ?? null,
                'call_ended_at' => $payload['call']['endedAt'] ?? $payload['endedAt'] ?? null,
                'transcript' => $payload['call']['transcript'] ?? $payload['transcript'] ?? null,
                'summary' => $payload['call']['summary'] ?? $payload['summary'] ?? null,
                'outcome' => $payload['call']['outcome'] ?? $payload['outcome'] ?? null,
                'recording_url' => $payload['call']['recordingUrl'] ?? $payload['recordingUrl'] ?? null,
                'customer_phone_number' => $payload['call']['customer']['number'] ?? $payload['customer']['number'] ?? null,
                'customer_name' => $payload['call']['customer']['name'] ?? $payload['customer']['name'] ?? null,
                'call_direction' => $payload['call']['direction'] ?? $payload['direction'] ?? 'inbound',
                'raw_provider_payload' => $payload,
            ];
        } elseif ($messageType === 'conversation-update') {
            return [
                'event_type' => 'conversation-update',
                'provider_call_id' => $payload['call']['id'] ?? $payload['callId'] ?? null,
                'provider_agent_id' => $payload['call']['assistantId'] ?? $payload['assistantId'] ?? null,
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
