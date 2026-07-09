<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageStatus;
use App\Models\AiReplyLog;
use App\Models\SaaSSetting;
use App\Services\Messaging\MessagingProviderManager;
use App\Events\NewMessageReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DirectWebhookController extends Controller
{
    protected MessagingProviderManager $providerManager;

    public function __construct(MessagingProviderManager $providerManager)
    {
        $this->providerManager = $providerManager;
    }

    public function verify(Request $request): JsonResponse|string
    {
        $mode = $request->input('hub_mode');
        $token = $request->input('hub_verify_token');
        $challenge = $request->input('hub_challenge');

        $settings = $this->cacheSaaSSettings();
        $expectedToken = $settings['meta_webhook_verify_token'] ?? SaaSSetting::get('social_verify_token', 'sectros_webhook_verify');

        if ($mode === 'subscribe' && $token === $expectedToken) {
            Log::info('Webhook verified successfully');
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        Log::warning('Webhook verification failed', ['mode' => $mode, 'token_provided' => !empty($token)]);
        return response()->json(['error' => 'Verification failed'], 403);
    }

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $headers = $request->headers->all();

        Log::info('Direct webhook received', ['object' => $payload['object'] ?? 'unknown']);

        try {
            $messages = $this->parseWebhookPayload($payload, $headers);

            foreach ($messages as $msgData) {
                if (isset($msgData['type']) && $msgData['type'] === 'status_update') {
                    $this->handleStatusUpdate($msgData);
                    continue;
                }

                $this->processIncomingMessage($msgData);
            }
        } catch (\Exception $e) {
            Log::error('Direct webhook processing failed', ['error' => $e->getMessage()]);
        }

        return response()->json(['status' => 'received']);
    }

    public function handleBspWebhook(Request $request, string $provider): JsonResponse
    {
        $payload = $request->all();
        $headers = $request->headers->all();

        Log::info('BSP webhook received', ['provider' => $provider]);

        try {
            $adapter = $this->providerManager->resolveByKey($provider);
            $messages = $adapter->handleWebhook($payload, $headers);

            foreach ($messages as $msgData) {
                if (isset($msgData['type']) && $msgData['type'] === 'status_update') {
                    $this->handleStatusUpdate($msgData);
                    continue;
                }
                $this->processIncomingMessage($msgData);
            }
        } catch (\Exception $e) {
            Log::error('BSP webhook processing failed', ['provider' => $provider, 'error' => $e->getMessage()]);
        }

        return response()->json(['status' => 'received']);
    }

    protected function parseWebhookPayload(array $payload, array $headers): array
    {
        $object = $payload['object'] ?? '';
        $messages = [];

        if ($object === 'instagram' || $object === 'page') {
            foreach ($payload['entry'] as $entry) {
                if (isset($entry['messaging'])) {
                    foreach ($entry['messaging'] as $event) {
                        if (isset($event['message'])) {
                            $messages[] = $this->normalizeMessengerEvent($event, $entry, $object);
                        }
                    }
                }
                if (isset($entry['changes'])) {
                    foreach ($entry['changes'] as $change) {
                        $value = $change['value'] ?? [];
                        if (isset($value['messages'])) {
                            foreach ($value['messages'] as $msg) {
                                $messages[] = $this->normalizeWhatsAppEvent($msg, $value, $entry);
                            }
                        }
                        if (isset($value['statuses'])) {
                            foreach ($value['statuses'] as $status) {
                                $messages[] = [
                                    'type' => 'status_update',
                                    'external_message_id' => $status['id'] ?? null,
                                    'status' => $status['status'] ?? 'unknown',
                                    'recipient_id' => $status['recipient_id'] ?? null,
                                    'timestamp' => ($status['timestamp'] ?? now()),
                                    'raw_payload' => $status,
                                ];
                            }
                        }
                    }
                }
            }
        }

        if ($object === 'whatsapp_business_account') {
            foreach ($payload['entry'] as $entry) {
                foreach ($entry['changes'] as $change) {
                    $value = $change['value'] ?? [];
                    if (isset($value['messages'])) {
                        foreach ($value['messages'] as $msg) {
                            $messages[] = $this->normalizeWhatsAppEvent($msg, $value, $entry);
                        }
                    }
                    if (isset($value['statuses'])) {
                        foreach ($value['statuses'] as $status) {
                            $messages[] = [
                                'type' => 'status_update',
                                'external_message_id' => $status['id'] ?? null,
                                'status' => $status['status'] ?? 'unknown',
                                'recipient_id' => $status['recipient_id'] ?? null,
                                'timestamp' => ($status['timestamp'] ?? now()),
                                'raw_payload' => $status,
                            ];
                        }
                    }
                }
            }
        }

        return $messages;
    }

    protected function normalizeMessengerEvent(array $event, array $entry, string $object): array
    {
        $message = $event['message'];
        $sender = $event['sender'];
        $recipient = $event['recipient'] ?? [];

        $channelType = $object === 'instagram' ? 'instagram' : 'facebook';
        $pageId = $entry['id'] ?? null;

        $text = null;
        $messageType = 'text';
        $mediaUrl = null;

        if (isset($message['text'])) {
            $text = $message['text'];
        } elseif (isset($message['attachments'])) {
            foreach ($message['attachments'] as $attachment) {
                $messageType = $attachment['type'] ?? 'file';
                $mediaUrl = $attachment['payload']['url'] ?? null;
            }
        }

        return [
            'external_message_id' => $message['mid'] ?? null,
            'sender_id' => $sender['id'] ?? null,
            'recipient_id' => $recipient['id'] ?? null,
            'channel_type' => $channelType,
            'message_type' => $messageType,
            'text' => $text,
            'media_url' => $mediaUrl,
            'timestamp' => isset($event['timestamp']) ? date('c', $event['timestamp'] / 1000) : now()->toIso8601String(),
            'raw_payload' => $event,
            'page_id' => $pageId,
        ];
    }

    protected function normalizeWhatsAppEvent(array $msg, array $value, array $entry): array
    {
        $text = null;
        $messageType = 'text';
        $mediaUrl = null;

        if (isset($msg['text'])) {
            $text = $msg['text']['body'] ?? null;
        } elseif (isset($msg['image'])) {
            $messageType = 'image';
            $mediaUrl = $msg['image']['link'] ?? $msg['image']['id'] ?? null;
        } elseif (isset($msg['video'])) {
            $messageType = 'video';
            $mediaUrl = $msg['video']['link'] ?? $msg['video']['id'] ?? null;
        } elseif (isset($msg['audio'])) {
            $messageType = 'audio';
            $mediaUrl = $msg['audio']['link'] ?? $msg['audio']['id'] ?? null;
        } elseif (isset($msg['document'])) {
            $messageType = 'document';
            $mediaUrl = $msg['document']['link'] ?? $msg['document']['id'] ?? null;
        } elseif (isset($msg['button'])) {
            $messageType = 'button';
            $text = $msg['button']['text'] ?? null;
        } elseif (isset($msg['interactive'])) {
            $messageType = 'button';
            $text = $msg['interactive']['button_reply']['title'] ?? $msg['interactive']['list_reply']['title'] ?? null;
        } elseif (isset($msg['order'])) {
            $messageType = 'text';
            $text = 'Order message';
        } elseif (isset($msg['location'])) {
            $messageType = 'location';
            $text = ($msg['location']['latitude'] ?? '') . ',' . ($msg['location']['longitude'] ?? '');
        }

        $contacts = $value['contacts'][0] ?? [];
        $metadata = $value['metadata'] ?? [];
        $phoneNumberId = $metadata['phone_number_id'] ?? null;

        return [
            'external_message_id' => $msg['id'] ?? null,
            'sender_id' => $contacts['wa_id'] ?? $msg['from'] ?? null,
            'recipient_id' => $phoneNumberId,
            'channel_type' => 'whatsapp',
            'message_type' => $messageType,
            'text' => $text,
            'media_url' => $mediaUrl,
            'timestamp' => ($msg['timestamp'] ?? now()),
            'raw_payload' => $msg,
            'contact_name' => $contacts['profile']['name'] ?? null,
        ];
    }

    protected function processIncomingMessage(array $msgData): void
    {
        $channelType = $msgData['channel_type'] ?? 'whatsapp';
        $senderId = $msgData['sender_id'] ?? null;
        $recipientId = $msgData['recipient_id'] ?? null;
        $pageId = $msgData['page_id'] ?? null;

        if (!$senderId) {
            Log::warning('Webhook message missing sender_id');
            return;
        }

        $channel = $this->resolveChannel($channelType, $recipientId, $pageId, $senderId);

        if (!$channel) {
            Log::warning('No matching channel found for webhook message', [
                'channel_type' => $channelType,
                'recipient_id' => $recipientId,
                'page_id' => $pageId,
            ]);
            return;
        }

        $contact = Contact::firstOrCreate(
            [
                'tenant_id' => $channel->tenant_id,
                'external_id' => $senderId,
                'channel_type' => $channelType,
            ],
            [
                'name' => $msgData['contact_name'] ?? $senderId,
                'phone' => $channelType === 'whatsapp' ? $senderId : null,
            ]
        );

        $conversation = Conversation::firstOrCreate(
            [
                'tenant_id' => $channel->tenant_id,
                'channel_id' => $channel->external_account_id,
                'contact_id' => $contact->id,
            ],
            [
                'channel_type' => $channelType,
                'status' => 'active',
                'last_message_at' => now(),
            ]
        );

        $message = Message::create([
            'tenant_id' => $channel->tenant_id,
            'conversation_id' => $conversation->id,
            'contact_id' => $contact->id,
            'channel_id' => $channel->external_account_id,
            'channel_type' => $channelType,
            'integration_mode' => $channel->integration_mode,
            'provider_name' => $channel->provider_name,
            'external_message_id' => $msgData['external_message_id'] ?? null,
            'sender_id' => $senderId,
            'recipient_id' => $recipientId,
            'direction' => 'incoming',
            'message_type' => $msgData['message_type'] ?? 'text',
            'text' => $msgData['text'] ?? null,
            'media_url' => $msgData['media_url'] ?? null,
            'raw_payload' => $msgData['raw_payload'] ?? null,
            'external_timestamp' => isset($msgData['timestamp']) ? date('Y-m-d H:i:s', strtotime($msgData['timestamp'])) : now(),
        ]);

        $conversation->update([
            'last_message_at' => now(),
            'unread_count' => $conversation->unread_count + 1,
        ]);

        // Broadcast to frontend
        try {
            event(new NewMessageReceived(
                (object)[
                    'id' => $message->id,
                    'is_reservation' => false,
                    'sender' => $contact->name ?? $senderId,
                    'platform' => $channelType,
                    'content' => $message->text ?? '[Media message]',
                    'reply' => null,
                    'status' => 'pending_manual',
                    'sentiment' => 'neutral',
                    'created_at' => $message->created_at,
                ],
                $channel->tenant_id
            ));
        } catch (\Exception $e) {
            Log::warning('Broadcast failed', ['error' => $e->getMessage()]);
        }

        // AI processing
        $this->processAiForMessage($message, $conversation, $channel);
    }

    protected function resolveChannel(string $channelType, ?string $recipientId, ?string $pageId, string $senderId): ?Channel
    {
        $tenantId = tenant('id');

        if ($channelType === 'facebook' && $pageId) {
            return Channel::forTenant($tenantId)
                ->where('channel_type', 'facebook')
                ->where('page_id', $pageId)
                ->where('connection_status', 'connected')
                ->first();
        }

        if ($channelType === 'instagram' && $pageId) {
            $channel = Channel::forTenant($tenantId)
                ->where('channel_type', 'instagram')
                ->where('page_id', $pageId)
                ->where('connection_status', 'connected')
                ->first();

            if (!$channel) {
                $channel = Channel::forTenant($tenantId)
                    ->where('channel_type', 'instagram')
                    ->where('instagram_account_id', $recipientId)
                    ->where('connection_status', 'connected')
                    ->first();
            }

            return $channel;
        }

        if ($channelType === 'whatsapp' && $recipientId) {
            $channel = Channel::forTenant($tenantId)
                ->where('channel_type', 'whatsapp')
                ->where('phone_number_id', $recipientId)
                ->where('connection_status', 'connected')
                ->first();

            if (!$channel) {
                $channel = Channel::forTenant($tenantId)
                    ->where('channel_type', 'whatsapp')
                    ->where('external_account_id', $recipientId)
                    ->where('connection_status', 'connected')
                    ->first();
            }

            return $channel;
        }

        return null;
    }

    protected function handleStatusUpdate(array $statusData): void
    {
        $externalMessageId = $statusData['external_message_id'] ?? null;
        $newStatus = $statusData['status'] ?? null;

        if (!$externalMessageId || !$newStatus) return;

        $message = Message::where('external_message_id', $externalMessageId)->first();
        if (!$message) return;

        MessageStatus::create([
            'tenant_id' => $message->tenant_id,
            'message_id' => $message->id,
            'status' => $newStatus,
            'provider_response' => $statusData['raw_payload'] ?? null,
            'status_changed_at' => now(),
        ]);
    }

    protected function processAiForMessage(Message $message, Conversation $conversation, Channel $channel): void
    {
        $tenantId = $channel->tenant_id;

        $tenant = \App\Models\Tenant::find($tenantId);
        if (!$tenant) return;

        $planSlug = $tenant->plan ?? 'free';
        $plan = \App\Models\SubscriptionPlan::where('slug', $planSlug)->first();
        $monthlyLimit = $plan ? $plan->ai_credits_limit : 10;
        $hasCredits = ($tenant->ai_credits_used ?? 0) < $monthlyLimit || ($tenant->ai_credits_topup ?? 0) > 0;

        if (!$hasCredits) return;
        if ($conversation->human_taken_over) return;

        $aiSettings = \App\Models\AiSetting::where('tenant_id', $tenantId)
            ->where('channel_id', $channel->external_account_id)
            ->first();

        $suggestedEnabled = $aiSettings?->suggested_replies_enabled ?? true;
        $autoReplyEnabled = $aiSettings?->auto_reply_enabled ?? false;

        if (!$suggestedEnabled && !$autoReplyEnabled) return;

        $settings = $this->cacheTenantSettings($tenantId);
        $globalAiEnabled = filter_var(\App\Models\SaaSSetting::get('global_ai_enabled', true), FILTER_VALIDATE_BOOLEAN);
        if (!$globalAiEnabled) return;

        try {
            $saasSettings = \App\Models\SaaSSetting::on('platform')->get()->pluck('value', 'key');
            $provider = $saasSettings['ai_provider'] ?? 'openai';
            $tone = $settings['ai_tone'] ?? 'Professional';
            $instructions = $settings['custom_instructions'] ?? '';

            $systemPrompt = "You are an AI assistant for " . ($tenant->business_name ?? 'the business') . ". ";
            $systemPrompt .= "Generate a helpful, " . $tone . " reply to this customer message. ";
            $systemPrompt .= "Keep replies concise and natural. ";
            if (!empty($instructions)) {
                $systemPrompt .= "Specific instructions: {$instructions}. ";
            }
            $systemPrompt .= "Respond with JSON: {\"reply\": \"your reply text\", \"sentiment\": \"positive|neutral|negative\"}";

            $messageText = $message->text ?? '[Media message]';

            $aiReply = $this->callAiProvider($provider, $systemPrompt, $messageText, $saasSettings);

            AiReplyLog::create([
                'tenant_id' => $tenantId,
                'message_id' => $message->id,
                'conversation_id' => $conversation->id,
                'channel_id' => $channel->external_account_id,
                'action' => $autoReplyEnabled ? 'auto_replied' : 'suggested',
                'original_message' => $messageText,
                'suggested_reply' => $aiReply['reply'] ?? null,
                'final_reply' => $autoReplyEnabled ? ($aiReply['reply'] ?? null) : null,
                'status' => 'pending',
                'ai_metadata' => ['provider' => $provider, 'sentiment' => $aiReply['sentiment'] ?? 'neutral'],
            ]);

            if ($autoReplyEnabled && !empty($aiReply['reply'])) {
                $adapter = $this->providerManager->resolveForChannel($channel);
                $sendResult = $adapter->sendMessage($channel, $message->sender_id, $aiReply['reply']);

                $outgoingMessage = Message::create([
                    'tenant_id' => $tenantId,
                    'conversation_id' => $conversation->id,
                    'contact_id' => $message->contact_id,
                    'channel_id' => $channel->external_account_id,
                    'channel_type' => $channel->channel_type,
                    'integration_mode' => $channel->integration_mode,
                    'provider_name' => $channel->provider_name,
                    'external_message_id' => $sendResult['external_message_id'] ?? null,
                    'sender_id' => $channel->external_account_id,
                    'recipient_id' => $message->sender_id,
                    'direction' => 'outgoing',
                    'message_type' => 'text',
                    'text' => $aiReply['reply'],
                    'is_ai_generated' => true,
                    'is_ai_reviewed' => false,
                ]);

                $conversation->update(['last_message_at' => now()]);

                if (!$sendResult['success']) {
                    MessageStatus::create([
                        'tenant_id' => $tenantId,
                        'message_id' => $outgoingMessage->id,
                        'status' => 'failed',
                        'error_message' => $sendResult['error'] ?? 'Send failed',
                        'status_changed_at' => now(),
                    ]);
                }

                try {
                    $tenant->increment('ai_credits_used');
                } catch (\Exception $e) {
                }

                AiReplyLog::where('message_id', $message->id)
                    ->where('conversation_id', $conversation->id)
                    ->update([
                        'final_reply' => $aiReply['reply'],
                        'status' => $sendResult['success'] ? 'sent' : 'failed',
                    ]);
            }
        } catch (\Exception $e) {
            Log::error('AI processing failed', ['error' => $e->getMessage()]);
        }
    }

    protected function callAiProvider(string $provider, string $systemPrompt, string $message, array $saasSettings): array
    {
        try {
            if ($provider === 'anthropic' || $provider === 'claude') {
                $apiKey = $saasSettings['claude_api_key'] ?? '';
                if (!$apiKey) return ['reply' => null, 'sentiment' => 'neutral'];

                $response = \Illuminate\Support\Facades\Http::withHeaders([
                    'x-api-key' => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'content-type' => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model' => 'claude-3-5-sonnet-20240620',
                    'max_tokens' => 500,
                    'system' => $systemPrompt,
                    'messages' => [['role' => 'user', 'content' => $message]],
                ]);

                if ($response->successful()) {
                    $text = $response->json()['content'][0]['text'] ?? '';
                    if (preg_match('/```json\s*(.*?)\s*```/s', $text, $matches)) {
                        $text = $matches[1];
                    }
                    return json_decode($text, true) ?: ['reply' => null, 'sentiment' => 'neutral'];
                }
            } elseif ($provider === 'gemini') {
                $apiKey = $saasSettings['gemini_api_key'] ?? '';
                if (!$apiKey) return ['reply' => null, 'sentiment' => 'neutral'];

                $response = \Illuminate\Support\Facades\Http::post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}",
                    [
                        'contents' => [['role' => 'user', 'parts' => [['text' => $systemPrompt . "\n\nCustomer: " . $message]]]],
                        'generationConfig' => ['responseMimeType' => 'application/json'],
                    ]
                );

                if ($response->successful()) {
                    $text = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '';
                    if (preg_match('/```json\s*(.*?)\s*```/s', $text, $matches)) {
                        $text = $matches[1];
                    }
                    return json_decode($text, true) ?: ['reply' => null, 'sentiment' => 'neutral'];
                }
            }

            $globalApiKey = $saasSettings['openai_api_key'] ?? config('openai.api_key');
            if (!empty($globalApiKey)) {
                config(['openai.api_key' => $globalApiKey]);
            }

            $response = \OpenAI\Laravel\Facades\OpenAI::chat()->create([
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $message],
                ],
                'response_format' => ['type' => 'json_object'],
            ]);

            return json_decode($response->choices[0]->message->content, true) ?: ['reply' => null, 'sentiment' => 'neutral'];
        } catch (\Exception $e) {
            Log::error('AI provider call failed', ['provider' => $provider, 'error' => $e->getMessage()]);
            return ['reply' => null, 'sentiment' => 'neutral'];
        }
    }
}
