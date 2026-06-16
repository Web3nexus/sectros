<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SaaSSetting;
use App\Models\Tenant;
use App\Models\TenantWhatsAppConnection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TenantWhatsAppController extends Controller
{
    const META_API_VERSION = 'v22.0';

    private function getSettings()
    {
        return SaaSSetting::all()->pluck('value', 'key');
    }

    /**
     * Step 1: Generate the Meta Embedded Signup / OAuth URL.
     * The frontend opens this in a popup.
     */
    public function initiate(Request $request)
    {
        $tenant = tenant();
        $settings = $this->getSettings();

        $clientId = $settings['facebook_client_id'] ?? config('services.facebook.client_id');
        $clientSecret = $settings['facebook_client_secret'] ?? config('services.facebook.client_secret');

        if (empty($clientId) || empty($clientSecret)) {
            return response()->json(['error' => 'WhatsApp integration not configured. Contact support.'], 500);
        }

        $centralDomain = $settings['central_domain'] ?? 'sectros.com';
        $redirectUri = "https://{$centralDomain}/central-api/whatsapp/callback";

        $state = $tenant->id . '|' . Str::random(32);
        cache(["whatsapp_oauth_state_{$state}" => $tenant->id], 600);

        $url = "https://www.facebook.com/" . self::META_API_VERSION . "/dialog/oauth?" . http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'state' => $state,
            'scope' => 'whatsapp_business_management,whatsapp_business_messaging',
            'response_type' => 'code',
        ]);

        return response()->json([
            'url' => $url,
            'state' => $state,
        ]);
    }

    /**
     * Step 2: Handle the OAuth callback from Meta.
     * Exchanges code for token, fetches WABA/phone details, subscribes webhook.
     * Renders HTML that posts message to opener and closes popup.
     */
    public function handleCallback(Request $request)
    {
        $settings = $this->getSettings();
        $clientId = $settings['facebook_client_id'] ?? config('services.facebook.client_id');
        $clientSecret = $settings['facebook_client_secret'] ?? config('services.facebook.client_secret');
        $centralDomain = $settings['central_domain'] ?? 'sectros.com';
        $redirectUri = "https://{$centralDomain}/central-api/whatsapp/callback";

        $code = $request->query('code');
        $state = $request->query('state');
        $error = $request->query('error');

        if ($error) {
            Log::warning('WhatsApp Embedded Signup: User cancelled or error', ['error' => $request->query('error_description')]);
            return $this->popupResponse('error', 'Authentication cancelled or denied.');
        }

        if (empty($code) || empty($state)) {
            Log::error('WhatsApp Embedded Signup: Missing code or state');
            return $this->popupResponse('error', 'Missing authorization code.');
        }

        $tenantId = cache("whatsapp_oauth_state_{$state}");
        if (empty($tenantId)) {
            Log::error('WhatsApp Embedded Signup: Invalid or expired state', ['state' => $state]);
            return $this->popupResponse('error', 'Session expired. Please try again.');
        }

        cache()->forget("whatsapp_oauth_state_{$state}");

        try {
            $tokenResponse = Http::post('https://graph.facebook.com/' . self::META_API_VERSION . '/oauth/access_token', [
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'redirect_uri' => $redirectUri,
                'code' => $code,
            ]);

            if (!$tokenResponse->successful()) {
                Log::error('WhatsApp OAuth: Token exchange failed', ['response' => $tokenResponse->body()]);
                return $this->popupResponse('error', 'Failed to exchange authorization code.');
            }

            $shortLivedToken = $tokenResponse->json()['access_token'];
            $expiresIn = $tokenResponse->json()['expires_in'] ?? 5184000;

            $longLivedResponse = Http::get('https://graph.facebook.com/' . self::META_API_VERSION . '/oauth/access_token', [
                'grant_type' => 'fb_exchange_token',
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'fb_exchange_token' => $shortLivedToken,
            ]);

            $accessToken = $longLivedResponse->json()['access_token'] ?? $shortLivedToken;
            $expiresAt = now()->addSeconds($expiresIn);

            $businessResponse = Http::get('https://graph.facebook.com/' . self::META_API_VERSION . '/me/businesses', [
                'access_token' => $accessToken,
            ]);

            $businesses = $businessResponse->json()['data'] ?? [];

            if (empty($businesses)) {
                $wabaId = null;
                $metaBusinessId = null;

                $wabaResponse = Http::get('https://graph.facebook.com/' . self::META_API_VERSION . '/me/whatsapp_business_accounts', [
                    'access_token' => $accessToken,
                ]);

                $wabaList = $wabaResponse->json()['data'] ?? [];
                if (empty($wabaList)) {
                    return $this->popupResponse('error', 'No WhatsApp Business Account found. Create one in your Meta Business Manager first.');
                }
                $wabaId = $wabaList[0]['id'];
            } else {
                $metaBusinessId = $businesses[0]['id'];
                $wabaResponse = Http::get('https://graph.facebook.com/' . self::META_API_VERSION . '/' . $metaBusinessId . '/client_apps', [
                    'access_token' => $accessToken,
                    'app_type' => 'WHATSAPP_BUSINESS_ACCOUNT',
                ]);
                $wabaList = $wabaResponse->json()['data'] ?? [];

                if (empty($wabaList)) {
                    $wabaResponse = Http::get('https://graph.facebook.com/' . self::META_API_VERSION . '/' . $metaBusinessId . '/whatsapp_business_accounts', [
                        'access_token' => $accessToken,
                    ]);
                    $wabaList = $wabaResponse->json()['data'] ?? [];
                }

                if (empty($wabaList)) {
                    $wabaResponse = Http::get('https://graph.facebook.com/' . self::META_API_VERSION . '/me/whatsapp_business_accounts', [
                        'access_token' => $accessToken,
                    ]);
                    $wabaList = $wabaResponse->json()['data'] ?? [];
                }

                if (empty($wabaList)) {
                    return $this->popupResponse('error', 'No WhatsApp Business Account linked. Please create one in your Meta Business Manager.');
                }
                $wabaId = $wabaList[0]['id'];
            }

            $phoneResponse = Http::get('https://graph.facebook.com/' . self::META_API_VERSION . '/' . $wabaId . '/phone_numbers', [
                'access_token' => $accessToken,
            ]);

            $phoneNumbers = $phoneResponse->json()['data'] ?? [];

            if (empty($phoneNumbers)) {
                return $this->popupResponse('error', 'No phone number registered in your WhatsApp Business Account.');
            }

            $phoneNumber = $phoneNumbers[0];
            $phoneNumberId = $phoneNumber['id'];
            $displayPhoneNumber = $phoneNumber['display_phone_number'] ?? $phoneNumber['verified_name'] ?? null;

            $connection = TenantWhatsAppConnection::updateOrCreate(
                ['tenant_id' => $tenantId],
                [
                    'meta_business_id' => $metaBusinessId,
                    'waba_id' => $wabaId,
                    'phone_number_id' => $phoneNumberId,
                    'display_phone_number' => $displayPhoneNumber,
                    'token_expires_at' => $expiresAt,
                    'status' => 'connected',
                ]
            );
            $connection->access_token = $accessToken;
            $connection->save();

            $this->subscribeToWebhook($wabaId, $accessToken, $connection);

            $tenant = Tenant::find($tenantId);
            if ($tenant) {
                $tenant->whatsapp_id = $phoneNumberId;
                $tenant->save();
            }

            return $this->popupResponse('success', 'WhatsApp Business connected successfully!', [
                'phone_number_id' => $phoneNumberId,
                'display_phone_number' => $displayPhoneNumber,
                'waba_id' => $wabaId,
            ]);

        } catch (\Exception $e) {
            Log::error('WhatsApp Embedded Signup Failed', [
                'tenant_id' => $tenantId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->popupResponse('error', 'Connection failed: ' . $e->getMessage());
        }
    }

    /**
     * Subscribe the WABA to our central webhook.
     */
    private function subscribeToWebhook(string $wabaId, string $accessToken, TenantWhatsAppConnection $connection): void
    {
        $settings = $this->getSettings();
        $centralDomain = $settings['central_domain'] ?? 'sectros.com';
        $verifyToken = $settings['social_verify_token'] ?? null;
        if (!$verifyToken) {
            Log::error('WhatsApp: social_verify_token not configured');
            return;
        }
        $webhookUrl = "https://{$centralDomain}/central-api/social/webhook";

        try {
            $subscribeResponse = Http::post('https://graph.facebook.com/' . self::META_API_VERSION . '/' . $wabaId . '/subscribed_apps', [
                'access_token' => $accessToken,
                'subscribed_fields' => 'messages,message_deliveries,message_reads',
            ]);

            if ($subscribeResponse->successful()) {
                $subscriptionId = $subscribeResponse->json()['id'] ?? null;
                $connection->webhook_subscription_id = $subscriptionId;
                $connection->webhook_subscribed_at = now();
                $connection->save();

                Log::info('WhatsApp WABA subscribed to webhook', [
                    'tenant_id' => $connection->tenant_id,
                    'waba_id' => $wabaId,
                    'subscription_id' => $subscriptionId,
                ]);
            } else {
                Log::warning('WhatsApp WABA subscribe failed', [
                    'tenant_id' => $connection->tenant_id,
                    'waba_id' => $wabaId,
                    'response' => $subscribeResponse->body(),
                ]);
            }

            $configResponse = Http::post('https://graph.facebook.com/' . self::META_API_VERSION . '/' . $wabaId . '/subscribed_apps', [
                'access_token' => $accessToken,
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsApp webhook subscription error', [
                'tenant_id' => $connection->tenant_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get the tenant's WhatsApp connection status.
     */
    public function status(Request $request)
    {
        $tenant = tenant();
        $connection = TenantWhatsAppConnection::forTenant($tenant->id)->first();

        if (!$connection) {
            return response()->json([
                'connected' => false,
                'connection' => null,
            ]);
        }

        return response()->json([
            'connected' => $connection->isActive(),
            'connection' => [
                'id' => $connection->id,
                'display_phone_number' => $connection->display_phone_number,
                'phone_number_id' => $connection->phone_number_id,
                'waba_id' => $connection->waba_id,
                'meta_business_id' => $connection->meta_business_id,
                'status' => $connection->status,
                'token_expires_at' => $connection->token_expires_at,
                'webhook_subscribed_at' => $connection->webhook_subscribed_at,
                'created_at' => $connection->created_at,
            ],
        ]);
    }

    /**
     * Disconnect the tenant's WhatsApp connection.
     */
    public function disconnect(Request $request)
    {
        $tenant = tenant();
        $connection = TenantWhatsAppConnection::forTenant($tenant->id)->first();

        if (!$connection) {
            return response()->json(['error' => 'No WhatsApp connection found.'], 404);
        }

        try {
            $token = $connection->access_token;
            if ($token && $connection->waba_id) {
                Http::delete('https://graph.facebook.com/' . self::META_API_VERSION . '/' . $connection->waba_id . '/subscribed_apps', [
                    'access_token' => $token,
                ]);
            }
        } catch (\Exception $e) {
            Log::warning('WhatsApp unsubscribe cleanup failed', ['error' => $e->getMessage()]);
        }

        $connection->status = 'disconnected';
        $connection->save();

        $tenant = Tenant::find($tenant->id);
        if ($tenant) {
            $tenant->whatsapp_id = null;
            $tenant->save();
        }

        return response()->json(['message' => 'WhatsApp connection disconnected.']);
    }

    /**
     * Send a test message (for connection verification).
     */
    public function sendTest(Request $request)
    {
        $tenant = tenant();
        $request->validate([
            'to' => 'required|string',
            'message' => 'required|string|max:4096',
        ]);

        $connection = TenantWhatsAppConnection::forTenant($tenant->id)->active()->first();
        if (!$connection) {
            return response()->json(['error' => 'No active WhatsApp connection.'], 400);
        }

        $token = $connection->access_token;
        if (empty($token)) {
            return response()->json(['error' => 'Access token not available.'], 500);
        }

        try {
            $response = Http::withToken($token)->post(
                'https://graph.facebook.com/' . self::META_API_VERSION . '/' . $connection->phone_number_id . '/messages',
                [
                    'messaging_product' => 'whatsapp',
                    'to' => $request->to,
                    'type' => 'text',
                    'text' => ['body' => $request->message],
                ]
            );

            if ($response->successful()) {
                return response()->json(['success' => true, 'response' => $response->json()]);
            }

            Log::error('WhatsApp test message failed', ['response' => $response->body()]);
            return response()->json(['error' => 'Failed to send message.', 'details' => $response->json()], 400);

        } catch (\Exception $e) {
            Log::error('WhatsApp send test exception', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Render HTML for popup callback communication.
     */
    private function popupResponse(string $status, string $message, array $data = []): \Illuminate\Http\Response
    {
        $payload = json_encode(array_merge(['status' => $status, 'message' => $message], $data));
        $html = <<<HTML
<!DOCTYPE html>
<html><head><title>WhatsApp Connection</title></head><body>
<script>
if (window.opener) {
    window.opener.postMessage({$payload}, '*');
}
window.close();
</script>
<p>Connection {$status}. This window will close automatically.</p>
</body></html>
HTML;

        return response($html)->header('Content-Type', 'text/html');
    }
}
