<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\MessagingProviderConfig;
use App\Models\SaaSSetting;
use App\Services\Messaging\MessagingProviderManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

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
            'integration_mode' => $settings['integration_mode'] ?? 'partner', // partner, direct, workspace_choice
            'partner_program_enabled' => filter_var($settings['partner_program_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'direct_meta_enabled' => filter_var($settings['direct_meta_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'bsp_mode_enabled' => filter_var($settings['bsp_mode_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'meta_app_id' => $settings['meta_app_id'] ?? '',
            'meta_app_secret' => $this->maskSecret($settings['meta_app_secret'] ?? ''),
            'meta_webhook_verify_token' => $this->maskSecret($settings['meta_webhook_verify_token'] ?? ''),
            'meta_oauth_redirect_url' => $settings['meta_oauth_redirect_url'] ?? '',
            'meta_required_permissions' => $settings['meta_required_permissions'] ?? 'pages_messaging,pages_manage_metadata,instagram_basic,instagram_manage_messages',
            'meta_webhook_callback_url' => $settings['meta_webhook_callback_url'] ?? '/api/social/webhook',
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $allowedKeys = [
            'integration_mode', 'partner_program_enabled', 'direct_meta_enabled', 'bsp_mode_enabled',
            'meta_app_id', 'meta_app_secret', 'meta_webhook_verify_token',
            'meta_oauth_redirect_url', 'meta_required_permissions', 'meta_webhook_callback_url',
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

    public function getProviders(): JsonResponse
    {
        $providers = MessagingProviderConfig::orderBy('provider_name')->get()->map(function ($provider) {
            return [
                'id' => $provider->id,
                'provider_key' => $provider->provider_key,
                'provider_name' => $provider->provider_name,
                'provider_type' => $provider->provider_type,
                'has_api_key' => !empty($provider->api_key_encrypted),
                'has_api_secret' => !empty($provider->api_secret_encrypted),
                'has_webhook_secret' => !empty($provider->webhook_secret_encrypted),
                'config_json' => $provider->config_json,
                'is_active' => $provider->is_active,
                'is_default' => $provider->is_default,
                'status' => $provider->status,
                'last_tested_at' => $provider->last_tested_at,
                'created_at' => $provider->created_at,
            ];
        });

        return response()->json(['providers' => $providers]);
    }

    public function storeProvider(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'provider_key' => 'required|string|unique:messaging_provider_configs|in:meta_direct,360dialog,twilio,bird,custom',
            'provider_name' => 'required|string|max:255',
            'provider_type' => 'required|string|in:meta_direct,whatsapp_bsp',
            'api_key' => 'nullable|string',
            'api_secret' => 'nullable|string',
            'webhook_secret' => 'nullable|string',
            'webhook_verify_token' => 'nullable|string',
            'config_json' => 'nullable|array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $provider = DB::transaction(function () use ($request) {
            if ($request->is_default) {
                MessagingProviderConfig::where('is_default', true)->update(['is_default' => false]);
            }

            $provider = new MessagingProviderConfig();
            $provider->provider_key = $request->provider_key;
            $provider->provider_name = $request->provider_name;
            $provider->provider_type = $request->provider_type;
            $provider->is_active = $request->is_active ?? false;
            $provider->is_default = $request->is_default ?? false;
            $provider->status = 'disconnected';

            if ($request->api_key) $provider->api_key = $request->api_key;
            if ($request->api_secret) $provider->api_secret = $request->api_secret;
            if ($request->webhook_secret) $provider->webhook_secret = $request->webhook_secret;
            if ($request->webhook_verify_token) $provider->webhook_verify_token = $request->webhook_verify_token;
            if ($request->config_json) $provider->config_json = $request->config_json;

            $provider->save();
            return $provider;
        });

        return response()->json([
            'message' => 'Messaging provider created',
            'provider' => $this->formatProvider($provider),
        ]);
    }

    public function updateProvider(Request $request, $id): JsonResponse
    {
        $provider = MessagingProviderConfig::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'provider_name' => 'string|max:255',
            'api_key' => 'nullable|string',
            'api_secret' => 'nullable|string',
            'webhook_secret' => 'nullable|string',
            'webhook_verify_token' => 'nullable|string',
            'config_json' => 'nullable|array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::transaction(function () use ($request, $provider, $id) {
            if ($request->has('is_default') && $request->is_default) {
                MessagingProviderConfig::where('is_default', true)->where('id', '!=', $id)->update(['is_default' => false]);
            }

            if ($request->has('provider_name')) $provider->provider_name = $request->provider_name;
            if ($request->has('is_active')) $provider->is_active = $request->is_active;
            if ($request->has('is_default')) $provider->is_default = $request->is_default;
            if ($request->filled('api_key')) $provider->api_key = $request->api_key;
            if ($request->filled('api_secret')) $provider->api_secret = $request->api_secret;
            if ($request->filled('webhook_secret')) $provider->webhook_secret = $request->webhook_secret;
            if ($request->filled('webhook_verify_token')) $provider->webhook_verify_token = $request->webhook_verify_token;
            if ($request->has('config_json')) $provider->config_json = $request->config_json;

            $provider->save();
        });

        return response()->json([
            'message' => 'Messaging provider updated',
            'provider' => $this->formatProvider($provider),
        ]);
    }

    public function testProvider($id): JsonResponse
    {
        $provider = MessagingProviderConfig::findOrFail($id);

        try {
            $adapter = $this->providerManager->resolve($provider);
            $result = $adapter->connectAccount(new \App\Models\Channel(), []);

            $provider->last_tested_at = now();
            $provider->status = $result['success'] ? 'connected' : 'disconnected';
            $provider->save();

            return response()->json([
                'message' => $result['success'] ? 'Connection successful' : ($result['error'] ?? 'Connection failed'),
                'status' => $provider->status,
                'last_tested_at' => $provider->last_tested_at,
            ]);
        } catch (\Exception $e) {
            $provider->status = 'disconnected';
            $provider->last_tested_at = now();
            $provider->save();

            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function destroyProvider($id): JsonResponse
    {
        $provider = MessagingProviderConfig::findOrFail($id);

        if ($provider->is_default) {
            return response()->json(['message' => 'Cannot delete the default provider'], 422);
        }

        $provider->delete();

        return response()->json(['message' => 'Messaging provider deleted']);
    }

    protected function formatProvider(MessagingProviderConfig $provider): array
    {
        return [
            'id' => $provider->id,
            'provider_key' => $provider->provider_key,
            'provider_name' => $provider->provider_name,
            'provider_type' => $provider->provider_type,
            'has_api_key' => !empty($provider->api_key_encrypted),
            'has_api_secret' => !empty($provider->api_secret_encrypted),
            'has_webhook_secret' => !empty($provider->webhook_secret_encrypted),
            'config_json' => $provider->config_json,
            'is_active' => $provider->is_active,
            'is_default' => $provider->is_default,
            'status' => $provider->status,
            'last_tested_at' => $provider->last_tested_at,
            'created_at' => $provider->created_at,
        ];
    }

    protected function maskSecret(?string $value): string
    {
        if (empty($value)) return '';
        if (strlen($value) <= 8) return str_repeat('*', strlen($value));
        return substr($value, 0, 4) . str_repeat('*', strlen($value) - 8) . substr($value, -4);
    }
}
