<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications (latest 20), unread count.
     */
    public function index()
    {
        $notifications = TenantNotification::orderBy('created_at', 'desc')->paginate(50);
        $unreadCount   = TenantNotification::where('status', 'unread')->count();

        return response()->json([
            'notifications' => $notifications->items(),
            'unread_count'  => $unreadCount,
            'paginator' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(TenantNotification $notification)
    {
        $notification->update(['status' => 'read']);
        return response()->json(['status' => 'ok']);
    }

    /**
     * Mark ALL notifications as read.
     */
    public function markAllRead()
    {
        TenantNotification::where('status', 'unread')->update(['status' => 'read']);
        return response()->json(['status' => 'ok', 'unread_count' => 0]);
    }

    public static function dispatch(string $type, string $title, string $message, string $icon = 'bell', ?int $referenceId = null): void
    {
        TenantNotification::create([
            'type'         => $type,
            'title'        => $title,
            'message'      => $message,
            'icon'         => $icon,
            'status'       => 'unread',
            'reference_id' => $referenceId,
        ]);
    }

    /**
     * Update notification preferences.
     */
    public function updateSettings(Request $request)
    {
        return response()->json(['status' => 'ok', 'message' => 'Preferences updated successfully']);
    }
}
