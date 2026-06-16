<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffMessage;
use App\Models\StaffProfile;
use Illuminate\Http\Request;

class StaffMessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $profile = StaffProfile::where('user_id', $user->id)->first();

        $messages = StaffMessage::where(function ($q) use ($profile) {
            if ($profile) {
                $q->where('staff_profile_id', $profile->id);
            }
            $q->orWhere('to_all', true);
        })
        ->with('sender')
        ->orderBy('created_at', 'desc')
        ->paginate(50)
        ->through(function ($msg) {
            return [
                'id' => $msg->id,
                'subject' => $msg->subject,
                'body' => $msg->body,
                'from' => $msg->sender?->name ?? 'Owner',
                'read' => $msg->read_at !== null,
                'read_at' => $msg->read_at?->toIso8601String(),
                'created_at' => $msg->created_at->toIso8601String(),
            ];
        });

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'staff_profile_id' => 'nullable|exists:staff_profiles,id',
            'to_all' => 'boolean',
        ]);

        if (!($validated['to_all'] ?? false) && !($validated['staff_profile_id'] ?? null)) {
            return response()->json(['error' => 'Specify a staff member or send to all'], 422);
        }

        if ($validated['to_all'] ?? false) {
            $profiles = StaffProfile::where('is_active', true)->get();
            foreach ($profiles as $profile) {
                StaffMessage::create([
                    'sender_id' => $user->id,
                    'staff_profile_id' => $profile->id,
                    'to_all' => true,
                    'subject' => $validated['subject'],
                    'body' => $validated['body'],
                ]);
            }
        } else {
            StaffMessage::create([
                'sender_id' => $user->id,
                'staff_profile_id' => $validated['staff_profile_id'],
                'subject' => $validated['subject'],
                'body' => $validated['body'],
            ]);
        }

        return response()->json(['message' => 'Message sent'], 201);
    }

    public function markRead($id)
    {
        $user = request()->user();
        $profile = StaffProfile::where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json(['error' => 'Staff profile not found'], 404);
        }

        $message = StaffMessage::where('id', $id)
            ->where('staff_profile_id', $profile->id)
            ->firstOrFail();

        $message->update(['read_at' => now()]);
        return response()->json(['message' => 'Marked as read']);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();
        $profile = StaffProfile::where('user_id', $user->id)->first();

        $count = StaffMessage::whereNull('read_at')
            ->where(function ($q) use ($profile) {
                if ($profile) {
                    $q->where('staff_profile_id', $profile->id);
                }
                $q->orWhere('to_all', true);
            })
            ->count();

        return response()->json(['unread_count' => $count]);
    }
}
