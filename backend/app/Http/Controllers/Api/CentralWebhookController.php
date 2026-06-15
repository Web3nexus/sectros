<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantWhatsAppConnection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CentralWebhookController extends Controller
{
    /**
     * Handle Meta (WhatsApp/Facebook) Webhook Verification.
     */
    public function verify(Request $request)
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        $settings = \App\Models\SaaSSetting::all()->pluck('value', 'key');
        $expectedToken = $settings['social_verify_token'] ?? 'sectros_secret_token';

        if ($mode && $token) {
            if ($mode === 'subscribe' && $token === $expectedToken) {
                return response($challenge, 200);
            }
        }

        return response('Forbidden', 403);
    }

    /**
     * Handle incoming webhooks from WhatsApp, Facebook, Instagram.
     * This runs in the CENTRAL context (no tenancy initialized yet).
     */
    public function handle(Request $request)
    {
        $payload = $request->all();
        $signature = $request->header('X-Hub-Signature-256');

        $settings = \App\Models\SaaSSetting::all()->pluck('value', 'key');
        $appSecret = $settings['meta_app_secret'] ?? env('META_APP_SECRET');

        if (empty($appSecret)) {
            Log::critical('Social Webhook: META_APP_SECRET not configured');
            return response()->json(['error' => 'Server not configured for webhooks'], 500);
        }

        if (!$signature || !hash_equals('sha256=' . hash_hmac('sha256', $request->getContent(), $appSecret), $signature)) {
            Log::warning('Social Webhook: Invalid Signature', ['ip' => $request->ip()]);
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        Log::info('Incoming Meta Webhook', ['url' => $request->fullUrl(), 'method' => $request->method()]);

        $platform = 'Unknown';
        $potentialIds = [];

        if (isset($payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'])) {
            $platform = 'WhatsApp';
            $potentialIds[] = $payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'];
            if (isset($payload['entry'][0]['id'])) $potentialIds[] = $payload['entry'][0]['id'];
            if (isset($payload['entry'][0]['changes'][0]['value']['metadata']['display_phone_number'])) {
                $potentialIds[] = $payload['entry'][0]['changes'][0]['value']['metadata']['display_phone_number'];
            }
        } elseif (isset($payload['entry'][0]['id'])) {
            $platform = (isset($payload['object']) && $payload['object'] === 'instagram') ? 'Instagram' : 'Facebook';
            $potentialIds[] = $payload['entry'][0]['id'];
        } elseif (isset($payload['message']['platform_id'])) {
            $platform = $payload['message']['platform'] ?? 'Web';
            $potentialIds[] = $payload['message']['platform_id'];
        }

        $tenant = $this->resolveTenant($potentialIds, $platform);

        if (!$tenant) {
            Log::warning('Social Webhook: No matching tenant', ['potentialIds' => $potentialIds, 'platform' => $platform]);
            return response()->json(['status' => 'ignored', 'message' => 'No matching tenant found'], 200);
        }

        try {
            if ($platform === 'WhatsApp' && isset($payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'])) {
                $technicalId = $payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'];
                if (($tenant->whatsapp_technical_id ?? null) !== $technicalId) {
                    $tenant->whatsapp_technical_id = $technicalId;
                    $tenant->save();
                }
            }

            \App\Jobs\ProcessSocialWebhook::dispatch($tenant, $payload);

            return response()->json(['status' => 'EVENT_RECEIVED'], 200);
        } catch (\Exception $e) {
            Log::error('Central Webhook Dispatch Failed', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Internal error'], 500);
        }
    }

    /**
     * Resolve tenant by matching incoming IDs against:
     * 1. tenant_whatsapp_connections (phone_number_id, waba_id)
     * 2. Tenant model (whatsapp_id, facebook_page_id, instagram_id)
     */
    private function resolveTenant(array $potentialIds, string $platform): ?Tenant
    {
        foreach ($potentialIds as $id) {
            if (empty($id)) continue;

            $connection = TenantWhatsAppConnection::where('phone_number_id', $id)
                ->orWhere('waba_id', $id)
                ->first();

            if ($connection) {
                return Tenant::find($connection->tenant_id);
            }
        }

        return Tenant::all()->first(function ($t) use ($potentialIds) {
            $storedIds = array_filter([
                $t->whatsapp_id ?? null,
                $t->facebook_page_id ?? null,
                $t->instagram_id ?? null,
            ]);

            foreach ($potentialIds as $incomingId) {
                foreach ($storedIds as $storedId) {
                    if (empty($storedId)) continue;

                    if ($storedId == $incomingId) return true;

                    $normIncoming = preg_replace('/\D/', '', (string)$incomingId);
                    $normStored = preg_replace('/\D/', '', (string)$storedId);

                    if (!empty($normIncoming) && !empty($normStored)) {
                        if ($normIncoming === $normStored) return true;
                        if (strlen($normIncoming) >= 10 && strlen($normStored) >= 10) {
                            if (substr($normIncoming, -10) === substr($normStored, -10)) return true;
                        }
                    }

                    if (stripos((string)$storedId, (string)$incomingId) !== false) return true;
                }
            }
            return false;
        });
    }
}
