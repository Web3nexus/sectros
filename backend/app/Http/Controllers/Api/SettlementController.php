<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettlementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(\App\Models\SettlementRecord::with('staff')->orderBy('date', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'opening_balance' => 'required|numeric',
            'cash_collected' => 'nullable|numeric',
            'card_collected' => 'nullable|numeric',
            'tips_collected' => 'nullable|numeric',
            'expenses_total' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'staff_profile_id' => 'required|exists:staff_profiles,id'
        ]);

        $record = \App\Models\SettlementRecord::create($validated);

        return response()->json($record, 201);
    }

    public function show(\App\Models\SettlementRecord $settlementRecord)
    {
        return response()->json($settlementRecord->load('staff'));
    }

    public function update(Request $request, \App\Models\SettlementRecord $settlementRecord)
    {
        $validated = $request->validate([
            'closing_balance' => 'nullable|numeric',
            'cash_collected' => 'nullable|numeric',
            'card_collected' => 'nullable|numeric',
            'tips_collected' => 'nullable|numeric',
            'expenses_total' => 'nullable|numeric',
            'net_total' => 'nullable|numeric',
            'discrepancy' => 'nullable|numeric',
            'notes' => 'nullable|string'
        ]);

        $settlementRecord->update($validated);

        return response()->json($settlementRecord);
    }
}
