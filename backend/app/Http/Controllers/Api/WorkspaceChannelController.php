<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\MessagingProviderConfig;
use App\Models\SaaSSetting;
use App\Services\Messaging\MessagingProviderManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class WorkspaceChannelController extends Controller
{
    protected MessagingProviderManager $providerManager;

    public function __construct(MessagingProviderManager $providerManager)
    {
        $this->providerManager = $providerManager;
    }

    public function index(): JsonResponse
    {
        $tenantId = tenant('id');
        $channels = Channel::forTenant($tenantId)->orderBy('created_at', 'desc')->get()->map(function ($channel) {
            return [
                'id' => $channel->id,
                'integration_mode' => $channel->integration_mode,
                'channel_type' => $channel->channel_type,
                'provider_name' => $channel->provider_name,
                'external_account_id' => $channel->external_account_id,
                'page_id' => $channel->page_id,
                'page_name' => $channel->page_name,
                'instagram_account_id' => $channel->instagram_account_id,
                'instagram_username' => $channel->instagram_username,
                'phone_number_id' => $channel->phone_number_id,
                'display_phone_number' => $channel->display_phone_number,
                'waba_id' => $channel->waba_id,
                'has_access_token' => !empty($channel->access_token_encrypted),
                'token_expires_at' => $channel->token_expires_at?->toIso8601String(),
                'is_expired' => $channel->isExpired(),
                'webhook_status' => $channel->webhook_status,
                'webhook_subscribed_at' => $channel->webhook_subscribed_at?->toIso8601String(),
                'connection_status' => $channel->connection_status,
                'last_error' => $channel->last_error,
                'last_sync_at' => $channel->last_sync_at?->toIso8601String(),
                'created_at' => $channel->created_at->toIso8601String(),
            ];
        });

        $integrationMode = $this->getEffectiveIntegrationMode();

        return response()->json([
            'channels' => $channels,
            'integration_mode' => $integrationMode,
        ]);
    }

    public function initiateFacebookOAuth(): JsonResponse
    {
        $settings = $this->cacheSaaSSettings();
        $appId = $settings['meta_app_id'] ?? '';
        $redirectUri = $settings['meta_oauth_redirect_url'] ?: url('/api/auth/direct/callback');
        $permissions = $settings['meta_required_permissions'] ?? 'pages_messaging,pages_manage_metadata,instagram_basic,instagram_manage_messages';

        $state = Crypt::encryptString(json_encode([
            'tenant_id' => tenant('id'),
            'action' => 'connect_facebook',
            'timestamp' => now()->timestamp,
        ]));

        $oauthUrl = "https://www.facebook.com/v22.0/dialog/oauth?" . http_build_query([
            'client_id' => $appId,
            'redirect_uri' => $redirectUri,
            'state' => $state,
            'scope' => $permissions,
            'response_type' => 'code',
        ]);

        return response()->json(['oauth_url' => $oauthUrl]);
    }

    public function initiateInstagramOAuth(): JsonResponse
    {
        $settings = $this->cacheSaaSSettings();
        $appId = $settings['meta_app_id'] ?? '';
        $redirectUri = $settings['meta_oauth_redirect_url'] ?: url('/api/auth/direct/callback');
        $permissions = 'pages_show_list,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_manage_messages,instagram_manage_comments';

        $state = Crypt::encryptString(json_encode([
            'tenant_id' => tenant('id'),
            'action' => 'connect_instagram',
            'timestamp' => now()->timestamp,
        ]));

        $oauthUrl = "https://www.facebook.com/v22.0/dialog/oauth?" . http_build_query([
            'client_id' => $appId,
            'redirect_uri' => $redirectUri,
            'state' => $state,
            'scope' => $permissions,
            'response_type' => 'code',
        ]);

        return response()->json(['oauth_url' => $oauthUrl]);
    }

    public function handleOAuthCallback(Request $request)
    {
        $code = $request->input('code');
        $state = $request->input('state');
        $error = $request->input('error');

        if ($error) {
            return redirect()->away($this->getDashboardUrl() . '?oauth=error&reason=' . urlencode($error));
        }

        if (!$code || !$state) {
            return redirect()->away($this->getDashboardUrl() . '?oauth=error&reason=missing_params');
        }

        try {
            $stateData = json_decode(Crypt::decryptString($state), true);
            $action = $stateData['action'] ?? 'connect_facebook';
            $tenantId = $stateData['tenant_id'] ?? null;
        } catch (\Exception $e) {
            return redirect()->away($this->getDashboardUrl() . '?oauth=error&reason=invalid_state');
        }

        if (!$tenantId) {
            return redirect()->away($this->getDashboardUrl() . '?oauth=error&reason=no_tenant');
        }

        $tenant = \App\Models\Tenant::find($tenantId);
        if (!$tenant) {
            return redirect()->away($this->getDashboardUrl() . '?oauth=error&reason=tenant_not_found');
        }

        $settings = $this->cacheSaaSSettings();
        $appId = $settings['meta_app_id'] ?? '';
        $appSecret = SaaSSetting::where('key', 'meta_app_secret')->value('value') ?? '';
        $redirectUri = $settings['meta_oauth_redirect_url'] ?: url('/api/auth/direct/callback');

        $tokenResponse = Http::asForm()->post('https://graph.facebook.com/v22.0/oauth/access_token', [
            'client_id' => $appId,
            'client_secret' => $appSecret,
            'redirect_uri' => $redirectUri,
            'code' => $code,
        ]);

        if (!$tokenResponse->successful()) {
            return redirect()->away($this->getDashboardUrl($tenant) . '?oauth=error&reason=token_exchange_failed');
        }

        $tokenData = $tokenResponse->json();
        $shortLivedToken = $tokenData['access_token'] ?? '';

        $longTokenResponse = Http::asForm()->get('https://graph.facebook.com/v22.0/oauth/access_token', [
            'grant_type' => 'fb_exchange_token',
            'client_id' => $appId,
            'client_secret' => $appSecret,
            'fb_exchange_token' => $shortLivedToken,
        ]);

        $longTokenData = $longTokenResponse->successful() ? $longTokenResponse->json() : $tokenData;
        $accessToken = $longTokenData['access_token'] ?? $shortLivedToken;
        $expiresIn = $longTokenData['expires_in'] ?? 5184000;

        $pagesResponse = Http::withToken($accessToken)->get('https://graph.facebook.com/v22.0/me/accounts', [
            'fields' => 'id,name,access_token,instagram_business_account{id,username}',
        ]);

        if (!$pagesResponse->successful()) {
            return redirect()->away($this->getDashboardUrl($tenant) . '?oauth=error&reason=pages_fetch_failed');
        }

        $pages = $pagesResponse->json()['data'] ?? [];
        $connectedCount = 0;

        foreach ($pages as $page) {
            $channelData = [
                'tenant_id' => $tenantId,
                'integration_mode' => 'direct',
                'channel_type' => 'facebook',
                'provider_name' => 'meta',
                'external_account_id' => $page['id'],
                'page_id' => $page['id'],
                'page_name' => $page['name'] ?? null,
                'connection_status' => 'connected',
                'webhook_status' => 'subscribed',
                'webhook_subscribed_at' => now(),
                'token_expires_at' => now()->addSeconds($expiresIn),
            ];

            $channel = Channel::updateOrCreate(
                ['tenant_id' => $tenantId, 'channel_type' => 'facebook', 'external_account_id' => $page['id']],
                $channelData
            );
            $channel->access_token = $page['access_token'] ?? $accessToken;
            $channel->save();

            $this->subscribePageToWebhooks($channel);
            $connectedCount++;

            if (isset($page['instagram_business_account'])) {
                $ig = $page['instagram_business_account'];
                $igChannel = Channel::updateOrCreate(
                    ['tenant_id' => $tenantId, 'channel_type' => 'instagram', 'external_account_id' => $ig['id']],
                    [
                        'integration_mode' => 'direct',
                        'provider_name' => 'meta',
                        'page_id' => $page['id'],
                        'page_name' => $page['name'] ?? null,
                        'instagram_account_id' => $ig['id'],
                        'instagram_username' => $ig['username'] ?? null,
                        'connection_status' => 'connected',
                        'webhook_status' => 'subscribed',
                        'webhook_subscribed_at' => now(),
                        'token_expires_at' => now()->addSeconds($expiresIn),
                    ]
                );
                $igChannel->access_token = $page['access_token'] ?? $accessToken;
                $igChannel->save();

                $this->subscribePageToWebhooks($igChannel);
                $connectedCount++;
            }
        }

        return redirect()->away($this->getDashboardUrl($tenant) . '?oauth=success&count=' . $connectedCount);
    }

    protected function getDashboardUrl(?\App\Models\Tenant $tenant = null): string
    {
        if ($tenant) {
            $domain = $tenant->domains->first()?->domain;
            if ($domain) {
                return 'https://' . $domain . '/dashboard/channels';
            }
        }

        $centralDomain = config('tenancy.central_domains')[0] ?? 'sectrosweb.test';
        return 'https://' . $centralDomain . '/dashboard/channels';
    }

    public function connectWhatsApp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'provider_name' => 'required|string|in:360dialog,twilio,bird,custom,meta',
            'phone_number' => 'required|string',
            'phone_number_id' => 'required|string',
            'waba_id' => 'nullable|string',
            'api_key' => 'nullable|string',
            'display_phone_number' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $providerName = $request->provider_name;
        $integrationMode = $providerName === 'meta' ? 'direct' : 'bsp';

        $channel = Channel::updateOrCreate(
            [
                'tenant_id' => tenant('id'),
                'channel_type' => 'whatsapp',
                'external_account_id' => $request->phone_number_id,
            ],
            [
                'integration_mode' => $integrationMode,
                'provider_name' => $providerName,
                'phone_number_id' => $request->phone_number_id,
                'display_phone_number' => $request->display_phone_number ?? $request->phone_number,
                'waba_id' => $request->waba_id,
                'connection_status' => 'pending',
            ]
        );

        if ($request->api_key) {
            $channel->access_token = $request->api_key;
        }

        try {
            $adapter = $this->providerManager->resolveForChannel($channel);
            $result = $adapter->connectAccount($channel, $request->all());

            if ($result['success']) {
                $channel->connection_status = 'connected';
                $channel->save();
                return response()->json(['message' => 'WhatsApp channel connected', 'channel' => $channel]);
            }

            $channel->connection_status = 'error';
            $channel->last_error = $result['error'] ?? 'Unknown error';
            $channel->save();

            return response()->json(['error' => $result['error'] ?? 'Connection failed'], 400);
        } catch (\Exception $e) {
            $channel->connection_status = 'error';
            $channel->last_error = $e->getMessage();
            $channel->save();

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function disconnect($id): JsonResponse
    {
        $channel = Channel::forTenant(tenant('id'))->findOrFail($id);

        try {
            if ($channel->integration_mode !== 'partner') {
                $adapter = $this->providerManager->resolveForChannel($channel);
                $adapter->disconnectAccount($channel);
            }

            $channel->delete();

            return response()->json(['message' => 'Channel disconnected']);
        } catch (\Exception $e) {
            Log::error('Channel disconnect failed', ['error' => $e->getMessage()]);
            $channel->connection_status = 'disconnected';
            $channel->save();

            return response()->json(['message' => 'Channel disconnected with errors']);
        }
    }

    public function status($id): JsonResponse
    {
        $channel = Channel::forTenant(tenant('id'))->findOrFail($id);

        return response()->json([
            'id' => $channel->id,
            'channel_type' => $channel->channel_type,
            'integration_mode' => $channel->integration_mode,
            'connection_status' => $channel->connection_status,
            'webhook_status' => $channel->webhook_status,
            'is_expired' => $channel->isExpired(),
            'token_expires_at' => $channel->token_expires_at?->toIso8601String(),
            'last_error' => $channel->last_error,
            'last_sync_at' => $channel->last_sync_at?->toIso8601String(),
        ]);
    }

    protected function subscribePageToWebhooks(Channel $channel): void
    {
        $token = $channel->access_token;
        $success = false;
        $error = null;

        if ($channel->channel_type === 'facebook' && $channel->page_id) {
            $resp = Http::withToken($token)->timeout(15)->post("https://graph.facebook.com/v22.0/{$channel->page_id}/subscribed_apps", [
                'subscribed_fields' => 'messages,message_deliveries,messaging_optins,messaging_postbacks,message_reads',
            ]);
            $success = $resp->successful();
            if (!$success) {
                $error = 'Webhook subscription failed: ' . $resp->body();
            }
        }

        if ($channel->channel_type === 'instagram' && $channel->instagram_account_id) {
            $resp = Http::withToken($token)->timeout(15)->post("https://graph.facebook.com/v22.0/{$channel->instagram_account_id}/subscribed_apps", [
                'subscribed_fields' => 'messages,message_deliveries,messaging_optins,messaging_postbacks,message_reads',
            ]);
            $success = $resp->successful();
            if (!$success) {
                $error = 'Webhook subscription failed: ' . $resp->body();
            }
        }

        $channel->update([
            'webhook_status' => $success ? 'subscribed' : 'failed',
            'last_error' => $error,
        ]);
    }

    protected function getEffectiveIntegrationMode(): string
    {
        $settings = $this->cacheSaaSSettings();
        $mode = $settings['integration_mode'] ?? 'partner';

        if ($mode === 'workspace_choice') {
            $tenantMode = tenant('integration_mode');
            return $tenantMode ?: 'partner';
        }

        return $mode;
    }
}
