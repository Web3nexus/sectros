<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipRecord;
use App\Models\StaffProfile;
use App\Models\StaffMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\NotificationController;

class TipController extends Controller
{
    /**
     * Owner & Admin tip stats (Total, Pending/Undisbursed, Disbursed, Staff breakdown).
     */
    public function stats(Request $request)
    {
        $tenantId = tenant('id');

        $query = TipRecord::query();

        // High-level aggregates
        $totalTips = (float) (clone $query)->where('payout_status', '!=', 'revoked')->sum('amount');
        $pendingTips = (float) (clone $query)->where('payout_status', 'pending')->sum('amount');
        $disbursedTips = (float) (clone $query)->where('payout_status', 'disbursed')->sum('amount');
        $revokedTips = (float) (clone $query)->where('payout_status', 'revoked')->sum('amount');

        // Recent tips with relations
        $recentTips = TipRecord::with(['staffProfile.user', 'order'])
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get();

        // Breakdown by staff member
        $staffProfiles = StaffProfile::with('user')->get();
        $staffBreakdown = $staffProfiles->map(function ($staff) {
            $tipsQuery = TipRecord::where('staff_profile_id', $staff->id);
            $total = (float) (clone $tipsQuery)->where('payout_status', '!=', 'revoked')->sum('amount');
            $pending = (float) (clone $tipsQuery)->where('payout_status', 'pending')->sum('amount');
            $disbursed = (float) (clone $tipsQuery)->where('payout_status', 'disbursed')->sum('amount');

            return [
                'staff_id' => $staff->id,
                'name' => $staff->user ? $staff->user->name : ($staff->name ?? 'Staff #' . $staff->id),
                'role' => $staff->role ?? 'Waiter',
                'total_tips' => $total,
                'pending_tips' => $pending,
                'disbursed_tips' => $disbursed,
            ];
        });

        return response()->json([
            'total_tips' => $totalTips,
            'pending_tips' => $pendingTips,
            'disbursed_tips' => $disbursedTips,
            'revoked_tips' => $revokedTips,
            'recent_tips' => $recentTips,
            'staff_breakdown' => $staffBreakdown,
        ]);
    }

    /**
     * Get tip metrics for the currently logged-in staff member (e.g. Waiter).
     */
    public function myTips(Request $request)
    {
        $user = auth()->user();
        $staffProfile = StaffProfile::where('user_id', $user->id)->first();

        if (!$staffProfile) {
            return response()->json([
                'has_profile' => false,
                'total_tips' => 0.0,
                'pending_tips' => 0.0,
                'disbursed_tips' => 0.0,
                'recent_tips' => [],
            ]);
        }

        $tipsQuery = TipRecord::where('staff_profile_id', $staffProfile->id);

        $total = (float) (clone $tipsQuery)->where('payout_status', '!=', 'revoked')->sum('amount');
        $pending = (float) (clone $tipsQuery)->where('payout_status', 'pending')->sum('amount');
        $disbursed = (float) (clone $tipsQuery)->where('payout_status', 'disbursed')->sum('amount');

        $recent = (clone $tipsQuery)
            ->with('order')
            ->orderBy('created_at', 'desc')
            ->limit(25)
            ->get();

        return response()->json([
            'has_profile' => true,
            'staff_profile_id' => $staffProfile->id,
            'total_tips' => $total,
            'pending_tips' => $pending,
            'disbursed_tips' => $disbursed,
            'recent_tips' => $recent,
        ]);
    }

    /**
     * Mark a tip as disbursed (paid out to staff).
     */
    public function disburse(Request $request, $id)
    {
        $validated = $request->validate([
            'payout_method' => 'nullable|string|in:cash,payroll,bank_transfer,other',
            'notes' => 'nullable|string|max:500',
        ]);

        $tip = TipRecord::findOrFail($id);

        $tip->update([
            'payout_status' => 'disbursed',
            'payout_method' => $validated['payout_method'] ?? 'cash',
            'notes' => $validated['notes'] ?? $tip->notes,
        ]);

        // Send confirmation in-app message to staff if staff profile exists
        if ($tip->staff_profile_id) {
            try {
                StaffMessage::create([
                    'tenant_id' => tenant('id'),
                    'staff_profile_id' => $tip->staff_profile_id,
                    'sender_id' => auth()->id(),
                    'to_all' => false,
                    'subject' => "Tip Disbursed: $" . number_format((float) $tip->amount, 2),
                    'body' => "Your tip of $" . number_format((float) $tip->amount, 2) . " from Order #" . ($tip->order_id ?? 'N/A') . " has been disbursed via " . ($tip->payout_method ?? 'cash') . ".",
                ]);
            } catch (\Throwable $e) {}
        }

        return response()->json([
            'success' => true,
            'message' => 'Tip marked as disbursed successfully.',
            'tip' => $tip,
        ]);
    }

    /**
     * Revoke or delete a tip for audit transparency.
     */
    public function revoke(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
            'hard_delete' => 'nullable|boolean',
        ]);

        $tip = TipRecord::findOrFail($id);

        if (!empty($validated['hard_delete'])) {
            $tip->delete();
            return response()->json([
                'success' => true,
                'message' => 'Tip deleted permanently.',
            ]);
        }

        $note = "Revoked by " . (auth()->user()?->name ?? 'Owner') . ": " . $validated['reason'];
        $tip->update([
            'payout_status' => 'revoked',
            'notes' => $note,
        ]);

        // Notify staff of tip adjustment with transparency
        if ($tip->staff_profile_id) {
            try {
                StaffMessage::create([
                    'tenant_id' => tenant('id'),
                    'staff_profile_id' => $tip->staff_profile_id,
                    'sender_id' => auth()->id(),
                    'to_all' => false,
                    'subject' => "Tip Adjustment: Order #" . ($tip->order_id ?? 'N/A'),
                    'body' => "A tip of $" . number_format((float) $tip->amount, 2) . " was adjusted/revoked. Reason: " . $validated['reason'],
                ]);
            } catch (\Throwable $e) {}
        }

        return response()->json([
            'success' => true,
            'message' => 'Tip has been revoked.',
            'tip' => $tip,
        ]);
    }

    /**
     * Bulk disburse pending tips (all, or for a specific staff member).
     */
    public function disburseBatch(Request $request)
    {
        $validated = $request->validate([
            'staff_profile_id' => 'nullable|exists:staff_profiles,id',
            'payout_method' => 'nullable|string|in:cash,payroll,bank_transfer,other',
        ]);

        $query = TipRecord::where('payout_status', 'pending');
        if (!empty($validated['staff_profile_id'])) {
            $query->where('staff_profile_id', $validated['staff_profile_id']);
        }

        $count = $query->count();
        $totalAmount = (float) $query->sum('amount');

        $query->update([
            'payout_status' => 'disbursed',
            'payout_method' => $validated['payout_method'] ?? 'cash',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Disbursed {$count} tips totaling $" . number_format($totalAmount, 2),
            'count' => $count,
            'total_amount' => $totalAmount,
        ]);
    }
}
