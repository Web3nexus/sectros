<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\SaaSSetting;
use App\Services\Messaging\MessagingProviderManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AdminMessagingController extends Controller
{
    protected MessagingProviderManager $providerManager;

    public function __construct(MessagingProviderManager $providerManager)
    {
        $this->providerManager = $providerManager;
    }

    public function getSettings(): JsonResponse
    {
        $settings = SaaSSetting::all()->pluck('value', 'key');

        return response()->json([
            // Integration modes
            'integration_mode' => $settings['integration_mode'] ?? 'meta_direct',
            'meta_direct_enabled' => filter_var($settings['meta_direct_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'legacy_tech_provider_enabled' => filter_var($settings['legacy_tech_provider_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'legacy_external_bsp_enabled' => filter_var($settings['legacy_external_bsp_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),

            // Meta App settings
            'meta_app_id' => $settings['meta_app_id'] ?? '',
            'meta_app_secret' => $this->maskSecret($settings['meta_app_secret'] ?? ''),
            'meta_business_id' => $settings['meta_business_id'] ?? '',
            'meta_webhook_verify_token' => $this->maskSecret($settings['meta_webhook_verify_token'] ?? ''),
            'meta_webhook_callback_url' => $settings['meta_webhook_callback_url'] ?? '/api/social/webhook',
            'meta_oauth_redirect_url' => $settings['meta_oauth_redirect_url'] ?? '',
            'meta_required_permissions' => $settings['meta_required_permissions'] ?? 'pages_messaging,pages_manage_metadata,instagram_basic,instagram_manage_messages',
            'whatsapp_embedded_signup_enabled' => filter_var($settings['whatsapp_embedded_signup_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'whatsapp_coexistence_enabled' => filter_var($settings['whatsapp_coexistence_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'coexistence_status' => $settings['coexistence_status'] ?? 'not_configured',

            // App details
            'data_deletion_callback_url' => $settings['data_deletion_callback_url'] ?? '',
            'privacy_policy_url' => $settings['privacy_policy_url'] ?? '',
            'terms_of_service_url' => $settings['terms_of_service_url'] ?? '',
            'app_review_status' => $settings['app_review_status'] ?? 'not_submitted',
            'whatsapp_cloud_api_status' => $settings['whatsapp_cloud_api_status'] ?? 'not_configured',
            'embedded_signup_status' => $settings['embedded_signup_status'] ?? 'not_configured',
            'instagram_messaging_status' => $settings['instagram_messaging_status'] ?? 'not_configured',
            'facebook_messaging_status' => $settings['facebook_messaging_status'] ?? 'not_configured',
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $allowedKeys = [
            'integration_mode', 'meta_direct_enabled', 'legacy_tech_provider_enabled', 'legacy_external_bsp_enabled',
            'meta_app_id', 'meta_app_secret', 'meta_business_id', 'meta_webhook_verify_token',
            'meta_oauth_redirect_url', 'meta_required_permissions', 'meta_webhook_callback_url',
            'whatsapp_embedded_signup_enabled', 'whatsapp_coexistence_enabled', 'coexistence_status',
            'data_deletion_callback_url', 'privacy_policy_url', 'terms_of_service_url',
            'app_review_status', 'whatsapp_cloud_api_status', 'embedded_signup_status',
            'instagram_messaging_status', 'facebook_messaging_status',
        ];

        $settings = $request->only($allowedKeys);

        foreach ($settings as $key => $value) {
            if (in_array($key, ['meta_app_secret', 'meta_webhook_verify_token']) && !empty($value) && str_contains($value, '*')) {
                continue;
            }

            $storeValue = $value;
            if (is_bool($value)) {
                $storeValue = $value ? 'true' : 'false';
            }

            SaaSSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $storeValue]
            );
        }

        SaaSSetting::forgetCache();

        return response()->json(['message' => 'Integration settings updated successfully']);
    }

    public function getHealth(): JsonResponse
    {
        $settings = $this->cacheSaaSSettings();

        $connectedWorkspaces = Channel::select('tenant_id')
            ->distinct()
            ->where('connection_status', 'connected')
            ->count();

        $whatsappNumbers = Channel::where('channel_type', 'whatsapp')
            ->where('connection_status', 'connected')
            ->count();

        $facebookPages = Channel::where('channel_type', 'facebook')
            ->where('connection_status', 'connected')
            ->count();

        $instagramAccounts = Channel::where('channel_type', 'instagram')
            ->where('connection_status', 'connected')
            ->count();

        $expiringTokens = Channel::whereNotNull('token_expires_at')
            ->where('token_expires_at', '<', now()->addDays(7))
            ->where('token_expires_at', '>', now())
            ->count();

        $expiredTokens = Channel::whereNotNull('token_expires_at')
            ->where('token_expires_at', '<', now())
            ->count();

        $webhookErrors = Channel::where('connection_status', 'error')
            ->orWhere('webhook_status', 'failed')
            ->count();

        $totalChannels = Channel::count();
        $connectedChannels = Channel::where('connection_status', 'connected')->count();
        $disconnectedChannels = Channel::where('connection_status', 'disconnected')->count();
        $errorChannels = Channel::where('connection_status', 'error')->count();

        return response()->json([
            'meta_direct_enabled' => filter_var($settings['meta_direct_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'integration_mode' => $settings['integration_mode'] ?? 'meta_direct',
            'connected_workspaces' => $connectedWorkspaces,
            'connected_whatsapp_numbers' => $whatsappNumbers,
            'connected_facebook_pages' => $facebookPages,
            'connected_instagram_accounts' => $instagramAccounts,
            'total_channels' => $totalChannels,
            'connected_channels' => $connectedChannels,
            'disconnected_channels' => $disconnectedChannels,
            'error_channels' => $errorChannels,
            'expiring_tokens' => $expiringTokens,
            'expired_tokens' => $expiredTokens,
            'webhook_errors' => $webhookErrors,
            'connected_workspaces_list' => Channel::where('connection_status', 'connected')
                ->select('tenant_id', 'channel_type', 'display_phone_number', 'page_name', 'instagram_username', 'connection_status', 'last_error')
                ->get()
                ->groupBy('tenant_id')
                ->map(function ($channels, $tenantId) {
                    return [
                        'tenant_id' => $tenantId,
                        'channels' => $channels,
                    ];
                })->values(),
            'expiring_tokens_list' => Channel::whereNotNull('token_expires_at')
                ->where('token_expires_at', '<', now()->addDays(7))
                ->select('tenant_id', 'channel_type', 'token_expires_at', 'connection_status')
                ->get(),
            'webhook_errors_list' => Channel::where('connection_status', 'error')
                ->orWhere('webhook_status', 'failed')
                ->select('id', 'tenant_id', 'channel_type', 'last_error', 'webhook_status', 'connection_status')
                ->get(),
        ]);
    }

    public function refreshHealth(): JsonResponse
    {
        return $this->getHealth();
    }

    public function retryWebhook($channelId): JsonResponse
    {
        $channel = Channel::findOrFail($channelId);

        try {
            $token = $channel->access_token;
            $success = false;

            if ($channel->channel_type === 'facebook' && $channel->page_id) {
                $resp = Http::withToken($token)->timeout(15)->post("https://graph.facebook.com/v22.0/{$channel->page_id}/subscribed_apps", [
                    'subscribed_fields' => 'messages,message_deliveries,messaging_optins,messaging_postbacks,message_reads',
                ]);
                $success = $resp->successful();
                $channel->webhook_status = $success ? 'subscribed' : 'failed';
                $channel->last_error = $success ? null : 'Resubscription failed: ' . $resp->body();
            } elseif ($channel->channel_type === 'instagram' && $channel->instagram_account_id) {
                $resp = Http::withToken($token)->timeout(15)->post("https://graph.facebook.com/v22.0/{$channel->instagram_account_id}/subscribed_apps", [
                    'subscribed_fields' => 'messages,message_deliveries,messaging_optins,messaging_postbacks,message_reads',
                ]);
                $success = $resp->successful();
                $channel->webhook_status = $success ? 'subscribed' : 'failed';
                $channel->last_error = $success ? null : 'Resubscription failed: ' . $resp->body();
            } elseif ($channel->channel_type === 'whatsapp' && $channel->phone_number_id) {
                $settings = $this->cacheSaaSSettings();
                $resp = Http::withToken($token)->timeout(15)->post("https://graph.facebook.com/v22.0/{$channel->phone_number_id}/subscribed_apps", [
                    'subscribed_fields' => 'messages,message_deliveries,messaging_optins,messaging_postbacks,message_reads',
                ]);
                $success = $resp->successful();
                $channel->webhook_status = $success ? 'subscribed' : 'failed';
                $channel->last_error = $success ? null : 'Resubscription failed: ' . $resp->body();
            }

            $channel->connection_status = $success ? 'connected' : 'error';
            $channel->save();

            return response()->json([
                'success' => $success,
                'webhook_status' => $channel->webhook_status,
                'connection_status' => $channel->connection_status,
            ]);
        } catch (\Exception $e) {
            $channel->webhook_status = 'failed';
            $channel->last_error = $e->getMessage();
            $channel->connection_status = 'error';
            $channel->save();

            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Legacy providers — disabled by default, read-only view
    public function getLegacyProviders(): JsonResponse
    {
        $providers = \App\Models\MessagingProviderConfig::orderBy('provider_name')->get()->map(function ($provider) {
            return [
                'id' => $provider->id,
                'provider_key' => $provider->provider_key,
                'provider_name' => $provider->provider_name,
                'provider_type' => $provider->provider_type,
                'has_api_key' => !empty($provider->api_key_encrypted),
                'has_api_secret' => !empty($provider->api_secret_encrypted),
                'is_active' => $provider->is_active,
                'is_default' => $provider->is_default,
                'status' => $provider->status,
                'created_at' => $provider->created_at,
            ];
        });

        return response()->json(['legacy_providers' => $providers]);
    }

    protected function maskSecret(?string $value): string
    {
        if (empty($value)) return '';
        if (strlen($value) <= 8) return str_repeat('*', strlen($value));
        return substr($value, 0, 4) . str_repeat('*', strlen($value) - 8) . substr($value, -4);
    }
}
