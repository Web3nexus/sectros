<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VoiceAgentCall;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoiceAgentCallController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'sometimes|string|max:50',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'search' => 'sometimes|string|max:255',
        ]);

        $query = VoiceAgentCall::where('tenant_id', tenant('id'));

        if ($request->status) {
            $query->where('call_status', $request->status);
        }

        if ($request->date_from) {
            $query->whereDate('call_started_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('call_started_at', '<=', $request->date_to);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('customer_name', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_phone_number', 'like', '%' . $request->search . '%')
                  ->orWhere('summary', 'like', '%' . $request->search . '%');
            });
        }

        $calls = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json($calls);
    }

    public function show($id): JsonResponse
    {
        $call = VoiceAgentCall::where('tenant_id', tenant('id'))->findOrFail($id);

        return response()->json(['call' => $call]);
    }
}
