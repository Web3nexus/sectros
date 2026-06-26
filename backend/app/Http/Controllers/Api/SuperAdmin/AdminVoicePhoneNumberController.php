<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\VoiceAgentPhoneNumber;
use App\Models\VoiceAgentSetting;
use App\Services\Voice\TwilioVoiceNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVoicePhoneNumberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = VoiceAgentPhoneNumber::query();

        if ($search = $request->input('search')) {
            $query->where('phone_number', 'like', "%{$search}%");
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($request->input('assigned') === 'true') {
            $query->whereNotNull('tenant_id');
        } elseif ($request->input('assigned') === 'false') {
            $query->whereNull('tenant_id');
        }

        $numbers = $query->orderBy('created_at', 'desc')->paginate(50);

        $numbers->load('tenant');

        return response()->json([
            'numbers' => $numbers->map(function ($num) {
                return [
                    'id' => $num->id,
                    'tenant_id' => $num->tenant_id,
                    'tenant_name' => $num->tenant?->business_name ?? null,
                    'provider' => $num->provider,
                    'phone_number' => $num->phone_number,
                    'phone_number_source' => $num->phone_number_source,
                    'status' => $num->status,
                    'assigned_at' => $num->assigned_at,
                    'released_at' => $num->released_at,
                    'created_at' => $num->created_at,
                ];
            }),
            'meta' => [
                'current_page' => $numbers->currentPage(),
                'last_page' => $numbers->lastPage(),
                'total' => $numbers->total(),
                'available_count' => VoiceAgentPhoneNumber::whereNull('tenant_id')->where('status', 'available')->count(),
                'assigned_count' => VoiceAgentPhoneNumber::whereNotNull('tenant_id')->whereIn('status', ['assigned', 'active'])->count(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone_number' => 'required|string|unique:voice_agent_phone_numbers,phone_number',
            'provider' => 'required|string|in:elevenlabs,vapi,retell',
            'phone_number_source' => 'required|string|in:platform_owned',
            'external_phone_number_id' => 'nullable|string',
            'status' => 'required|string|in:available',
        ]);

        $number = VoiceAgentPhoneNumber::create($validated);

        return response()->json([
            'message' => 'Phone number added to pool',
            'number' => $number,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $number = VoiceAgentPhoneNumber::findOrFail($id);

        $validated = $request->validate([
            'phone_number' => 'string|unique:voice_agent_phone_numbers,phone_number,' . $id,
            'status' => 'string|in:available,assigned,active,inactive,failed',
        ]);

        $number->update($validated);

        return response()->json([
            'message' => 'Phone number updated',
            'number' => $number->fresh(),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $number = VoiceAgentPhoneNumber::findOrFail($id);

        if ($number->tenant_id) {
            return response()->json(['message' => 'Cannot delete an assigned number. Release it first.'], 422);
        }

        $number->delete();

        return response()->json(['message' => 'Phone number removed']);
    }

    public function assign(Request $request, $id): JsonResponse
    {
        $number = VoiceAgentPhoneNumber::findOrFail($id);

        if ($number->tenant_id) {
            return response()->json(['message' => 'Phone number is already assigned'], 422);
        }

        $validated = $request->validate([
            'tenant_id' => 'required|string|exists:tenants,id',
        ]);

        $tenant = Tenant::findOrFail($validated['tenant_id']);

        $number->assignToTenant($tenant->id);

        $settings = VoiceAgentSetting::where('tenant_id', $tenant->id)->first();
        if ($settings && $settings->provider_agent_id) {
            $twilio = new TwilioVoiceNumberService();
            if ($twilio->isAvailable()) {
                $twilio->linkNumberToAgent($number, $settings);
            }
        }

        return response()->json([
            'message' => "Phone number assigned to {$tenant->business_name}",
            'number' => $number->fresh(),
        ]);
    }

    public function release($id): JsonResponse
    {
        $number = VoiceAgentPhoneNumber::findOrFail($id);

        if (!$number->tenant_id) {
            return response()->json(['message' => 'Phone number is not assigned to any tenant'], 422);
        }

        $twilio = new TwilioVoiceNumberService();
        if ($twilio->isAvailable()) {
            $twilio->unlinkNumber($number);
        }

        VoiceAgentSetting::where('tenant_id', $number->tenant_id)
            ->where('assigned_phone_number_id', $number->id)
            ->update(['assigned_phone_number_id' => null]);

        $number->release();

        return response()->json([
            'message' => 'Phone number released and returned to pool',
            'number' => $number->fresh(),
        ]);
    }

    public function searchTwilio(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'country_code' => 'string|size:2',
            'type' => 'string|in:local,tollfree,mobile',
            'area_code' => 'nullable|string|size:3',
            'limit' => 'integer|min:1|max:50',
        ]);

        $twilio = new TwilioVoiceNumberService();
        if (!$twilio->isAvailable()) {
            return response()->json(['success' => false, 'message' => $twilio->getError()], 400);
        }

        $result = $twilio->searchAvailable($validated);

        return response()->json($result);
    }

    public function purchaseFromTwilio(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone_number' => 'required|string',
            'provider' => 'required|string|in:elevenlabs,vapi,retell',
        ]);

        $twilio = new TwilioVoiceNumberService();
        if (!$twilio->isAvailable()) {
            return response()->json(['success' => false, 'message' => $twilio->getError()], 400);
        }

        $result = $twilio->purchaseNumber($validated['phone_number']);
        if (!$result['success']) {
            return response()->json($result, 400);
        }

        $number = VoiceAgentPhoneNumber::create([
            'phone_number' => $result['phone_number'],
            'provider' => $validated['provider'],
            'phone_number_source' => 'platform_owned',
            'external_phone_number_id' => $result['sid'],
            'status' => 'available',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Phone number purchased and added to pool',
            'number' => $number,
        ]);
    }

    public function tenants(Request $request): JsonResponse
    {
        $search = $request->input('search');
        $query = Tenant::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('owner_email', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        $tenants = $query->where('status', 'active')
            ->orderBy('business_name')
            ->get(['id', 'business_name', 'owner_email']);

        return response()->json(['tenants' => $tenants]);
    }
}
