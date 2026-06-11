<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(\App\Models\Shift::with('staff')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'staff_profile_id' => 'required|exists:staff_profiles,id',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'status' => 'nullable|in:scheduled,checked_in,on_break,checked_out,missed'
        ]);

        $shift = \App\Models\Shift::create($validated);

        return response()->json($shift, 201);
    }

    public function show(\App\Models\Shift $shift)
    {
        return response()->json($shift->load('staff'));
    }

    public function update(Request $request, \App\Models\Shift $shift)
    {
        $validated = $request->validate([
            'staff_profile_id' => 'nullable|exists:staff_profiles,id',
            'date' => 'nullable|date',
            'start_time' => 'nullable',
            'end_time' => 'nullable',
            'status' => 'nullable|in:scheduled,checked_in,on_break,checked_out,missed'
        ]);

        $shift->update($validated);

        return response()->json($shift);
    }

    public function destroy(\App\Models\Shift $shift)
    {
        $shift->delete();
        return response()->json(['message' => 'Shift deleted successfully']);
    }
}
