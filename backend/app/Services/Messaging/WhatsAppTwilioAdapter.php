<?php

namespace App\Services\Messaging;

use App\Models\Channel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppTwilioAdapter extends WhatsAppBSPAdapter
{
    public function getProviderName(): string
    {
        return 'Twilio';
    }

    public function getProviderKey(): string
    {
        return 'twilio';
    }

    protected function getBaseUrl(): string
    {
        $accountSid = $this->config?->config_json['account_sid'] ?? '';
        return "https://api.twilio.com/2010-04-01/Accounts/{$accountSid}";
    }

    protected function getHeaders(Channel $channel): array
    {
        $accountSid = $this->config?->config_json['account_sid'] ?? '';
        $authToken = $this->config?->api_key ?? '';
        $basicAuth = base64_encode($accountSid . ':' . $authToken);

        return [
            'Authorization' => 'Basic ' . $basicAuth,
            'Content-Type' => 'application/x-www-form-urlencoded',
        ];
    }

    protected function formatTwilioNumber(string $number): string
    {
        $clean = str_replace('whatsapp:', '', $number);
        $clean = ltrim($clean, '+');
        return 'whatsapp:+' . $clean;
    }

    public function sendMessage(Channel $channel, string $recipientId, string $message, array $metadata = []): array
    {
        try {
            $accountSid = $this->config?->config_json['account_sid'] ?? '';
            $authToken = $this->config?->api_key ?? '';
            $fromRaw = $channel->phone_number_id ? $channel->phone_number_id : ($this->config?->config_json['from_number'] ?? '');
            $from = $this->formatTwilioNumber($fromRaw);
            $to = $this->formatTwilioNumber($recipientId);

            $url = "https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json";

            $response = Http::withBasicAuth($accountSid, $authToken)->asForm()->post($url, [
                'From' => $from,
                'To' => $to,
                'Body' => $message,
            ]);

            if ($response->successful()) {
                $body = $response->json();
                return [
                    'success' => true,
                    'external_message_id' => $body['sid'] ?? null,
                    'provider_response' => $body,
                ];
            }

            Log::error('Twilio sendMessage failed', [
                'response' => $response->json(),
                'status' => $response->status(),
            ]);

            return ['success' => false, 'error' => $response->json()['message'] ?? 'Twilio API request failed'];
        } catch (\Exception $e) {
            Log::error('Twilio sendMessage exception', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function sendTemplate(Channel $channel, string $recipientId, array $templateData): array
    {
        try {
            $accountSid = $this->config?->config_json['account_sid'] ?? '';
            $authToken = $this->config?->api_key ?? '';
            $fromRaw = $channel->phone_number_id ? $channel->phone_number_id : ($this->config?->config_json['from_number'] ?? '');
            $from = $this->formatTwilioNumber($fromRaw);
            $to = $this->formatTwilioNumber($recipientId);

            $url = "https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json";

            $payload = [
                'From' => $from,
                'To' => $to,
                'Body' => $templateData['body'] ?? '',
                'PersistentAction' => $templateData['actions'] ?? [],
            ];

            $response = Http::withBasicAuth($accountSid, $authToken)->asForm()->post($url, $payload);

            if ($response->successful()) {
                $body = $response->json();
                return [
                    'success' => true,
                    'external_message_id' => $body['sid'] ?? null,
                    'provider_response' => $body,
                ];
            }

            return ['success' => false, 'error' => $response->json()['message'] ?? 'Template send failed'];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function connectAccount(Channel $channel, array $config): array
    {
        try {
            $accountSid = $config['account_sid'] ?? $this->config?->config_json['account_sid'] ?? '';
            $authToken = $config['api_key'] ?? $this->config?->api_key ?? '';

            $url = "https://api.twilio.com/2010-04-01/Accounts/{$accountSid}.json";
            $response = Http::withBasicAuth($accountSid, $authToken)->get($url);

            if ($response->successful()) {
                $channel->connection_status = 'connected';
                $channel->provider_name = 'twilio';
                if (!empty($config['phone_number_id'])) {
                    $channel->phone_number_id = $config['phone_number_id'];
                }
                $channel->save();
                return ['success' => true, 'channel' => $channel];
            }

            return ['success' => false, 'error' => 'Twilio connection failed: ' . ($response->json()['message'] ?? 'unknown')];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function handleWebhook(array $payload, array $headers): array
    {
        $messages = [];
        try {
            if (isset($payload['SmsMessageSid']) || isset($payload['MessageSid'])) {
                $messages[] = [
                    'external_message_id' => $payload['MessageSid'] ?? $payload['SmsMessageSid'] ?? null,
                    'sender_id' => \Illuminate\Support\Str::replaceFirst('whatsapp:+', '', $payload['From'] ?? ''),
                    'recipient_id' => \Illuminate\Support\Str::replaceFirst('whatsapp:+', '', $payload['To'] ?? ''),
                    'channel_type' => 'whatsapp',
                    'message_type' => 'text',
                    'text' => $payload['Body'] ?? null,
                    'timestamp' => now()->toIso8601String(),
                    'raw_payload' => $payload,
                    'contact_name' => $payload['ProfileName'] ?? null,
                ];
            }
        } catch (\Exception $e) {
            Log::error('Twilio webhook parse failed', ['error' => $e->getMessage()]);
        }
        return $messages;
    }
}
