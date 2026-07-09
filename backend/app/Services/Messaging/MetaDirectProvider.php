<?php

namespace App\Services\Messaging;

use App\Contracts\MessagingProviderAdapter;
use App\Models\Channel;
use App\Models\MessagingProviderConfig;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaDirectProvider implements MessagingProviderAdapter
{
    const META_API_VERSION = 'v22.0';

    protected ?MessagingProviderConfig $config = null;

    public function __construct(?MessagingProviderConfig $config = null)
    {
        $this->config = $config;
    }

    public function getProviderName(): string
    {
        return 'Meta Direct';
    }

    public function getProviderKey(): string
    {
        return 'meta_direct';
    }

    public function connectAccount(Channel $channel, array $config): array
    {
        try {
            $appId = $config['app_id'] ?? $this->config?->config_json['app_id'] ?? '';
            $appSecret = $config['app_secret'] ?? $this->config?->api_secret ?? '';

            $response = Http::asForm()->post('https://graph.facebook.com/oauth/access_token', [
                'grant_type' => 'fb_exchange_token',
                'client_id' => $appId,
                'client_secret' => $appSecret,
                'fb_exchange_token' => $config['short_lived_token'] ?? '',
            ]);

            if (!$response->successful()) {
                return ['success' => false, 'error' => 'Token exchange failed: ' . ($response->json()['error']['message'] ?? 'unknown')];
            }

            $data = $response->json();
            $channel->access_token = $data['access_token'] ?? '';
            $channel->token_expires_at = now()->addSeconds($data['expires_in'] ?? 5184000);
            $channel->connection_status = 'connected';
            $channel->save();

            $this->subscribeToWebhooks($channel);

            return ['success' => true, 'channel' => $channel];
        } catch (\Exception $e) {
            Log::error('MetaDirect connectAccount failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function handleWebhook(array $payload, array $headers): array
    {
        $messages = [];

        try {
            if (isset($payload['entry'])) {
                foreach ($payload['entry'] as $entry) {
                    if (isset($entry['messaging'])) {
                        foreach ($entry['messaging'] as $messagingEvent) {
                            $message = $this->normalizeMessengerMessage($messagingEvent, $entry);
                            if ($message) $messages[] = $message;
                        }
                    }
                    if (isset($entry['changes'])) {
                        foreach ($entry['changes'] as $change) {
                            if (isset($change['value']['messages'])) {
                                foreach ($change['value']['messages'] as $msg) {
                                    $message = $this->normalizeInstagramMessage($msg, $change['value'], $entry);
                                    if ($message) $messages[] = $message;
                                }
                            }
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('MetaDirect webhook parse failed', ['error' => $e->getMessage()]);
        }

        return $messages;
    }

    public function sendMessage(Channel $channel, string $recipientId, string $message, array $metadata = []): array
    {
        try {
            $token = $channel->access_token;
            if (!$token) {
                return ['success' => false, 'error' => 'No access token available'];
            }

            if ($channel->channel_type === 'facebook') {
                $url = 'https://graph.facebook.com/' . self::META_API_VERSION . '/me/messages';
                $response = Http::withToken($token)->post($url, [
                    'recipient' => ['id' => $recipientId],
                    'message' => ['text' => $message],
                    'messaging_type' => 'RESPONSE',
                ]);
            } elseif ($channel->channel_type === 'instagram') {
                $igUserId = $channel->instagram_account_id;
                if (!$igUserId) {
                    return ['success' => false, 'error' => 'No Instagram account ID'];
                }
                $url = 'https://graph.facebook.com/' . self::META_API_VERSION . "/{$igUserId}/messages";
                $response = Http::withToken($token)->post($url, [
                    'recipient' => ['id' => $recipientId],
                    'message' => ['text' => $message],
                    'messaging_type' => 'RESPONSE',
                ]);
            } elseif ($channel->channel_type === 'whatsapp') {
                $phoneNumberId = $channel->phone_number_id;
                if (!$phoneNumberId) {
                    return ['success' => false, 'error' => 'No phone number ID'];
                }
                $url = 'https://graph.facebook.com/' . self::META_API_VERSION . "/{$phoneNumberId}/messages";
                $response = Http::withToken($token)->post($url, [
                    'messaging_product' => 'whatsapp',
                    'recipient_type' => 'individual',
                    'to' => $recipientId,
                    'type' => 'text',
                    'text' => ['body' => $message],
                ]);
            } else {
                return ['success' => false, 'error' => 'Unsupported channel type: ' . $channel->channel_type];
            }

            if ($response->successful()) {
                $body = $response->json();
                return [
                    'success' => true,
                    'external_message_id' => $body['messages'][0]['id'] ?? $body['message_id'] ?? null,
                    'provider_response' => $body,
                ];
            }

            Log::error('MetaDirect sendMessage failed', [
                'channel_type' => $channel->channel_type,
                'response' => $response->json(),
                'status' => $response->status(),
            ]);

            return ['success' => false, 'error' => $response->json()['error']['message'] ?? 'API request failed'];
        } catch (\Exception $e) {
            Log::error('MetaDirect sendMessage exception', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function sendTemplate(Channel $channel, string $recipientId, array $templateData): array
    {
        try {
            $token = $channel->access_token;
            if (!$token) {
                return ['success' => false, 'error' => 'No access token available'];
            }

            $phoneNumberId = $channel->phone_number_id;
            if (!$phoneNumberId) {
                return ['success' => false, 'error' => 'No phone number ID for template'];
            }

            $payload = [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $recipientId,
                'type' => 'template',
                'template' => [
                    'name' => $templateData['name'] ?? '',
                    'language' => ['code' => $templateData['language'] ?? 'en_US'],
                ],
            ];

            if (!empty($templateData['components'])) {
                $payload['template']['components'] = $templateData['components'];
            }

            $url = 'https://graph.facebook.com/' . self::META_API_VERSION . "/{$phoneNumberId}/messages";
            $response = Http::withToken($token)->post($url, $payload);

            if ($response->successful()) {
                $body = $response->json();
                return [
                    'success' => true,
                    'external_message_id' => $body['messages'][0]['id'] ?? null,
                    'provider_response' => $body,
                ];
            }

            return ['success' => false, 'error' => $response->json()['error']['message'] ?? 'Template send failed'];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function getMessageStatus(Channel $channel, string $externalMessageId): array
    {
        try {
            $token = $channel->access_token;
            if (!$token) return ['success' => false, 'error' => 'No token'];

            $url = 'https://graph.facebook.com/' . self::META_API_VERSION . "/{$externalMessageId}";
            $response = Http::withToken($token)->get($url, [
                'fields' => 'id,status,error',
            ]);

            if ($response->successful()) {
                return ['success' => true, 'status' => $response->json()];
            }

            return ['success' => false, 'error' => 'Status lookup failed'];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function disconnectAccount(Channel $channel): array
    {
        try {
            $this->unsubscribeFromWebhooks($channel);

            $channel->connection_status = 'disconnected';
            $channel->access_token = null;
            $channel->refresh_token = null;
            $channel->token_expires_at = null;
            $channel->save();

            return ['success' => true];
        } catch (\Exception $e) {
            Log::error('MetaDirect disconnect failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    protected function subscribeToWebhooks(Channel $channel): void
    {
        $token = $channel->access_token;
        $appId = $this->config?->config_json['app_id'] ?? '';
        $appSecret = $this->config?->api_secret ?? '';

        if ($channel->channel_type === 'facebook' && $channel->page_id) {
            $url = 'https://graph.facebook.com/' . self::META_API_VERSION . "/{$channel->page_id}/subscribed_apps";
            $response = Http::withToken($token)->post($url, [
                'subscribed_fields' => 'messages,message_deliveries,messaging_optins,messaging_postbacks',
                'access_token' => $token,
            ]);

            if ($response->successful()) {
                $channel->webhook_status = 'subscribed';
                $channel->webhook_subscribed_at = now();
                $channel->save();
            }
        }

        if ($channel->channel_type === 'instagram' && $channel->instagram_account_id) {
            $igUserId = $channel->instagram_account_id;
            $url = 'https://graph.facebook.com/' . self::META_API_VERSION . "/{$igUserId}/subscribed_apps";
            $response = Http::withToken($token)->post($url, [
                'subscribed_fields' => 'messages,message_deliveries,messaging_optins,messaging_postbacks',
                'access_token' => $token,
            ]);

            if ($response->successful()) {
                $channel->webhook_status = 'subscribed';
                $channel->webhook_subscribed_at = now();
                $channel->save();
            }
        }

        if ($channel->channel_type === 'whatsapp' && $channel->phone_number_id) {
            $url = 'https://graph.facebook.com/' . self::META_API_VERSION . "/{$channel->phone_number_id}/subscribed_apps";
            $response = Http::withToken($token)->post($url);

            if ($response->successful()) {
                $channel->webhook_status = 'subscribed';
                $channel->webhook_subscribed_at = now();
                $channel->save();
            }
        }
    }

    protected function unsubscribeFromWebhooks(Channel $channel): void
    {
        $token = $channel->access_token;

        if ($channel->channel_type === 'facebook' && $channel->page_id) {
            $url = 'https://graph.facebook.com/' . self::META_API_VERSION . "/{$channel->page_id}/subscribed_apps";
            Http::withToken($token)->delete($url);
        }

        if ($channel->channel_type === 'instagram' && $channel->instagram_account_id) {
            $url = 'https://graph.facebook.com/' . self::META_API_VERSION . "/{$channel->instagram_account_id}/subscribed_apps";
            Http::withToken($token)->delete($url);
        }

        if ($channel->channel_type === 'whatsapp' && $channel->phone_number_id) {
            $url = 'https://graph.facebook.com/' . self::META_API_VERSION . "/{$channel->phone_number_id}/subscribed_apps";
            Http::withToken($token)->delete($url);
        }
    }

    protected function normalizeMessengerMessage(array $event, array $entry): ?array
    {
        if (!isset($event['message']) || !isset($event['sender'])) return null;

        $message = $event['message'];
        $sender = $event['sender'];
        $recipient = $event['recipient'] ?? [];

        $text = null;
        $messageType = 'text';
        $mediaUrl = null;
        $mediaMimeType = null;

        if (isset($message['text'])) {
            $text = $message['text'];
        } elseif (isset($message['attachments'])) {
            foreach ($message['attachments'] as $attachment) {
                $messageType = $attachment['type'] ?? 'file';
                $mediaUrl = $attachment['payload']['url'] ?? null;
                $mediaMimeType = null;
                if (isset($attachment['payload']['sticker_id'])) {
                    $messageType = 'sticker';
                }
            }
        }

        return [
            'external_message_id' => $message['mid'] ?? null,
            'sender_id' => $sender['id'] ?? null,
            'recipient_id' => $recipient['id'] ?? null,
            'channel_type' => 'facebook',
            'message_type' => $messageType,
            'text' => $text,
            'media_url' => $mediaUrl,
            'media_mime_type' => $mediaMimeType,
            'timestamp' => isset($event['timestamp']) ? date('c', (int) ($event['timestamp'] / 1000)) : now()->toIso8601String(),
            'raw_payload' => $event,
            'page_id' => $entry['id'] ?? null,
        ];
    }

    protected function normalizeInstagramMessage(array $msg, array $value, array $entry): ?array
    {
        $text = null;
        $messageType = 'text';
        $mediaUrl = null;
        $mediaMimeType = null;

        if (isset($msg['text'])) {
            $text = $msg['text']['body'] ?? $msg['text'] ?? null;
        }

        if (isset($msg['image'])) {
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
        } elseif (isset($msg['sticker'])) {
            $messageType = 'sticker';
        } elseif (isset($msg['location'])) {
            $messageType = 'location';
            $text = ($msg['location']['latitude'] ?? '') . ',' . ($msg['location']['longitude'] ?? '');
        }

        return [
            'external_message_id' => $msg['id'] ?? null,
            'sender_id' => $value['contacts'][0]['wa_id'] ?? $msg['from'] ?? null,
            'recipient_id' => $value['metadata']['phone_number_id'] ?? $entry['id'] ?? null,
            'channel_type' => 'instagram',
            'message_type' => $messageType,
            'text' => $text,
            'media_url' => $mediaUrl,
            'media_mime_type' => $mediaMimeType,
            'timestamp' => isset($msg['timestamp']) ? \Carbon\Carbon::createFromTimestamp((int) $msg['timestamp'])->toIso8601String() : now()->toIso8601String(),
            'raw_payload' => $msg,
            'page_id' => $entry['id'] ?? null,
        ];
    }
}
