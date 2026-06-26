<?php

namespace App\Services;

use App\Models\WebhookEndpoint;
use App\Models\WebhookEvent;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookDispatchService
{
    private const MAX_RETRIES = 3;
    private const TIMEOUT_SECONDS = 10;
    private const RETRY_DELAY_MS = [1000, 5000, 15000];

    public function dispatch(string $eventType, array $payload, ?string $tenantId = null): array
    {
        $results = [];

        $endpoints = WebhookEndpoint::active()
            ->forEvent($eventType)
            ->when($tenantId, fn($q) => $q->forTenant($tenantId))
            ->get();

        if ($endpoints->isEmpty()) {
            return ['dispatched' => 0, 'results' => []];
        }

        foreach ($endpoints as $endpoint) {
            $result = $this->sendToEndpoint($endpoint, $eventType, $payload);
            $results[] = $result;

            if ($result['success']) {
                $endpoint->markSuccess();
            } else {
                $endpoint->markFailure();
            }
        }

        return [
            'dispatched' => count($results),
            'results' => $results,
        ];
    }

    public function sendToEndpoint(WebhookEndpoint $endpoint, string $eventType, array $payload): array
    {
        $startTime = microtime(true);

        $event = WebhookEvent::create([
            'tenant_id' => $endpoint->tenant_id,
            'webhook_endpoint_id' => $endpoint->id,
            'event_type' => $eventType,
            'payload' => $payload,
            'status' => 'pending',
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'user_agent' => request()->userAgent() ?? 'Sectros/1.0',
        ]);

        $body = [
            'event' => $eventType,
            'id' => (string) $event->id,
            'timestamp' => now()->toIso8601String(),
            'payload' => $payload,
        ];

        $bodyJson = json_encode($body);
        $signature = hash_hmac('sha256', $bodyJson, $endpoint->secret);
        $timestamp = (string) now()->unix();

        $signedPayload = json_encode([
            'event' => $eventType,
            'id' => (string) $event->id,
            'timestamp' => now()->toIso8601String(),
            'signature_version' => 'v1',
            'payload' => $payload,
        ]);

        $signatureV1 = hash_hmac('sha256', $signedPayload, $endpoint->secret);

        $lastError = null;
        $lastCode = null;
        $attempt = 0;

        do {
            $attempt++;

            try {
                $response = Http::timeout(self::TIMEOUT_SECONDS)
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'X-Sectros-Event' => $eventType,
                        'X-Sectros-Signature' => "v1={$signatureV1}",
                        'X-Sectros-Timestamp' => $timestamp,
                        'X-Sectros-Delivery-Id' => (string) $event->id,
                        'X-Sectros-Attempt' => (string) $attempt,
                        'User-Agent' => 'Sectros-Webhook/1.0',
                    ])
                    ->withBody($signedPayload, 'application/json')
                    ->post($endpoint->url);

                $lastCode = $response->status();
                $bodyResponse = $response->body();

                if ($response->successful()) {
                    $durationMs = (int) ((microtime(true) - $startTime) * 1000);

                    $event->update([
                        'status' => 'delivered',
                        'response_code' => $lastCode,
                        'response_body' => mb_substr($bodyResponse, 0, 4096),
                        'duration_ms' => $durationMs,
                        'delivered_at' => now(),
                    ]);

                    return [
                        'success' => true,
                        'endpoint_id' => $endpoint->id,
                        'event_id' => $event->id,
                        'status_code' => $lastCode,
                        'duration_ms' => $durationMs,
                        'attempt' => $attempt,
                    ];
                }

                $lastError = "HTTP {$lastCode}: " . mb_substr($bodyResponse, 0, 256);
            } catch (\Exception $e) {
                $lastError = $e->getMessage();
                $lastCode = 0;
            }

            if ($attempt < self::MAX_RETRIES) {
                usleep(self::RETRY_DELAY_MS[$attempt - 1] * 1000);
            }
        } while ($attempt < self::MAX_RETRIES);

        $durationMs = (int) ((microtime(true) - $startTime) * 1000);

        $event->update([
            'status' => 'failed',
            'response_code' => $lastCode,
            'response_body' => mb_substr($lastError ?? '', 0, 4096),
            'error_message' => $lastError,
            'duration_ms' => $durationMs,
        ]);

        Log::warning('Webhook delivery failed', [
            'endpoint_id' => $endpoint->id,
            'event_id' => $event->id,
            'url' => $endpoint->url,
            'error' => $lastError,
            'attempts' => $attempt,
        ]);

        return [
            'success' => false,
            'endpoint_id' => $endpoint->id,
            'event_id' => $event->id,
            'error' => $lastError,
            'duration_ms' => $durationMs,
            'attempt' => $attempt,
        ];
    }

    public function verifySignature(string $payload, string $signatureHeader, string $secret): bool
    {
        if (empty($signatureHeader)) {
            return false;
        }

        $parts = explode(',', $signatureHeader);
        foreach ($parts as $part) {
            $part = trim($part);
            if (str_starts_with($part, 'v1=')) {
                $receivedSig = substr($part, 3);
                $expectedSig = hash_hmac('sha256', $payload, $secret);
                if (hash_equals($expectedSig, $receivedSig)) {
                    return true;
                }
            }
        }

        return false;
    }
}
