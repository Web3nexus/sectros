<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\SaaSSetting;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class TenantPaymentController extends Controller
{
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

        try {
            $paymentService = new PaymentService;
            $tenant = tenant();

            $result = $paymentService->initializeReservationDeposit(
                $tenant,
                $reservation,
                $request->success_url,
                $request->cancel_url
            );

            $reservation->update([
                'stripe_payment_id' => $result['checkout_id'] ?? $result['reference'] ?? $result['tx_ref'] ?? null,
                'payment_status' => 'pending',
                'payment_method' => $result['provider'],
            ]);

            return response()->json([
                'url' => $result['url'],
                'provider' => $result['provider'],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function verifyPayment(Request $request)
    {
        $request->validate(['session_id' => 'required']);

        $stripeSecret = SaaSSetting::where('key', 'stripe_secret_key')->value('value');

        if (!$stripeSecret) {
            return response()->json(['message' => 'Payment gateway not configured.'], 500);
        }

        try {
            \Stripe\Stripe::setApiKey($stripeSecret);
            $session = \Stripe\Checkout\Session::retrieve($request->session_id);
            $reservationId = $session->metadata->reservation_id ?? null;

            if (!$reservationId) {
                return response()->json(['message' => 'Invalid session: missing reservation metadata.'], 400);
            }

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
