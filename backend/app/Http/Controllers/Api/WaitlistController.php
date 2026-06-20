<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Waitlist;
use Illuminate\Http\Request;

class WaitlistController extends Controller
{
    public function index()
    {
        return response()->json(
            Waitlist::where(function ($q) {
                $q->where('status', 'waiting')
                  ->orWhere('status', 'notified');
            })
            ->orderBy('created_at', 'asc')
            ->paginate(50)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string',
            'customer_phone' => 'required|string',
            'party_size' => 'required|integer|min:1',
            'notes' => 'nullable|string'
        ]);

        $waitlist = Waitlist::create($validated);

        return response()->json($waitlist, 201);
    }

    public function notify($id)
    {
        $entry = Waitlist::findOrFail($id);
        $entry->update([
            'status' => 'notified',
            'notified_at' => now()
        ]);

        // Send SMS Notification
        $smsEnabled = \App\Models\TenantSetting::where('key', 'notifications_sms_enabled')->value('value');
        if ($smsEnabled) {
            $businessName = tenant('name') ?? 'The Business';
            $message = "Hello {$entry->customer_name}, your table at {$businessName} is now ready! Please head to the host stand.";
            \App\Services\SMSService::send($entry->customer_phone, $message);
        }

        return response()->json($entry);
    }

    public function seat($id)
    {
        $entry = Waitlist::findOrFail($id);
        $entry->update(['status' => 'seated']);
        return response()->json($entry);
    }

    public function cancel($id)
    {
        $entry = Waitlist::findOrFail($id);
        $entry->update(['status' => 'cancelled']);
        return response()->json($entry);
    }
}
