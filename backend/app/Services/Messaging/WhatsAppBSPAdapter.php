<?php

namespace App\Services\Messaging;

use App\Contracts\MessagingProviderAdapter;
use App\Models\Channel;
use App\Models\MessagingProviderConfig;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

abstract class WhatsAppBSPAdapter implements MessagingProviderAdapter
{
    protected ?MessagingProviderConfig $config = null;

    public function __construct(?MessagingProviderConfig $config = null)
    {
        $this->config = $config;
    }

    abstract protected function getBaseUrl(): string;
    abstract protected function getHeaders(Channel $channel): array;

    public function connectAccount(Channel $channel, array $config): array
    {
        $channel->connection_status = 'connected';
        $channel->save();
        return ['success' => true, 'channel' => $channel];
    }

    public function sendMessage(Channel $channel, string $recipientId, string $message, array $metadata = []): array
    {
        try {
            $url = $this->getBaseUrl() . '/messages';
            $headers = $this->getHeaders($channel);

            $payload = [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $recipientId,
                'type' => 'text',
                'text' => ['body' => $message],
            ];

            if ($channel->phone_number_id) {
                $payload['phone_number_id'] = $channel->phone_number_id;
            }

            $response = Http::withHeaders($headers)->post($url, $payload);

            if ($response->successful()) {
                $body = $response->json();
                return [
                    'success' => true,
                    'external_message_id' => $body['messages'][0]['id'] ?? null,
                    'provider_response' => $body,
                ];
            }

            Log::error(get_class($this) . ' sendMessage failed', [
                'response' => $response->json(),
                'status' => $response->status(),
            ]);

            return ['success' => false, 'error' => ($response->json()['error']['message'] ?? 'API request failed')];
        } catch (\Exception $e) {
            Log::error(get_class($this) . ' sendMessage exception', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function sendTemplate(Channel $channel, string $recipientId, array $templateData): array
    {
        try {
            $url = $this->getBaseUrl() . '/messages';
            $headers = $this->getHeaders($channel);

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

            if ($channel->phone_number_id) {
                $payload['phone_number_id'] = $channel->phone_number_id;
            }

            $response = Http::withHeaders($headers)->post($url, $payload);

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
        return ['success' => false, 'error' => 'Message status not directly supported by BSP API'];
    }

    public function disconnectAccount(Channel $channel): array
    {
        $channel->connection_status = 'disconnected';
        $channel->access_token = null;
        $channel->save();
        return ['success' => true];
    }

    public function handleWebhook(array $payload, array $headers): array
    {
        $messages = [];

        try {
            if (isset($payload['entry'])) {
                foreach ($payload['entry'] as $entry) {
                    if (isset($entry['changes'])) {
                        foreach ($entry['changes'] as $change) {
                            $value = $change['value'] ?? [];
                            if (isset($value['messages'])) {
                                foreach ($value['messages'] as $msg) {
                                    $normalized = $this->normalizeIncomingMessage($msg, $value, $entry);
                                    if ($normalized) $messages[] = $normalized;
                                }
                            }
                            if (isset($value['statuses'])) {
                                foreach ($value['statuses'] as $status) {
                                    $normalized = $this->normalizeStatusUpdate($status, $value);
                                    if ($normalized) $messages[] = $normalized;
                                }
                            }
                        }
                    }
                }
            }

            if (isset($payload['messages'])) {
                foreach ($payload['messages'] as $msg) {
                    $normalized = $this->normalizeDirectIncoming($msg, $payload);
                    if ($normalized) $messages[] = $normalized;
                }
            }
        } catch (\Exception $e) {
            Log::error(get_class($this) . ' webhook parse failed', ['error' => $e->getMessage()]);
        }

        return $messages;
    }

    protected function normalizeIncomingMessage(array $msg, array $value, array $entry): ?array
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
        } elseif (isset($msg['sticker'])) {
            $messageType = 'sticker';
            $text = $msg['sticker']['text'] ?? null;
        } elseif (isset($msg['button'])) {
            $messageType = 'button';
            $text = $msg['button']['text'] ?? null;
        } elseif (isset($msg['interactive'])) {
            $messageType = 'button';
            $text = $msg['interactive']['button_reply']['title'] ?? $msg['interactive']['list_reply']['title'] ?? null;
        } elseif (isset($msg['order'])) {
            $messageType = 'text';
            $text = 'Order message';
        } elseif (isset($msg['system'])) {
            $messageType = 'text';
            $text = $msg['system']['body'] ?? 'System message';
        } elseif (isset($msg['location'])) {
            $messageType = 'location';
            $text = ($msg['location']['latitude'] ?? '') . ',' . ($msg['location']['longitude'] ?? '');
        }

        $contacts = $value['contacts'][0] ?? [];

        return [
            'external_message_id' => $msg['id'] ?? null,
            'sender_id' => $contacts['wa_id'] ?? $msg['from'] ?? null,
            'recipient_id' => $value['metadata']['phone_number_id'] ?? $entry['id'] ?? null,
            'channel_type' => 'whatsapp',
            'message_type' => $messageType,
            'text' => $text,
            'media_url' => $mediaUrl,
            'timestamp' => isset($msg['timestamp'])
                ? \Carbon\Carbon::createFromTimestamp((int) $msg['timestamp'])->toIso8601String()
                : now()->toIso8601String(),
            'raw_payload' => $msg,
            'contact_name' => $contacts['profile']['name'] ?? null,
        ];
    }

    protected function normalizeStatusUpdate(array $status, array $value): ?array
    {
        return [
            'type' => 'status_update',
            'external_message_id' => $status['id'] ?? null,
            'status' => $status['status'] ?? 'unknown',
            'recipient_id' => $status['recipient_id'] ?? null,
            'timestamp' => isset($status['timestamp'])
                ? \Carbon\Carbon::createFromTimestamp((int) $status['timestamp'])->toIso8601String()
                : now()->toIso8601String(),
            'raw_payload' => $status,
            'conversation_id' => $status['conversation']['id'] ?? null,
        ];
    }

    protected function normalizeDirectIncoming(array $msg, array $payload): ?array
    {
        $text = $msg['text']['body'] ?? null;
        $messageType = 'text';

        if (isset($msg['type'])) {
            $messageType = $msg['type'];
        }

        if (isset($msg['media'])) {
            $messageType = $msg['media']['type'] ?? 'media';
        }

        return [
            'external_message_id' => $msg['id'] ?? null,
            'sender_id' => $msg['from'] ?? null,
            'recipient_id' => $payload['to'] ?? null,
            'channel_type' => 'whatsapp',
            'message_type' => $messageType,
            'text' => $text,
            'timestamp' => now()->toIso8601String(),
            'raw_payload' => $msg,
        ];
    }
}
