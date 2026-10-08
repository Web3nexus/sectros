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
                'source' => 'website',
                'deposit_amount' => $depositRequired ? $depositAmount : 0,
                'payment_status' => ($depositRequired && $depositAmount > 0) ? 'unpaid' : 'paid',
                'confirmation_code' => str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT),
                'confirmation_token' => \Illuminate\Support\Str::random(64),
            ]);

            // Handle SMS Notification
            try {
                $smsEnabled = \App\Models\TenantSetting::where('key', 'notifications_sms_enabled')->value('value');
                if ($smsEnabled) {
                    $businessName = tenant('name') ?? 'The Business';
                    $message = "Hello {$validated['customer_name']}, your reservation at {$businessName} for {$combinedDateTime->format('M d, H:i')} has been received. " .
                              ($depositRequired ? "Please complete your deposit to confirm." : "We will confirm your booking shortly.");
                    \App\Services\SMSService::send($validated['customer_phone'], $message);
                }
            } catch (\Throwable $e) {
                \Log::warning("Failed to send reservation SMS for #{$reservation->id}: " . $e->getMessage());
            }

            // Email the guest a confirmation request (customer-link booking).
            try {
                $this->sendGuestRequestConfirmation($reservation);
            } catch (\Throwable $e) {
                \Log::warning("Failed to send guest request confirmation email for #{$reservation->id}: " . $e->getMessage());
            }

            // Alert the business owner of the new external booking.
            try {
                $this->sendBusinessNewBookingAlert($reservation);
            } catch (\Throwable $e) {
                \Log::warning("Failed to send business new booking alert for #{$reservation->id}: " . $e->getMessage());
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

    /**
     * Public guest confirmation via the token from their "confirm your booking request" email.
     * Supports both GET (browser link) and POST (app / form).
     */
    public function confirm(Request $request, string $token)
    {
        $reservation = Reservation::where('confirmation_token', $token)->first();

        if (!$reservation) {
            if ($request->isMethod('post')) {
                return response()->json(['success' => false, 'message' => 'Invalid or expired confirmation link.'], 404);
            }
            return $this->confirmPage('Invalid or expired confirmation link.', false);
        }

        if ($reservation->status === 'confirmed') {
            if ($request->isMethod('post')) {
                return response()->json(['success' => true, 'message' => 'This booking is already confirmed.', 'confirmed' => true]);
            }
            return $this->confirmPage($this->confirmationLine($reservation) . ' This booking is already confirmed.', true);
        }

        if ($reservation->status === 'cancelled') {
            if ($request->isMethod('post')) {
                return response()->json(['success' => false, 'message' => 'This booking has been cancelled.', 'confirmed' => false]);
            }
            return $this->confirmPage('This booking has been cancelled.', false);
        }

        // Gate confirmation on required deposit payment
        if ($reservation->deposit_amount > 0 && $reservation->payment_status !== 'paid') {
            if ($request->isMethod('post')) {
                return response()->json([
                    'success' => false,
                    'message' => 'A deposit payment is required before this booking can be confirmed.',
                    'payment_required' => true,
                    'confirmed' => false
                ], 422);
            }
            return $this->confirmPage('A deposit payment is required before this booking can be confirmed. Please complete your deposit first.', false);
        }

        $reservation->status = 'confirmed';
        $reservation->confirmed_by = 'email-link';
        $reservation->confirmed_at = now();
        $reservation->save();

        try {
            \App\Http\Controllers\Api\NotificationController::dispatch(
                'reservation',
                'Reservation Confirmed',
                'Booking for ' . $reservation->customer_name . ' has been confirmed by the guest.',
                'check-circle',
                $reservation->id
            );

            // Tell the guest + the restaurant.
            $this->sendConfirmationEmails($reservation);
        } catch (\Exception $e) {
            \Log::warning("Failed to dispatch guest-confirmation notifications: " . $e->getMessage());
        }

        if ($request->isMethod('post')) {
            return response()->json([
                'success' => true,
                'message' => 'Booking confirmed.',
                'confirmed' => true,
                'reservation' => $reservation
            ]);
        }

        return $this->confirmPage('Your booking has been confirmed. We look forward to welcoming you!', true);
    }

    /**
     * Email the guest a booking-request confirmation for a customer-link booking.
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
                        'confirm_link' => url('/tenant-api/public/reservations/confirm/' . $reservation->confirmation_token),
                    ])
                );
            }
        }
    }

    /**
     * Alert the business owner of a new customer-link booking.
     */
    protected function sendBusinessNewBookingAlert(Reservation $reservation): void
    {
        $template = \App\Models\EmailTemplate::where('slug', 'new_reservation')->first();
        if (!$template) {
            return;
        }

        $ownerEmail = tenant('owner_email');
        if (!$ownerEmail) {
            return;
        }

        $sourceLabel = 'Booking Link';
        $phoneRow = !empty($reservation->customer_phone)
            ? "<div class='row'><span class='label'>Phone</span><span class='value'>" . e($reservation->customer_phone) . "</span></div>"
            : '';

        \Illuminate\Support\Facades\Mail::to($ownerEmail)->send(
            new \App\Mail\SystemMail($template->subject, $template->content, [
                'reservation_id' => $reservation->id,
                'customer_name' => $reservation->customer_name,
                'business_name' => tenant('name') ?? 'The Business',
                'reservation_date' => $reservation->reservation_time->format('Y-m-d'),
                'reservation_time' => $reservation->reservation_time->format('H:i'),
                'guest_count' => $reservation->party_size,
                'source' => 'website',
                'source_label' => $sourceLabel,
                'added_by' => 'Booking Link',
                'customer_phone' => $reservation->customer_phone ?? '',
                'customer_phone_row' => $phoneRow,
            ])
        );
    }

    protected function sendConfirmationEmails(Reservation $reservation): void
    {
        $businessName = tenant('name') ?? 'The Business';

        if (!empty($reservation->customer_email)) {
            $template = \App\Models\EmailTemplate::where('slug', 'reservation_confirmed')->first();
            if ($template) {
                $codeBlock = !empty($reservation->confirmation_code)
                    ? "<div class='center'><span class='code'>{$reservation->confirmation_code}</span></div>"
                    : '';
                \Illuminate\Support\Facades\Mail::to($reservation->customer_email)->send(
                    new \App\Mail\SystemMail($template->subject, $template->content, [
                        'customer_name' => $reservation->customer_name,
                        'business_name' => $businessName,
                        'reservation_date' => $reservation->reservation_time->format('Y-m-d'),
                        'reservation_time' => $reservation->reservation_time->format('H:i'),
                        'guest_count' => $reservation->party_size,
                        'confirmation_code' => $reservation->confirmation_code,
                        'code_block' => $codeBlock,
                    ])
                );
            }
        }

        $smsEnabled = \App\Models\TenantSetting::where('key', 'notifications_sms_enabled')->value('value');
        if ($smsEnabled && !empty($reservation->customer_phone)) {
            \App\Services\SMSService::send(
                $reservation->customer_phone,
                "Hello {$reservation->customer_name}, your booking at {$businessName} on {$reservation->reservation_time->format('M d, H:i')} is confirmed. We look forward to welcoming you!"
            );
        }
    }

    protected function confirmationLine(Reservation $reservation): string
    {
        return $reservation->customer_name
            . ' — ' . $reservation->reservation_time->format('M d, H:i')
            . ', ' . $reservation->party_size . ' guests';
    }

    protected function confirmPage(string $message, bool $ok): \Illuminate\Http\Response
    {
        $color = $ok ? '#16a34a' : '#dc2626';
        $icon = $ok ? 'check_circle' : 'error';
        $html = "<!DOCTYPE html>
<html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
<title>Booking Confirmation — " . (tenant('name') ?? '') . "</title>
<link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap\" rel=\"stylesheet\">
<style>body{font-family:'Inter',sans-serif;background:#fafafa;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px}
.card{background:#fff;border:1px solid #eee;border-radius:20px;padding:48px;text-align:center;max-width:420px;width:100%;
box-shadow:0 10px 40px rgba(0,0,0,.06)}
.icon{font-size:64px;color:{$color};margin-bottom:16px}
h1{font-size:22px;margin:0 0 8px;color:#111}
p{color:#555;line-height:1.6;margin:0}
</style></head><body>
<div class=\"card\"><div class=\"icon\">{$icon}</div><h1>" . ($ok ? 'Booking Confirmed' : 'Booking Status') . "</h1>
<p>" . htmlspecialchars($message) . "</p></div></body></html>";

        return response($html)->header('Content-Type', 'text/html; charset=utf-8')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
}