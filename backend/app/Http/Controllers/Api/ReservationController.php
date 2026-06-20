<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\NotificationController;

class ReservationController extends Controller
{
    /**
     * Display a listing of reservations.
     */
    public function index()
    {
        return response()->json(
            Reservation::with('table')->orderBy('reservation_time')->paginate(50)
        );
    }

    /**
     * Store a newly created reservation.
     */
    public function store(Request $request)
    {
        // 1. Check Monthly Reservation Limit
        $tenant = tenant();
        $planSlug = $tenant->plan ?? 'free';
        
        $plan = \Stancl\Tenancy\Facades\Tenancy::central(function () use ($planSlug) {
            return \App\Models\SubscriptionPlan::where('slug', $planSlug)->first();
        });

        if ($plan && $plan->reservation_limit !== null) {
            $monthStart = \Carbon\Carbon::now()->startOfMonth();
            $monthEnd = \Carbon\Carbon::now()->endOfMonth();
            
            $count = Reservation::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            
            if ($count >= $plan->reservation_limit) {
                return response()->json([
                    'error' => 'limit_reached',
                    'message' => "Monthly reservation limit of {$plan->reservation_limit} has been reached for your {$plan->name} plan.",
                    'limit' => $plan->reservation_limit
                ], 403);
            }
        }

        // 2. Blacklist Check
        $isBlacklisted = \App\Models\Blacklist::where('email', $request->customer_email)
            ->orWhere('phone', $request->customer_phone)
            ->exists();

        if ($isBlacklisted) {
            return response()->json([
                'error' => 'blacklisted',
                'message' => 'Your account has been restricted from making new bookings at this establishment.'
            ], 403);
        }

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string',
            'reservation_time' => 'required|date|after:now',
            'end_time' => 'nullable|date|after:reservation_time',
            'duration_minutes' => 'nullable|integer|min:1',
            'party_size' => 'required|integer|min:1',
            'restaurant_table_id' => 'nullable|exists:restaurant_tables,id',
            'resource_type' => 'nullable|string',
            'resource_id' => 'nullable|integer',
            'special_requests' => 'nullable|string',
            'source' => 'nullable|string|max:50'
        ]);

        // Overlap Check (Simplified)
        if ($request->restaurant_table_id || $request->resource_id) {
            $startTime = \Carbon\Carbon::parse($validated['reservation_time']);
            $endTime = $validated['end_time'] ? \Carbon\Carbon::parse($validated['end_time']) : (isset($validated['duration_minutes']) ? $startTime->copy()->addMinutes($validated['duration_minutes']) : $startTime->copy()->addHours(2));

            $overlap = Reservation::where(function($q) use ($request) {
                    if ($request->restaurant_table_id) {
                        $q->where('restaurant_table_id', $request->restaurant_table_id);
                    } else {
                        $q->where('resource_id', $request->resource_id)
                          ->where('resource_type', $request->resource_type);
                    }
                })
                ->where('status', '!=', 'cancelled')
                ->where(function($q) use ($startTime, $endTime) {
                    $q->whereBetween('reservation_time', [$startTime, $endTime])
                      ->orWhereBetween('end_time', [$startTime, $endTime])
                      ->orWhere(function($sq) use ($startTime, $endTime) {
                          $sq->where('reservation_time', '<=', $startTime)
                             ->where('end_time', '>=', $endTime);
                      });
                })
                ->exists();

            if ($overlap) {
                return response()->json([
                    'error' => 'overlap',
                    'message' => 'The selected resource is already booked for this time period.'
                ], 422);
            }
        }

        $reservation = $this->transaction(function () use ($validated) {
            $reservation = Reservation::create($validated);

            NotificationController::dispatch(
                'reservation',
                'New Reservation',
                $validated['customer_name'] . ' booked a table for ' . $validated['party_size'] . ' guests.',
                'calendar',
                $reservation->id
            );

            return $reservation;
        });

        $template = \App\Models\EmailTemplate::where('slug', 'new_reservation')->first();
        if ($template) {
            try {
                \Illuminate\Support\Facades\Mail::to($validated['customer_email'])->send(
                    new \App\Mail\SystemMail($template->subject, $template->content, [
                        'reservation_id' => $reservation->id,
                        'customer_name' => $reservation->customer_name,
                        'reservation_date' => $reservation->reservation_time->format('Y-m-d'),
                        'reservation_time' => $reservation->reservation_time->format('H:i'),
                        'guest_count' => $reservation->party_size,
                    ])
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send reservation email: " . $e->getMessage());
            }
        }

        return response()->json($reservation, 201);
    }

    /**
     * Update reservation status.
     */
    public function updateStatus(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $reservation->update($validated);

        if ($validated['status'] === 'confirmed') {
            NotificationController::dispatch(
                'reservation',
                'Reservation Confirmed',
                'Booking for ' . $reservation->customer_name . ' has been confirmed.',
                'check-circle',
                $reservation->id
            );
        } elseif ($validated['status'] === 'cancelled') {
            NotificationController::dispatch(
                'reservation',
                'Reservation Cancelled',
                'Booking for ' . $reservation->customer_name . ' was cancelled.',
                'x-circle',
                $reservation->id
            );
        }

        return response()->json($reservation);
    }
}
