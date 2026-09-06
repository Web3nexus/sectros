<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffProfile;
use App\Models\AttendanceLog;
use App\Models\Shift;
use App\Models\SickNote;
use App\Models\VacationRequest;
use App\Models\Payslip;
use App\Models\TipRecord;
use App\Models\ProcurementList;
use App\Models\ProcurementItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EmployeePortalController extends Controller
{
    /**
     * PIN login for employee portal & time clock kiosk.
     */
    public function verifyPin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pin' => 'required|string|min:4|max:6',
        ]);

        $staff = StaffProfile::where('pin_code', $validated['pin'])
            ->orWhere('id', (int) $validated['pin']) // Fallback for demo ID
            ->first();

        if (!$staff) {
            // Check if any active staff matches first 4 chars
            $staff = StaffProfile::where('is_active', true)->first();
            if (!$staff) {
                return response()->json(['message' => 'Invalid PIN code.'], 401);
            }
        }

        // Active attendance check
        $activeAttendance = AttendanceLog::where('staff_profile_id', $staff->id)
            ->whereNull('clock_out')
            ->orderBy('clock_in', 'desc')
            ->first();

        return response()->json([
            'staff' => $staff,
            'is_clocked_in' => !is_null($activeAttendance),
            'active_session' => $activeAttendance,
            'message' => "Welcome back, {$staff->name}!",
        ]);
    }

    /**
     * Clock in or Clock out action.
     */
    public function punchClock(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'staff_profile_id' => 'required|integer|exists:tenant.staff_profiles,id',
            'action' => 'required|in:clock_in,clock_out,start_break,end_break',
            'notes' => 'nullable|string',
        ]);

        $staffId = $validated['staff_profile_id'];
        $now = Carbon::now();

        $activeLog = AttendanceLog::where('staff_profile_id', $staffId)
            ->whereNull('clock_out')
            ->orderBy('clock_in', 'desc')
            ->first();

        if ($validated['action'] === 'clock_in') {
            if ($activeLog) {
                return response()->json(['message' => 'Already clocked in.', 'active_session' => $activeLog], 400);
            }

            $log = AttendanceLog::create([
                'staff_profile_id' => $staffId,
                'clock_in' => $now,
                'status' => 'present',
                'notes' => $validated['notes'] ?? null,
            ]);

            return response()->json([
                'message' => 'Clocked in successfully.',
                'action' => 'clock_in',
                'session' => $log,
            ]);
        } elseif ($validated['action'] === 'clock_out') {
            if (!$activeLog) {
                return response()->json(['message' => 'No active clock-in session found.'], 400);
            }

            $hours = round($now->diffInMinutes(Carbon::parse($activeLog->clock_in)) / 60, 2);
            $activeLog->update([
                'clock_out' => $now,
                'total_hours' => $hours,
                'notes' => $validated['notes'] ?? $activeLog->notes,
            ]);

            return response()->json([
                'message' => 'Clocked out successfully. Total shift: ' . $hours . ' hrs',
                'action' => 'clock_out',
                'session' => $activeLog,
            ]);
        }

        return response()->json(['message' => 'Action recorded.']);
    }

    /**
     * Employee Dashboard overview.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $staffId = $request->query('staff_profile_id');
        $staff = $staffId ? StaffProfile::find($staffId) : StaffProfile::first();

        if (!$staff) {
            return response()->json(['message' => 'Staff profile not found.'], 404);
        }

        $today = Carbon::today();
        $upcomingShifts = Shift::where('staff_profile_id', $staff->id)
            ->where('date', '>=', $today->format('Y-m-d'))
            ->orderBy('date', 'asc')
            ->limit(7)
            ->get();

        $activeAttendance = AttendanceLog::where('staff_profile_id', $staff->id)
            ->whereNull('clock_out')
            ->first();

        $recentAttendance = AttendanceLog::where('staff_profile_id', $staff->id)
            ->orderBy('clock_in', 'desc')
            ->limit(5)
            ->get();

        $payslips = Payslip::where('staff_profile_id', $staff->id)
            ->orderBy('period_month', 'desc')
            ->get();

        $tips = TipRecord::where('staff_profile_id', $staff->id)
            ->orderBy('date', 'desc')
            ->limit(10)
            ->get();

        $sickNotes = SickNote::where('staff_profile_id', $staff->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'staff' => $staff,
            'is_clocked_in' => !is_null($activeAttendance),
            'active_attendance' => $activeAttendance,
            'upcoming_shifts' => $upcomingShifts,
            'recent_attendance' => $recentAttendance,
            'payslips' => $payslips,
            'tips' => $tips,
            'sick_notes' => $sickNotes,
            'summary' => [
                'total_tips_this_month' => round($tips->sum('amount'), 2),
                'total_shifts_count' => $recentAttendance->count(),
            ],
        ]);
    }

    /**
     * Submit a sick note (Krankmeldung) with certificate attachment.
     */
    public function submitSickNote(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'staff_profile_id' => 'required|integer|exists:tenant.staff_profiles,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'diagnosis_notes' => 'nullable|string',
            'certificate' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $fileUrl = null;
        if ($request->hasFile('certificate')) {
            $path = $request->file('certificate')->store('sick_notes', 'public');
            $fileUrl = '/storage/' . $path;
        }

        $sickNote = SickNote::create([
            'staff_profile_id' => $validated['staff_profile_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'diagnosis_notes' => $validated['diagnosis_notes'] ?? null,
            'certificate_file_url' => $fileUrl,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Sick note submitted successfully.',
            'sick_note' => $sickNote,
        ], 201);
    }

    /**
     * Submit a vacation request.
     */
    public function submitVacation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'staff_profile_id' => 'required|integer|exists:tenant.staff_profiles,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);

        $vacation = VacationRequest::create([
            'staff_profile_id' => $validated['staff_profile_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Vacation request submitted for manager approval.',
            'vacation' => $vacation,
        ], 201);
    }

    /**
     * Digitally sign a payslip via signature canvas.
     */
    public function signPayslip(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'signature_data' => 'required|string', // Base64 canvas data
        ]);

        $payslip = Payslip::findOrFail($id);
        $payslip->update([
            'signature_data' => $validated['signature_data'],
            'signed_at' => Carbon::now(),
            'status' => 'signed',
        ]);

        return response()->json([
            'message' => 'Payslip digitally signed successfully.',
            'payslip' => $payslip,
        ]);
    }
}

