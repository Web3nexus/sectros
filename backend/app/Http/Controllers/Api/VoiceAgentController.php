<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VoiceAgentCall;
use App\Models\VoiceAgentKnowledgeBase;
use App\Models\VoiceAgentPhoneNumber;
use App\Models\VoiceAgentSetting;
use App\Models\VoiceAgentSubscription;
use App\Models\VoiceAgentUsage;
use App\Models\VoiceProvider;
use App\Models\SubscriptionPlan;
use App\Services\Voice\DefaultKnowledgeBasePopulator;
use App\Services\Voice\TwilioVoiceNumberService;
use App\Services\Voice\VoiceAgentCreditService;
use App\Services\Voice\VoiceCharacterProfiles;
use App\Services\Voice\VoiceProviderManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoiceAgentController extends Controller
{
    protected VoiceProviderManager $providerManager;

    public function __construct(VoiceProviderManager $providerManager)
    {
        $this->providerManager = $providerManager;
    }

    public function overview(): JsonResponse
    {
        $tenantId = tenant('id');
        $settings = VoiceAgentSetting::where('tenant_id', $tenantId)->first();
        $subscription = VoiceAgentSubscription::where('tenant_id', $tenantId)->first();

        $todayCalls = VoiceAgentCall::where('tenant_id', $tenantId)
            ->whereDate('created_at', today())
            ->count();

        $totalCalls = VoiceAgentCall::where('tenant_id', $tenantId)->count();

        $aiReservations = \App\Models\Reservation::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('source', 'ai_voice_agent')
            ->count();

        $recentCalls = VoiceAgentCall::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $recentAiReservations = \App\Models\Reservation::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('source', 'ai_voice_agent')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $currentMonth = now()->format('Y-m');
        $usage = VoiceAgentUsage::where('tenant_id', $tenantId)
            ->where('billing_month', $currentMonth)
            ->first();

        $providers = VoiceProvider::where('is_active', true)->get(['id', 'provider_name', 'provider_key']);

        $phoneNumber = null;
        if ($settings && $settings->assigned_phone_number_id) {
            $phoneNumber = VoiceAgentPhoneNumber::find($settings->assigned_phone_number_id);
        }

        $tenant = \App\Models\Tenant::find($tenantId);
        $credits = null;
        if ($tenant) {
            $plan = SubscriptionPlan::where('slug', $tenant->plan ?? 'free')->first();
            $monthlyLimit = $plan ? $plan->voice_credits_limit : 0;
            $used = $tenant->voice_credits_used ?? 0;
            $topup = $tenant->voice_credits_topup ?? 0;
            $remainingFromMonthly = max(0, $monthlyLimit - $used);
            $credits = [
                'used' => $used,
                'limit' => $monthlyLimit,
                'topup' => $topup,
                'remaining' => $remainingFromMonthly + $topup,
                'total' => $monthlyLimit + $topup,
            ];
        }

        return response()->json([
            'settings' => $settings,
            'subscription' => $subscription?->load('plan'),
            'today_calls' => $todayCalls,
            'total_calls' => $totalCalls,
            'ai_reservations' => $aiReservations,
            'recent_calls' => $recentCalls,
            'recent_ai_reservations' => $recentAiReservations,
            'usage' => $usage,
            'providers' => $providers,
            'phone_number' => $phoneNumber,
            'credits' => $credits,
        ]);
    }

    public function getPhoneNumber(): JsonResponse
    {
        $tenantId = tenant('id');
        $settings = VoiceAgentSetting::where('tenant_id', $tenantId)->first();

        $phoneNumber = null;
        if ($settings && $settings->assigned_phone_number_id) {
            $phoneNumber = VoiceAgentPhoneNumber::find($settings->assigned_phone_number_id);
        }

        return response()->json([
            'phone_number' => $phoneNumber,
            'settings' => $settings,
        ]);
    }

    public function getSettings(): JsonResponse
    {
        $tenantId = tenant('id');
        $settings = VoiceAgentSetting::where('tenant_id', $tenantId)->first();

        if (!$settings) {
            $defaultProvider = VoiceProvider::where('is_active', true)->where('is_default', true)->first();
            if (!$defaultProvider) {
                return response()->json(['message' => 'No active voice provider configured. Contact administrator.'], 500);
            }
            $businessType = tenant('business_type') ?? 'restaurant';
            $businessName = tenant('business_name') ?? '';
            $profile = VoiceCharacterProfiles::getProfile($businessType, $businessName);
            $settings = VoiceAgentSetting::create([
                'tenant_id' => $tenantId,
                'provider_id' => $defaultProvider->id,
                'language' => 'en',
                'voice_style' => $profile['voice_style'] ?? 'friendly_receptionist',
                'system_prompt' => $profile['system_prompt'] ?? '',
                'booking_enabled' => false,
                'is_active' => false,
            ]);
        }

        $providers = VoiceProvider::where('is_active', true)->get(['id', 'provider_name', 'provider_key']);

        return response()->json([
            'settings' => $settings,
            'providers' => $providers,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $tenantId = tenant('id');

        $validated = $request->validate([
            'provider_id' => 'nullable|exists:voice_providers,id',
            'business_name' => 'nullable|string|max:255',
            'business_type' => 'nullable|string|max:255',
            'business_phone_number' => 'nullable|string|max:20',
            'assigned_voice_phone_number' => 'nullable|string|max:20',
            'escalation_phone_number' => 'nullable|string|max:20',
            'language' => 'string|max:10',
            'voice_style' => 'string|max:100',
            'voice_id' => 'nullable|string|max:100',
            'opening_hours' => 'nullable|array',
            'off_hours_behavior' => 'nullable|string|in:allow_confirmed,pending_review,take_message,transfer_human',
            'booking_enabled' => 'boolean',
            'booking_rules' => 'nullable|array',
            'max_party_size' => 'nullable|integer|min:1|max:100',
            'reservation_duration_minutes' => 'nullable|integer|min:15|max:480',
            'advance_booking_days' => 'nullable|integer|min:0|max:365',
            'fallback_message' => 'nullable|string',
            'system_prompt' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $settings = VoiceAgentSetting::updateOrCreate(
            ['tenant_id' => $tenantId],
            $validated
        );

        if ($settings->is_active && $settings->provider_agent_id === null) {
            $this->syncAgentToProvider($settings);
            $this->syncKnowledgeBase($settings);
        }

        return response()->json([
            'message' => 'Settings updated',
            'settings' => $settings->fresh()->load('assignedPhoneNumber'),
        ]);
    }

    public function activateAgent(): JsonResponse
    {
        $tenantId = tenant('id');
        $settings = VoiceAgentSetting::where('tenant_id', $tenantId)->first();

        if (!$settings) {
            return response()->json(['message' => 'Configure settings first'], 422);
        }

        if (!$settings->assigned_phone_number_id) {
            $availableNumber = VoiceAgentPhoneNumber::available()->first();
            if (!$availableNumber) {
                return response()->json(['message' => 'No phone numbers available. Contact administrator.'], 500);
            }
            $availableNumber->assignToTenant($tenantId);
            $settings->assigned_phone_number_id = $availableNumber->id;
            $settings->save();
        }

        if (!$settings->provider_agent_id) {
            $result = $this->syncAgentToProvider($settings);
            if (!$result['success']) {
                return response()->json(['message' => $result['message'] ?? 'Failed to create agent'], 500);
            }

            $populator = app(DefaultKnowledgeBasePopulator::class);
            $populator->populate($tenantId);

            $this->syncKnowledgeBase($settings);
        }

        $phoneNumber = VoiceAgentPhoneNumber::find($settings->assigned_phone_number_id);
        if ($phoneNumber && $settings->provider_agent_id) {
            $twilio = new TwilioVoiceNumberService();
            if ($twilio->isAvailable()) {
                $twilio->linkNumberToAgent($phoneNumber, $settings);
            }
        }

        $settings->is_active = true;
        $settings->save();

        return response()->json([
            'message' => 'Voice agent activated successfully',
            'settings' => $settings->fresh()->load('assignedPhoneNumber'),
        ]);
    }

    public function deactivateAgent(): JsonResponse
    {
        $tenantId = tenant('id');
        $settings = VoiceAgentSetting::where('tenant_id', $tenantId)->firstOrFail();

        $settings->is_active = false;
        $settings->save();

        return response()->json([
            'message' => 'Voice agent deactivated',
            'settings' => $settings->fresh(),
        ]);
    }

    public function toggleActive(Request $request): JsonResponse
    {
        $tenantId = tenant('id');
        $settings = VoiceAgentSetting::where('tenant_id', $tenantId)->firstOrFail();

        $validated = $request->validate(['is_active' => 'required|boolean']);
        $settings->is_active = $validated['is_active'];

        if ($settings->is_active && $settings->provider_agent_id === null) {
            $result = $this->syncAgentToProvider($settings);
            if (!$result['success']) {
                return response()->json(['message' => $result['message'] ?? 'Failed to create agent'], 500);
            }
            $this->syncKnowledgeBase($settings);
        }

        if ($settings->is_active) {
            $phoneNumber = VoiceAgentPhoneNumber::find($settings->assigned_phone_number_id);
            if ($phoneNumber && $settings->provider_agent_id) {
                $twilio = new TwilioVoiceNumberService();
                if ($twilio->isAvailable()) {
                    $twilio->linkNumberToAgent($phoneNumber, $settings);
                }
            }
        }

        $settings->save();

        return response()->json([
            'message' => $settings->is_active ? 'Voice agent activated' : 'Voice agent deactivated',
            'settings' => $settings->fresh(),
        ]);
    }

    public function purchaseCredits(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|integer|min:1|max:100000',
        ]);

        $tenant = \App\Models\Tenant::find(tenant('id'));
        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found'], 404);
        }

        $tenant->increment('voice_credits_topup', $validated['amount']);

        return response()->json([
            'message' => "Successfully purchased {$validated['amount']} voice agent credits.",
            'credits' => VoiceAgentCreditService::getCreditsArray(),
        ]);
    }

    public function syncAgent(): JsonResponse
    {
        $tenantId = tenant('id');
        $settings = VoiceAgentSetting::where('tenant_id', $tenantId)->firstOrFail();

        $result = $this->syncAgentToProvider($settings);

        if (!$result['success']) {
            return response()->json(['message' => $result['message'] ?? 'Failed to sync agent'], 500);
        }

        $this->syncKnowledgeBase($settings);

        return response()->json([
            'message' => 'Agent synced successfully',
            'settings' => $settings->fresh(),
        ]);
    }

    public function testCall(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone_number' => 'required|string|max:20',
        ]);

        $tenantId = tenant('id');
        $settings = VoiceAgentSetting::where('tenant_id', $tenantId)->firstOrFail();

        if (!$settings->provider_agent_id) {
            return response()->json(['message' => 'Agent not configured. Save settings first.'], 422);
        }

        try {
            $provider = VoiceProvider::findOrFail($settings->provider_id);
            $service = $this->providerManager->resolve($provider);
            $result = $service->createTestCall($settings->provider_agent_id, $validated['phone_number']);

            if (!$result['success']) {
                return response()->json(['message' => $result['message']], 500);
            }

            return response()->json([
                'message' => 'Test call initiated',
                'data' => $result['data'],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    protected function syncAgentToProvider(VoiceAgentSetting $settings): array
    {
        try {
            $config = $settings->toArray();
            $config['knowledge_base'] = VoiceAgentKnowledgeBase::where('tenant_id', $settings->tenant_id)
                ->where('is_active', true)
                ->get()
                ->toArray();

            $provider = VoiceProvider::findOrFail($settings->provider_id);
            $service = $this->providerManager->resolve($provider);

            if ($settings->provider_agent_id) {
                $result = $service->updateAgent($settings->provider_agent_id, $config);
            } else {
                $result = $service->createAgent($config);
                if ($result['success'] && isset($result['agent_id'])) {
                    $settings->provider_agent_id = $result['agent_id'];
                    $settings->save();
                }
            }

            return $result;
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function getVoices(): JsonResponse
    {
        try {
            $tenantId = tenant('id');
            $settings = VoiceAgentSetting::where('tenant_id', $tenantId)->first();

            $provider = null;
            if ($settings && $settings->provider_id) {
                $provider = VoiceProvider::where('id', $settings->provider_id)
                    ->where('is_active', true)
                    ->first();
            }
            if (!$provider) {
                $provider = VoiceProvider::where('is_active', true)
                    ->where('is_default', true)
                    ->first();
            }
            if (!$provider) {
                return response()->json(['success' => false, 'message' => 'No active voice provider configured'], 400);
            }

            $service = $this->providerManager->resolve($provider);
            $voices = $service->getVoices();

            return response()->json([
                'success' => true,
                'provider' => $provider->provider_key,
                'voices' => $voices,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    protected function syncKnowledgeBase(VoiceAgentSetting $settings): void
    {
        try {
            $kbItems = VoiceAgentKnowledgeBase::where('tenant_id', $settings->tenant_id)
                ->where('is_active', true)
                ->get();

            if ($kbItems->isEmpty() || !$settings->provider_agent_id) return;

            $provider = VoiceProvider::find($settings->provider_id);
            if (!$provider) return;

            $service = $this->providerManager->resolve($provider);

            if ($settings->provider_agent_id) {
                $config = $settings->toArray();
                $config['knowledge_base'] = $kbItems->toArray();
                $service->updateAgent($settings->provider_agent_id, $config);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Knowledge base sync failed: ' . $e->getMessage());
        }
    }
}
