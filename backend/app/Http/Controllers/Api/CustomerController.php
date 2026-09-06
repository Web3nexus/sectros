<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Aggregate distinct customers from reservations
        $reservations = Reservation::orderBy('reservation_time', 'desc')->get();
        $customersMap = [];

        foreach ($reservations as $res) {
            $key = strtolower(trim($res->customer_phone ?: ($res->customer_email ?: $res->customer_name)));
            if (empty($key)) continue;

            if (!isset($customersMap[$key])) {
                $customersMap[$key] = [
                    'id' => count($customersMap) + 1,
                    'name' => $res->customer_name ?: 'Guest',
                    'email' => $res->customer_email ?: '',
                    'phone' => $res->customer_phone ?: '',
                    'total_bookings' => 1,
                    'last_visit' => $res->reservation_time ? $res->reservation_time->format('Y-m-d H:i') : '',
                    'status' => 'new',
                    'notes' => $res->special_requests,
                    'total_spend' => (float)($res->deposit_amount ?: 0),
                ];
            } else {
                $customersMap[$key]['total_bookings']++;
                $customersMap[$key]['total_spend'] += (float)($res->deposit_amount ?: 0);
                if ($customersMap[$key]['total_bookings'] >= 3) {
                    $customersMap[$key]['status'] = 'vip';
                } else {
                    $customersMap[$key]['status'] = 'regular';
                }
            }
        }

        // Also merge any inbox contacts
        try {
            $contacts = Contact::all();
            foreach ($contacts as $contact) {
                $key = strtolower(trim($contact->phone ?: ($contact->email ?: $contact->name)));
                if (empty($key)) continue;

                if (!isset($customersMap[$key])) {
                    $customersMap[$key] = [
                        'id' => count($customersMap) + 1,
                        'name' => $contact->name ?: 'Guest',
                        'email' => $contact->email ?: '',
                        'phone' => $contact->phone ?: '',
                        'total_bookings' => 0,
                        'last_visit' => $contact->updated_at ? $contact->updated_at->format('Y-m-d H:i') : '',
                        'status' => 'lead',
                        'notes' => null,
                        'total_spend' => 0.0,
                    ];
                }
            }
        } catch (\Throwable $e) {}

        $list = array_values($customersMap);

        return response()->json($list);
    }
}
