<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\VoiceAgentSetting;
use App\Models\VoiceProvider;
use App\Services\Voice\VoiceProviderManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminVoiceProviderController extends Controller
{
    protected VoiceProviderManager $providerManager;

    public function __construct(VoiceProviderManager $providerManager)
    {
        $this->providerManager = $providerManager;
    }

    public function index(): JsonResponse
    {
        $providers = VoiceProvider::orderBy('provider_name')->get()->map(function ($provider) {
            return [
                'id' => $provider->id,
                'provider_name' => $provider->provider_name,
                'provider_key' => $provider->provider_key,
                'has_api_key' => !empty($provider->api_key_encrypted),
                'has_webhook_secret' => !empty($provider->webhook_secret_encrypted),
                'is_active' => $provider->is_active,
                'is_default' => $provider->is_default,
                'status' => $provider->status,
                'last_tested_at' => $provider->last_tested_at,
                'created_at' => $provider->created_at,
            ];
        });

        return response()->json(['providers' => $providers]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'provider_name' => 'required|string|max:255',
            'provider_key' => 'required|string|unique:voice_providers|in:vapi,retell,elevenlabs',
            'api_key' => 'nullable|string',
            'webhook_secret' => 'nullable|string',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $provider = DB::transaction(function () use ($request) {
            if ($request->is_default) {
                VoiceProvider::where('is_default', true)->update(['is_default' => false]);
            }

            $provider = new VoiceProvider();
            $provider->provider_name = $request->provider_name;
            $provider->provider_key = $request->provider_key;
            $provider->is_active = $request->is_active ?? false;
            $provider->is_default = $request->is_default ?? false;
            $provider->status = 'disconnected';

            if ($request->api_key) {
                $provider->api_key = $request->api_key;
            }
            if ($request->webhook_secret) {
                $provider->webhook_secret = $request->webhook_secret;
            }

            $provider->save();
            return $provider;
        });

        return response()->json([
            'message' => 'Provider created',
            'provider' => $this->formatProvider($provider),
        ]);
    }

    public function show($id): JsonResponse
    {
        $provider = VoiceProvider::findOrFail($id);

        return response()->json([
            'provider' => $this->formatProvider($provider),
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $provider = VoiceProvider::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'provider_name' => 'string|max:255',
            'api_key' => 'nullable|string',
            'webhook_secret' => 'nullable|string',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::transaction(function () use ($request, $provider, $id) {
            if ($request->has('is_default') && $request->is_default) {
                VoiceProvider::where('is_default', true)->where('id', '!=', $id)->update(['is_default' => false]);
            }

            if ($request->has('provider_name')) {
                $provider->provider_name = $request->provider_name;
            }
            if ($request->has('is_active')) {
                $provider->is_active = $request->is_active;
            }
            if ($request->has('is_default')) {
                $provider->is_default = $request->is_default;
            }

            if ($request->filled('api_key')) {
                $provider->api_key = $request->api_key;
            }
            if ($request->filled('webhook_secret')) {
                $provider->webhook_secret = $request->webhook_secret;
            }

            $provider->save();
        });

        return response()->json([
            'message' => 'Provider updated',
            'provider' => $this->formatProvider($provider),
        ]);
    }

    public function testConnection($id): JsonResponse
    {
        $provider = VoiceProvider::findOrFail($id);

        if (empty($provider->api_key_encrypted)) {
            return response()->json(['message' => 'API key not configured'], 422);
        }

        try {
            $service = $this->providerManager->resolve($provider);
            $result = $service->testConnection();

            $provider->last_tested_at = now();
            $provider->status = $result['success'] ? 'connected' : 'disconnected';
            $provider->save();

            return response()->json([
                'message' => $result['message'],
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

    public function destroy($id): JsonResponse
    {
        $provider = VoiceProvider::findOrFail($id);

        if ($provider->is_default) {
            return response()->json(['message' => 'Cannot delete the default provider'], 422);
        }

        $inUseCount = VoiceAgentSetting::where('provider_id', $provider->id)->count();
        if ($inUseCount > 0) {
            return response()->json([
                'message' => "Cannot delete provider: {$inUseCount} tenant(s) are using it",
            ], 422);
        }

        $provider->delete();

        return response()->json(['message' => 'Provider deleted']);
    }

    protected function formatProvider(VoiceProvider $provider): array
    {
        return [
            'id' => $provider->id,
            'provider_name' => $provider->provider_name,
            'provider_key' => $provider->provider_key,
            'has_api_key' => !empty($provider->api_key_encrypted),
            'has_webhook_secret' => !empty($provider->webhook_secret_encrypted),
            'is_active' => $provider->is_active,
            'is_default' => $provider->is_default,
            'status' => $provider->status,
            'last_tested_at' => $provider->last_tested_at,
            'created_at' => $provider->created_at,
        ];
    }
}
