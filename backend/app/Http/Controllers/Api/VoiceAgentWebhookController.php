<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VoiceAgentCall;
use App\Models\VoiceAgentSetting;
use App\Models\VoiceProvider;
use App\Services\Voice\VoiceAgentBillingService;
use App\Services\Voice\VoiceProviderManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VoiceAgentWebhookController extends Controller
{
    protected VoiceProviderManager $providerManager;
    protected VoiceAgentBillingService $billingService;

    public function __construct(VoiceProviderManager $providerManager, VoiceAgentBillingService $billingService)
    {
        $this->providerManager = $providerManager;
        $this->billingService = $billingService;
    }

    public function handle(Request $request, $providerKey): JsonResponse
    {
        $payload = $request->all();

        Log::info('Voice agent webhook received for provider: ' . $providerKey, [
            'provider' => $providerKey,
            'event' => $payload['type'] ?? $payload['event'] ?? 'unknown',
        ]);

        $provider = VoiceProvider::where('provider_key', $providerKey)
            ->where('is_active', true)
            ->first();

        if (!$provider) {
            Log::warning('Webhook received for inactive/unknown provider: ' . $providerKey);
            return response()->json(['message' => 'Provider not found'], 404);
        }

        if ($provider->webhook_secret) {
            $signature = $request->header('X-Provider-Signature')
                ?? $request->header('X-Vapi-Signature')
                ?? $request->header('X-Retell-Signature')
                ?? $request->header('X-ElevenLabs-Secret');

            if ($providerKey === 'elevenlabs') {
                if (!hash_equals($provider->webhook_secret, $signature ?? '')) {
                    Log::warning('Invalid ElevenLabs webhook secret', ['provider' => $providerKey]);
                    return response()->json(['message' => 'Invalid signature'], 401);
                }
            } else {
                $expectedSignature = hash_hmac('sha256', $request->getContent(), $provider->webhook_secret);
                if (!hash_equals($expectedSignature, $signature ?? '')) {
                    Log::warning('Invalid webhook signature', ['provider' => $providerKey]);
                    return response()->json(['message' => 'Invalid signature'], 401);
                }
            }
        } else {
            Log::warning('Processing webhook without signature validation - no webhook_secret configured', [
                'provider' => $providerKey,
            ]);
        }

        try {
            $service = $this->providerManager->resolve($provider);
            $parsedData = $service->parseWebhookPayload($payload);

            if (empty($parsedData)) {
                Log::info('Unhandled webhook event type', [
                    'provider' => $providerKey,
                    'event' => $payload['type'] ?? $payload['event'] ?? 'unknown',
                ]);
                return response()->json(['message' => 'Event received']);
            }

            if (isset($parsedData['event_type'])) {
                $this->handleInProgressCall($parsedData, $provider->id);
                return response()->json(['message' => 'Event received']);
            }

            DB::transaction(function () use ($parsedData, $provider) {
                $this->handleCompletedCall($parsedData, $provider->id);
            });

            return response()->json(['message' => 'Call processed']);
        } catch (\Exception $e) {
            Log::error('Webhook processing failed: ' . $e->getMessage(), [
                'provider' => $providerKey,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Processing failed'], 500);
        }
    }

    protected function handleInProgressCall(array $data, int $providerId): void
    {
        $agentSetting = VoiceAgentSetting::where('provider_agent_id', $data['provider_agent_id'])->first();

        if (!$agentSetting) {
            Log::warning('No tenant found for provider_agent_id: ' . ($data['provider_agent_id'] ?? 'none'));
            return;
        }

        VoiceAgentCall::updateOrCreate(
            [
                'provider_call_id' => $data['provider_call_id'],
                'tenant_id' => $agentSetting->tenant_id,
            ],
            [
                'tenant_id' => $agentSetting->tenant_id,
                'provider_id' => $providerId,
                'provider_agent_id' => $data['provider_agent_id'],
                'call_status' => $data['call_status'] ?? 'in_progress',
                'call_started_at' => $data['call_started_at'] ?? now(),
                'raw_provider_payload' => $data['raw_provider_payload'],
            ]
        );
    }

    protected function handleCompletedCall(array $data, int $providerId): void
    {
        $agentSetting = VoiceAgentSetting::where('provider_agent_id', $data['provider_agent_id'])->first();

        if (!$agentSetting) {
            $call = VoiceAgentCall::where('provider_call_id', $data['provider_call_id'])->first();
            if (!$call) {
                Log::warning('No tenant found for completed call', ['provider_call_id' => $data['provider_call_id'] ?? 'none']);
                return;
            }
            $agentSetting = VoiceAgentSetting::where('tenant_id', $call->tenant_id)->first();
            if (!$agentSetting) return;
        }

        $existingCall = VoiceAgentCall::where('provider_call_id', $data['provider_call_id'])
            ->where('tenant_id', $agentSetting->tenant_id)
            ->first();

        $alreadyBilled = $existingCall && $existingCall->call_status === 'completed';

        $call = VoiceAgentCall::updateOrCreate(
            [
                'provider_call_id' => $data['provider_call_id'],
                'tenant_id' => $agentSetting->tenant_id,
            ],
            [
                'tenant_id' => $agentSetting->tenant_id,
                'provider_id' => $providerId,
                'provider_agent_id' => $data['provider_agent_id'],
                'customer_name' => $data['customer_name'] ?? null,
                'customer_phone_number' => $data['customer_phone_number'] ?? null,
                'call_direction' => $data['call_direction'] ?? 'inbound',
                'call_status' => $data['call_status'] ?? 'completed',
                'call_duration_seconds' => $data['call_duration_seconds'] ?? null,
                'call_started_at' => $data['call_started_at'] ?? null,
                'call_ended_at' => $data['call_ended_at'] ?? now(),
                'transcript' => $data['transcript'] ?? null,
                'summary' => $data['summary'] ?? null,
                'outcome' => $data['outcome'] ?? null,
                'recording_url' => $data['recording_url'] ?? null,
                'raw_provider_payload' => $data['raw_provider_payload'],
            ]
        );

        if ($call->call_duration_seconds && !$alreadyBilled) {
            $this->billingService->recordUsage($agentSetting->tenant_id, $call->call_duration_seconds);
        }
    }
}
