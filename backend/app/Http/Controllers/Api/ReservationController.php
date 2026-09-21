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
     *
     * Manual bookings (source: app / manual) are created as "pending" and the
     * guest is emailed a confirmation code + link to confirm their request.
     * Website / form bookings are also created as "pending" and require the
     * restaurant to confirm them (unless auto_confirm_bookings is enabled),
     * after which the guest receives a confirmation email.
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
            'customer_email' => 'nullable|email',
            'customer_phone' => 'nullable|string',
            'reservation_time' => 'required|date|after:now',
            'end_time' => 'nullable|date|after:reservation_time',
            'duration_minutes' => 'nullable|integer|min:1',
            'party_size' => 'required|integer|min:1',
            'restaurant_table_id' => 'nullable|exists:restaurant_tables,id',
            'resource_type' => 'nullable|string',
            'resource_id' => 'nullable|integer',
            'special_requests' => 'nullable|string',
            'source' => 'nullable|string|max:50',
        ]);

        // Collect extra fields into dynamic_fields with whitelist validation
        $knownKeys = ['customer_name', 'customer_email', 'customer_phone', 'reservation_time', 'end_time',
                      'duration_minutes', 'party_size', 'restaurant_table_id', 'resource_type', 'resource_id',
                      'special_requests', 'source', 'status', 'branch_id'];
        $allowedDynamicFields = [
            'dietary_requirements' => 'nullable|string|max:500',
            'occasion' => 'nullable|string|max:100',
            'seating_preference' => 'nullable|string|max:100',
            'seating' => 'nullable|string|max:100',
            'stylist' => 'nullable|string|max:100',
            'room_type' => 'nullable|string|max:100',
            'check_in' => 'nullable|date',
            'check_out' => 'nullable|date',
            'guests' => 'nullable|integer|min:1|max:100',
            'notes' => 'nullable|string|max:2000',
        ];
        $dynamicData = [];
        foreach ($allowedDynamicFields as $field => $rules) {
            if ($request->has($field)) {
                $validatedField = $request->validate([$field => $rules]);
                $dynamicData[$field] = $validatedField[$field];
            }
        }
        if (!empty($dynamicData)) {
            $validated['dynamic_fields'] = $dynamicData;
        }

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

        $source = strtolower(trim($request->input('source', 'website')));
        $isManual = in_array($source, ['app', 'manual', 'phone', 'walk-in', 'walkin', 'in-house', 'inhome'], true);

        $validated['customer_email'] = $validated['customer_email'] ?? '';
        $validated['customer_phone'] = $validated['customer_phone'] ?? '';

        // Auto-confirm applies to self-service (website/form) bookings only.
        $autoConfirm = \App\Models\TenantSetting::where('key', 'auto_confirm_bookings')->value('value') === 'true';

        $validated['source'] = $source;
        $validated['status'] = (!$isManual && $autoConfirm) ? 'confirmed' : 'pending';
        $validated['confirmation_code'] = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $validated['confirmation_token'] = \Illuminate\Support\Str::random(64);
        $validated['confirmed_at'] = $validated['status'] === 'confirmed' ? now() : null;
        $validated['confirmed_by'] = $validated['status'] === 'confirmed' ? 'auto' : null;

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

        try {
            if ($isManual) {
                // Guest booked on their behalf — they must confirm the request.
                $this->sendGuestRequestConfirmation($reservation);
            } else {
                // Restaurant-side alert for self-service bookings.
                $this->sendRestaurantNewBookingAlert($reservation);
                if ($reservation->status === 'confirmed') {
                    $this->sendGuestConfirmedEmail($reservation, 'auto');
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send reservation emails: " . $e->getMessage());
        }

        return response()->json($reservation, 201);
    }

    /**
     * Update reservation status.
     */
    public function updateStatus(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed,seated',
            'confirmed_by' => 'nullable|string|max:50',
        ]);

        $status = $validated['status'];

        if ($status === 'confirmed') {
            $validated['confirmed_at'] = now();
            $validated['confirmed_by'] = $validated['confirmed_by'] ?? 'staff';
        }

        $reservation->update($validated);

        if ($status === 'confirmed') {
            NotificationController::dispatch(
                'reservation',
                'Reservation Confirmed',
                'Booking for ' . $reservation->customer_name . ' has been confirmed.',
                'check-circle',
                $reservation->id
            );

            try {
                $this->sendGuestConfirmedEmail($reservation, $validated['confirmed_by'] ?? 'staff');
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send reservation confirmation email: " . $e->getMessage());
            }
        } elseif ($status === 'cancelled') {
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

    /**
     * Email a guest who did not book for themselves with a confirmation
     * link + code so they can confirm the request in person.
     */
    protected function sendGuestRequestConfirmation(Reservation $reservation): void
    {
        $businessName = tenant('name') ?? 'The Business';

        if (!empty($reservation->customer_email)) {
            $template = \App\Models\EmailTemplate::where('slug', 'reservation_request_confirmation')->first();
            if ($template) {
                \Illuminate\Support\Facades\Mail::to($reservation->customer_email)->send(
                    new \App\Mail\SystemMail($template->subject, $template->content, [
                        'customer_name' => $reservation->customer_name,
                        'business_name' => $businessName,
                        'reservation_date' => $reservation->reservation_time->format('Y-m-d'),
                        'reservation_time' => $reservation->reservation_time->format('H:i'),
                        'guest_count' => $reservation->party_size,
                        'confirmation_code' => $reservation->confirmation_code,
                        'confirm_link' => $this->guestConfirmUrl($reservation),
                    ])
                );
            }
        }

        // SMS with the confirmation code so attendance can verify in-house.
        $this->sendSms($reservation, sprintf(
            "Hello %s, %s received your booking on %s at %s for %s guests. Confirm with code %s or show it on arrival.",
            $reservation->customer_name,
            $businessName,
            $reservation->reservation_time->format('M d, H:i'),
            $reservation->reservation_time->format('H:i'),
            $reservation->party_size,
            $reservation->confirmation_code
        ));
    }

    /**
     * Alert the restaurant to a new self-service booking awaiting confirmation.
     */
    protected function sendRestaurantNewBookingAlert(Reservation $reservation): void
    {
        $template = \App\Models\EmailTemplate::where('slug', 'new_reservation')->first();
        if (!$template) {
            return;
        }

        $ownerEmail = tenant('owner_email');
        if (!$ownerEmail) {
            return;
        }

        \Illuminate\Support\Facades\Mail::to($ownerEmail)->send(
            new \App\Mail\SystemMail($template->subject, $template->content, [
                'reservation_id' => $reservation->id,
                'customer_name' => $reservation->customer_name,
                'reservation_date' => $reservation->reservation_time->format('Y-m-d'),
                'reservation_time' => $reservation->reservation_time->format('H:i'),
                'guest_count' => $reservation->party_size,
            ])
        );
    }

    /**
     * Notify the guest their booking has been confirmed.
     */
    protected function sendGuestConfirmedEmail(Reservation $reservation, string $by): void
    {
        $businessName = tenant('name') ?? 'The Business';

        if (!empty($reservation->customer_email)) {
            $template = \App\Models\EmailTemplate::where('slug', 'reservation_confirmed')->first();
            if ($template) {
                \Illuminate\Support\Facades\Mail::to($reservation->customer_email)->send(
                    new \App\Mail\SystemMail($template->subject, $template->content, [
                        'customer_name' => $reservation->customer_name,
                        'business_name' => $businessName,
                        'reservation_date' => $reservation->reservation_time->format('Y-m-d'),
                        'reservation_time' => $reservation->reservation_time->format('H:i'),
                        'guest_count' => $reservation->party_size,
                    ])
                );
            }
        }

        $this->sendSms($reservation, sprintf(
            "Hello %s, your booking at %s for %s at %s (%s guests) is confirmed. We look forward to welcoming you!",
            $reservation->customer_name,
            $businessName,
            $reservation->reservation_time->format('M d'),
            $reservation->reservation_time->format('H:i'),
            $reservation->party_size
        ));
    }

    protected function sendSms(Reservation $reservation, string $message): void
    {
        $smsEnabled = \App\Models\TenantSetting::where('key', 'notifications_sms_enabled')->value('value');
        if ($smsEnabled && !empty($reservation->customer_phone)) {
            try {
                \App\Services\SMSService::send($reservation->customer_phone, $message);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning("Failed to send reservation SMS: " . $e->getMessage());
            }
        }
    }

    public function guestConfirmUrl(Reservation $reservation): string
    {
        return $this->tenantBaseUrl() . '/tenant-api/public/reservations/confirm/' . $reservation->confirmation_token;
    }

    public function tenantBaseUrl(): string
    {
        $appUrl = config('app.url', 'https://sectros.com');
        $scheme = parse_url((string) $appUrl, PHP_URL_SCHEME) ?: 'https';
        $tenant = tenant();
        $domain = $tenant ? ($tenant->domains()->first()?->domain ?? $tenant->id) : null;
        $domain = $domain ?: trim((string) (parse_url((string) $appUrl, PHP_URL_HOST) ?: ''), '.');

        return $scheme . '://' . $domain;
    }
}