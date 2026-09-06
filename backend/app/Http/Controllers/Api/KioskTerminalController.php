<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RestaurantTable;
use App\Models\Reservation;
use App\Models\MenuItem;
use App\Models\StaffProfile;
use App\Models\AttendanceLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class KioskTerminalController extends Controller
{
    /**
     * Walk-in guest quick check-in / table reservation on kiosk tablet.
     */
    public function walkInCheckIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'party_size' => 'required|integer|min:1|max:20',
            'seating_preference' => 'nullable|string|in:indoor,outdoor,bar,any',
            'dietary_notes' => 'nullable|string',
        ]);

        $availableTable = RestaurantTable::where('status', 'available')
            ->where('capacity', '>=', $validated['party_size'])
            ->orderBy('capacity', 'asc')
            ->first();

        $tableId = $availableTable ? $availableTable->id : null;

        $reservation = Reservation::create([
            'customer_name' => $validated['customer_name'],
            'phone' => $validated['phone'],
            'party_size' => $validated['party_size'],
            'reservation_time' => Carbon::now(),
            'end_time' => Carbon::now()->addHours(2),
            'status' => $tableId ? 'seated' : 'confirmed',
            'restaurant_table_id' => $tableId,
            'source' => 'kiosk_walkin',
        ]);

        if ($tableId) {
            $availableTable->update(['status' => 'occupied']);
        }

        return response()->json([
            'success' => true,
            'assigned_table' => $availableTable ? $availableTable->table_number : 'Host Seating',
            'reservation_id' => $reservation->id,
            'message' => $tableId 
                ? "Welcome {$validated['customer_name']}! Table #{$availableTable->table_number} is ready for you." 
                : "Welcome {$validated['customer_name']}! Please take a seat, our host will seat you shortly.",
        ], 201);
    }

    /**
     * Kiosk Menu Manager: Toggle item availability (86 item / in stock).
     */
    public function toggleItemAvailability(Request $request, int $itemId): JsonResponse
    {
        $item = MenuItem::findOrFail($itemId);
        $newStatus = !$item->is_available;
        $item->update(['is_available' => $newStatus]);

        return response()->json([
            'item_id' => $item->id,
            'name' => $item->name,
            'is_available' => $newStatus,
            'message' => "Item '{$item->name}' is now " . ($newStatus ? 'IN STOCK' : '86ed / OUT OF STOCK') . ".",
        ]);
    }
}

