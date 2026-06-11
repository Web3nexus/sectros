<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PublicReservationController extends Controller
{
    /**
     * Handle public reservations originating from the drag-and-drop website builder pages.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:50',
            'customer_email' => 'nullable|email|max:255',
            'reservation_date' => 'required|date',
            'reservation_time' => 'required',
            'party_size' => 'required|integer|min:1',
            'special_requests' => 'nullable|string'
        ]);

        try {
            // Combine date and time
            $combinedDateTime = Carbon::parse($validated['reservation_date'] . ' ' . $validated['reservation_time']);

            // Check if business requires deposit
            $depositRequired = \App\Models\TenantSetting::where('key', 'reservations_deposit_required')->value('value');
            $depositAmount = \App\Models\TenantSetting::where('key', 'reservations_deposit_amount')->value('value') ?? 0;
            
            $reservation = Reservation::create([
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => $validated['customer_email'] ?? '',
                'party_size' => $validated['party_size'],
                'reservation_time' => $combinedDateTime,
                'special_requests' => $validated['special_requests'] ?? '',
                'status' => 'pending',
                'deposit_amount' => $depositRequired ? $depositAmount : 0,
                'payment_status' => ($depositRequired && $depositAmount > 0) ? 'unpaid' : 'paid'
            ]);

            // Handle SMS Notification
            $smsEnabled = \App\Models\TenantSetting::where('key', 'notifications_sms_enabled')->value('value');
            if ($smsEnabled) {
                $businessName = tenant('name') ?? 'The Business';
                $message = "Hello {$validated['customer_name']}, your reservation at {$businessName} for {$combinedDateTime->format('M d, H:i')} has been received. " . 
                          ($depositRequired ? "Please complete your deposit to confirm." : "We look forward to seeing you!");
                
                \App\Services\SMSService::send($validated['customer_phone'], $message);
            }

            return response()->json([
                'success' => true,
                'message' => 'Reservation received successfully',
                'payment_required' => ($depositRequired && $depositAmount > 0),
                'reservation' => $reservation
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error("Failed to create public reservation: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule reservation. Please try again or call the restaurant.'
            ], 500);
        }
    }
}
