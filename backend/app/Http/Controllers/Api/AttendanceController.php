<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(\App\Models\AttendanceLog::with('staff', 'shift')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'staff_profile_id' => 'required|exists:staff_profiles,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'check_in' => 'required|date',
        ]);

        $log = \App\Models\AttendanceLog::create($validated);

        return response()->json($log, 201);
    }

    public function show(\App\Models\AttendanceLog $attendanceLog)
    {
        return response()->json($attendanceLog->load('staff', 'shift'));
    }

    public function update(Request $request, \App\Models\AttendanceLog $attendanceLog)
    {
        $validated = $request->validate([
            'check_out' => 'nullable|date',
            'break_start' => 'nullable|date',
            'break_end' => 'nullable|date',
            'total_hours' => 'nullable|numeric'
        ]);

        $attendanceLog->update($validated);

        return response()->json($attendanceLog);
    }
}
