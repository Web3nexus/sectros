<?php

namespace App\Services\Voice;

use App\Contracts\VoiceProviderInterface;
use App\Models\VoiceProvider;
use App\Services\Voice\VoiceCharacterProfiles;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ElevenLabsVoiceService implements VoiceProviderInterface
{
    protected VoiceProvider $provider;
    protected string $apiBase = 'https://api.elevenlabs.io';

    public function __construct(VoiceProvider $provider)
    {
        $this->provider = $provider;
    }

    public function testConnection(): array
    {
        try {
            $response = Http::timeout(10)->withHeaders([
                'xi-api-key' => $this->provider->api_key,
            ])->get($this->apiBase . '/v1/convai/agents');

            if ($response->successful()) {
                return ['success' => true, 'message' => 'Connected successfully'];
            }

            return ['success' => false, 'message' => 'Connection failed: ' . $response->body()];
        } catch (\Exception $e) {
            Log::error('ElevenLabs connection test failed: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function createAgent(array $config): array
    {
        try {
            $knowledgeBase = $config['knowledge_base'] ?? [];
            $prompt = $this->buildBusinessPrompt($config, $knowledgeBase);

            $firstMessage = $config['first_message'] ?? VoiceCharacterProfiles::getFirstMessage($config['business_type'] ?? 'restaurant');

            $agentConfig = [
                'prompt' => [
                    'prompt' => $prompt,
                ],
                'first_message' => $firstMessage,
                'language' => $config['language'] ?? 'en',
            ];

            if (!empty($config['voice_id'])) {
                $agentConfig['voice'] = ['voice_id' => $config['voice_id']];
            }

            $payload = [
                'name' => $config['business_name'] ?? 'Voice Agent',
                'conversation_config' => [
                    'agent' => $agentConfig,
                ],
            ];

            $response = Http::timeout(30)->withHeaders([
                'xi-api-key' => $this->provider->api_key,
                'Content-Type' => 'application/json',
            ])->post($this->apiBase . '/v1/convai/agents', $payload);

            if ($response->successful()) {
                $data = $response->json();
                $agentId = $data['agent_id'] ?? $data['id'] ?? null;
                if (empty($agentId)) {
                    Log::error('ElevenLabs create agent missing agent_id: ' . $response->body());
                    return ['success' => false, 'message' => 'Agent created but no agent_id returned'];
                }
                return [
                    'success' => true,
                    'agent_id' => $agentId,
                    'data' => $data,
                ];
            }

            Log::error('ElevenLabs create agent failed: ' . $response->body());
            return ['success' => false, 'message' => $response->body()];
        } catch (\Exception $e) {
            Log::error('ElevenLabs create agent exception: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function updateAgent(string $agentId, array $config): array
    {
        try {
            $payload = [];

            if (isset($config['business_name']) || isset($config['language']) || isset($config['system_prompt'])) {
                $knowledgeBase = $config['knowledge_base'] ?? [];
                $prompt = $this->buildBusinessPrompt($config, $knowledgeBase);

                $agentConfig = [
                'prompt' => [
                    'prompt' => $prompt,
                ],
                'first_message' => $config['first_message'] ?? VoiceCharacterProfiles::getFirstMessage($config['business_type'] ?? 'restaurant'),
                'language' => $config['language'] ?? 'en',
                ];

                if (!empty($config['voice_id'])) {
                    $agentConfig['voice'] = ['voice_id' => $config['voice_id']];
                } elseif (isset($config['remove_voice'])) {
                    $agentConfig['voice'] = null;
                }

                $payload['name'] = $config['business_name'] ?? 'Voice Agent';
                $payload['conversation_config'] = [
                    'agent' => $agentConfig,
                ];
            }

            $response = Http::timeout(30)->withHeaders([
                'xi-api-key' => $this->provider->api_key,
                'Content-Type' => 'application/json',
            ])->patch($this->apiBase . '/v1/convai/agents/' . $agentId, $payload);

            if ($response->successful()) {
                return ['success' => true, 'data' => $response->json()];
            }

            Log::error('ElevenLabs update agent failed: ' . $response->body());
            return ['success' => false, 'message' => $response->body()];
        } catch (\Exception $e) {
            Log::error('ElevenLabs update agent exception: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function deactivateAgent(string $agentId): array
    {
        try {
            $response = Http::timeout(10)->withHeaders([
                'xi-api-key' => $this->provider->api_key,
            ])->delete($this->apiBase . '/v1/convai/agents/' . $agentId);

            if ($response->successful() || $response->status() === 404) {
                return ['success' => true, 'message' => 'Agent deactivated'];
            }

            return ['success' => false, 'message' => $response->body()];
        } catch (\Exception $e) {
            Log::error('ElevenLabs deactivate agent failed: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function createTestCall(string $agentId, string $phoneNumber): array
    {
        try {
            $response = Http::timeout(15)->withHeaders([
                'xi-api-key' => $this->provider->api_key,
                'Content-Type' => 'application/json',
            ])->post($this->apiBase . '/v1/convai/agents/' . $agentId . '/start_phone_call', [
                'agent_id' => $agentId,
                'phone_number' => $phoneNumber,
            ]);

            if ($response->successful()) {
                return ['success' => true, 'data' => $response->json()];
            }

            return ['success' => false, 'message' => $response->body()];
        } catch (\Exception $e) {
            Log::error('ElevenLabs test call failed: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    protected function buildBusinessPrompt(array $config, array $knowledgeBase = []): string
    {
        $businessName = $config['business_name'] ?? 'the business';
        $businessType = $config['business_type'] ?? 'restaurant';
        $openingHours = $config['opening_hours'] ?? [];
        $bookingRules = $config['booking_rules'] ?? [];
        $offHoursBehavior = $config['off_hours_behavior'] ?? 'take_message';
        $escalationPhone = $config['escalation_phone_number'] ?? 'not configured';
        $fallbackMessage = $config['fallback_message'] ?? '';
        $systemPrompt = $config['system_prompt'] ?? '';
        $agentToken = $config['agent_token'] ?? '';
        $toolBaseUrl = config('app.url') . '/central-api/voice-agent/tools';

        if (empty($systemPrompt)) {
            $profile = VoiceCharacterProfiles::getProfile($businessType, $businessName);
            $systemPrompt = $profile['system_prompt'] ?? '';
        }

        $hoursText = '';
        if (!empty($openingHours) && is_array($openingHours)) {
            $hoursText = "\n\nBusiness Hours:\n";
            foreach ($openingHours as $day => $hours) {
                if (is_array($hours)) {
                    $open = $hours['open'] ?? '?';
                    $close = $hours['close'] ?? '?';
                    $hoursText .= "- {$day}: {$open} - {$close}\n";
                } elseif (is_string($hours)) {
                    $hoursText .= "- {$day}: {$hours}\n";
                }
            }
        }

        $kbText = '';
        if (!empty($knowledgeBase)) {
            $kbText = "\nKnowledge base information:\n";
            foreach ($knowledgeBase as $item) {
                $title = $item['title'] ?? 'Untitled';
                $content = $item['content'] ?? '';
                $kbText .= "- {$title}: {$content}\n";
            }
        }

        $rulesText = '';
        if (!empty($bookingRules) && is_array($bookingRules)) {
            $rulesText = "\nBooking Rules:\n";
            foreach ($bookingRules as $key => $value) {
                if (is_string($value)) {
                    $rulesText .= "- {$key}: {$value}\n";
                }
            }
        }

        $toolsText = <<<TOOLS

You have access to these tools to help customers:
1. Check availability - Use the check_availability tool before confirming any booking
2. Create reservation - Use the create_reservation tool to book
3. Cancel reservation - Use the cancel_reservation tool to cancel
4. Transfer to human - Use the transfer_to_human tool when the customer needs a person

To use tools, call the following endpoints with POST requests using the agent_token:
- Check availability: {$toolBaseUrl}/check-availability
- Create reservation: {$toolBaseUrl}/create-reservation
- Cancel reservation: {$toolBaseUrl}/cancel-reservation
- Transfer to human: {$toolBaseUrl}/transfer-to-human

Include the provided authentication token ({$agentToken}) in all tool calls so the system can identify which business you're calling for.

Off-hours behavior: {$offHoursBehavior}
Human handoff number: {$escalationPhone}
TOOLS;

        $prompt = <<<PROMPT
{$systemPrompt}
{$hoursText}
{$rulesText}
{$kbText}
{$toolsText}

{$fallbackMessage}
PROMPT;

        return trim($prompt);
    }

    public function parseWebhookPayload(array $payload): array
    {
        $eventType = $payload['event_type'] ?? $payload['type'] ?? 'unknown';
        $callData = [];

        if ($eventType === 'conversation_ended' || $eventType === 'conversation_completed') {
            $data = $payload['data'] ?? $payload['conversation'] ?? $payload;
            $callData = [
                'provider_call_id' => $data['conversation_id'] ?? $payload['conversation_id'] ?? null,
                'provider_agent_id' => $data['agent_id'] ?? $payload['agent_id'] ?? null,
                'call_status' => 'completed',
                'call_duration_seconds' => $data['duration_seconds'] ?? $data['duration'] ?? null,
                'call_started_at' => $data['start_time'] ?? $data['started_at'] ?? null,
                'call_ended_at' => $data['end_time'] ?? $data['ended_at'] ?? null,
                'transcript' => $data['transcript'] ?? $payload['transcript'] ?? null,
                'summary' => $data['summary'] ?? $payload['summary'] ?? null,
                'outcome' => $data['call_successful'] ?? $data['outcome'] ?? null,
                'recording_url' => $data['recording_url'] ?? $payload['recording_url'] ?? null,
                'customer_phone_number' => $data['caller_phone_number'] ?? $payload['from_number'] ?? null,
                'customer_name' => $data['caller_name'] ?? $payload['caller_name'] ?? null,
                'call_direction' => $data['direction'] ?? $payload['direction'] ?? 'inbound',
                'raw_provider_payload' => $payload,
            ];
        } elseif ($eventType === 'conversation_initiated' || $eventType === 'conversation_started') {
            $data = $payload['data'] ?? $payload['conversation'] ?? $payload;
            return [
                'event_type' => 'conversation_started',
                'provider_call_id' => $data['conversation_id'] ?? $payload['conversation_id'] ?? null,
                'provider_agent_id' => $data['agent_id'] ?? $payload['agent_id'] ?? null,
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
        try {
            $response = Http::timeout(10)->withHeaders([
                'xi-api-key' => $this->provider->api_key,
            ])->get($this->apiBase . '/v1/voices');

            if ($response->successful()) {
                $data = $response->json();
                $voices = $data['voices'] ?? [];
                return array_map(fn($v) => [
                    'voice_id' => $v['voice_id'] ?? '',
                    'name' => $v['name'] ?? 'Unknown',
                    'category' => $v['category'] ?? 'premade',
                    'labels' => $v['labels'] ?? [],
                    'preview_url' => $v['preview_url'] ?? null,
                ], $voices);
            }

            Log::error('ElevenLabs list voices failed: ' . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error('ElevenLabs list voices exception: ' . $e->getMessage());
            return [];
        }
    }
}
