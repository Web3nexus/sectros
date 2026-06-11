<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\SaaSSetting;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class TenantPaymentController extends Controller
{
    /**
     * Create a Stripe Checkout Session for a Reservation Deposit.
     */
    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'success_url' => 'required|url',
            'cancel_url' => 'required|url',
        ]);

        $reservation = Reservation::findOrFail($request->reservation_id);
        
        if ($reservation->deposit_amount <= 0) {
            return response()->json(['message' => 'No deposit required for this reservation.'], 400);
        }

        if ($reservation->payment_status === 'paid') {
            return response()->json(['message' => 'Reservation deposit already paid.'], 400);
        }

        // Get Stripe Secret Key from SaaS settings
        $stripeSecret = SaaSSetting::where('key', 'stripe_secret_key')->value('value');

        if (!$stripeSecret) {
            return response()->json(['message' => 'Payment gateway not configured.'], 500);
        }

        Stripe::setApiKey($stripeSecret);

        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => 'Reservation Deposit',
                            'description' => "Deposit for reservation on {$reservation->reservation_time->format('M d, Y H:i')}",
                        ],
                        'unit_amount' => (int)($reservation->deposit_amount * 100),
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $request->success_url . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $request->cancel_url,
                'metadata' => [
                    'type' => 'reservation_deposit',
                    'reservation_id' => $reservation->id,
                    'tenant_id' => tenant('id'),
                ],
                'client_reference_id' => (string)$reservation->id,
            ]);

            // Update reservation with pending payment info
            $reservation->update([
                'stripe_payment_id' => $session->id,
                'payment_status' => 'pending'
            ]);

            return response()->json(['url' => $session->url]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Stripe Session Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Verify payment status manually if needed (polling or direct redirect).
     */
    public function verifyPayment(Request $request)
    {
        $request->validate(['session_id' => 'required']);
        
        $stripeSecret = SaaSSetting::where('key', 'stripe_secret_key')->value('value');
        Stripe::setApiKey($stripeSecret);

        try {
            $session = Session::retrieve($request->session_id);
            $reservationId = $session->metadata->reservation_id;
            
            $reservation = Reservation::findOrFail($reservationId);

            if ($session->payment_status === 'paid') {
                $reservation->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed'
                ]);
                return response()->json(['status' => 'paid', 'reservation' => $reservation]);
            }

            return response()->json(['status' => $session->payment_status]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
