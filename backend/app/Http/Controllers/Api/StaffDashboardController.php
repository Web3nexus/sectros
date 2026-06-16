<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffProfile;
use App\Models\Shift;
use App\Models\AttendanceLog;
use App\Models\PayrollRecord;
use Illuminate\Http\Request;

class StaffDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $profile = StaffProfile::where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json(['error' => 'Staff profile not found'], 404);
        }

        $upcomingShifts = Shift::where('staff_profile_id', $profile->id)
            ->where('date', '>=', now()->today())
            ->orderBy('date')
            ->orderBy('start_time')
            ->limit(5)
            ->get();

        $recentAttendance = AttendanceLog::where('staff_profile_id', $profile->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $payroll = PayrollRecord::where('staff_profile_id', $profile->id)
            ->orderBy('period_start', 'desc')
            ->limit(6)
            ->get();

        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        $weeklyHours = AttendanceLog::where('staff_profile_id', $profile->id)
            ->where('created_at', '>=', $thisWeek)
            ->sum('total_hours');

        $monthlyHours = AttendanceLog::where('staff_profile_id', $profile->id)
            ->where('created_at', '>=', $thisMonth)
            ->sum('total_hours');

        $monthlyPayout = PayrollRecord::where('staff_profile_id', $profile->id)
            ->where('status', 'paid')
            ->whereBetween('period_start', [$thisMonth, $thisMonth->copy()->addMonth()])
            ->sum('total_payout');

        $nextShift = $upcomingShifts->first();

        return response()->json([
            'profile' => [
                'name' => $profile->name,
                'role' => $profile->role,
                'hourly_rate' => $profile->hourly_rate,
                'avatar_url' => $profile->avatar_url,
            ],
            'next_shift' => $nextShift ? [
                'id' => $nextShift->id,
                'date' => $nextShift->date->toDateString(),
                'start_time' => $nextShift->start_time,
                'end_time' => $nextShift->end_time,
                'status' => $nextShift->status,
            ] : null,
            'summary' => [
                'weekly_hours' => round((float) $weeklyHours, 2),
                'monthly_hours' => round((float) $monthlyHours, 2),
                'monthly_payout' => round((float) $monthlyPayout, 2),
            ],
            'upcoming_shifts' => $upcomingShifts->map(fn($s) => [
                'id' => $s->id,
                'date' => $s->date->toDateString(),
                'start_time' => $s->start_time,
                'end_time' => $s->end_time,
                'status' => $s->status,
            ]),
            'recent_attendance' => $recentAttendance->map(fn($a) => [
                'id' => $a->id,
                'date' => $a->check_in?->toDateString() ?? $a->created_at->toDateString(),
                'check_in' => $a->check_in?->format('H:i'),
                'check_out' => $a->check_out?->format('H:i'),
                'total_hours' => (float) $a->total_hours,
            ]),
            'payroll' => $payroll->map(fn($p) => [
                'id' => $p->id,
                'period' => $p->period_start->toDateString() . ' - ' . $p->period_end->toDateString(),
                'base_salary' => (float) $p->base_salary,
                'overtime_pay' => (float) $p->overtime_pay,
                'tips_share' => (float) $p->tips_share,
                'total_payout' => (float) $p->total_payout,
                'status' => $p->status,
            ]),
        ]);
    }
}
