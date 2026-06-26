<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VoiceAgentKnowledgeBase;
use App\Models\VoiceAgentSetting;
use App\Models\VoiceProvider;
use App\Services\Voice\VoiceProviderManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VoiceAgentKnowledgeBaseController extends Controller
{
    protected VoiceProviderManager $providerManager;

    public function __construct(VoiceProviderManager $providerManager)
    {
        $this->providerManager = $providerManager;
    }

    public function index(): JsonResponse
    {
        $items = VoiceAgentKnowledgeBase::where('tenant_id', tenant('id'))
            ->orderBy('category')
            ->orderBy('title')
            ->paginate(50);

        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        $item = VoiceAgentKnowledgeBase::create(array_merge(
            $validated,
            ['tenant_id' => tenant('id')]
        ));

        $this->syncToAgent();

        return response()->json([
            'message' => 'Knowledge base item created',
            'item' => $item,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $item = VoiceAgentKnowledgeBase::where('tenant_id', tenant('id'))->findOrFail($id);

        return response()->json(['item' => $item]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $item = VoiceAgentKnowledgeBase::where('tenant_id', tenant('id'))->findOrFail($id);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'content' => 'nullable|string',
            'category' => 'string|max:100',
            'is_active' => 'boolean',
        ]);

        $item->update($validated);

        $this->syncToAgent();

        return response()->json([
            'message' => 'Knowledge base item updated',
            'item' => $item->fresh(),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $item = VoiceAgentKnowledgeBase::where('tenant_id', tenant('id'))->findOrFail($id);
        $item->delete();

        $this->syncToAgent();

        return response()->json(['message' => 'Knowledge base item deleted']);
    }

    protected function syncToAgent(): void
    {
        try {
            $settings = VoiceAgentSetting::where('tenant_id', tenant('id'))->first();
            if (!$settings || !$settings->provider_agent_id) return;

            $provider = VoiceProvider::find($settings->provider_id);
            if (!$provider) return;

            $service = $this->providerManager->resolve($provider);

            $kbItems = VoiceAgentKnowledgeBase::where('tenant_id', tenant('id'))
                ->where('is_active', true)
                ->get();

            $config = $settings->toArray();
            $config['knowledge_base'] = $kbItems->toArray();
            $service->updateAgent($settings->provider_agent_id, $config);
        } catch (\Exception $e) {
            Log::error('VoiceAgent KB auto-sync failed: ' . $e->getMessage());
        }
    }
}
