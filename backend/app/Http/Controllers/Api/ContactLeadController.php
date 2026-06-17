<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactLead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactLeadController extends Controller
{
    /**
     * Store a new contact / demo-request lead.
     * Public endpoint — no auth required.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|max:255',
            'business'      => 'nullable|string|max:255',
            'business_type' => 'nullable|string|max:255',
            'locations'     => 'nullable|string|max:50',
            'message'       => 'nullable|string|max:5000',
        ]);

        $lead = ContactLead::create([
            ...$validated,
            'ip_address' => $request->ip(),
        ]);

        // Notify the platform owner by email
        try {
            $notifyEmail = \App\Models\SaaSSetting::get('sales_email')
                ?? \App\Models\SaaSSetting::get('contact_sales_email')
                ?? config('mail.from.address');

            if ($notifyEmail) {
                Mail::raw(
                    implode("\n", [
                        "New Demo Request",
                        "================",
                        "Name:      {$lead->name}",
                        "Email:     {$lead->email}",
                        "Business:  {$lead->business}",
                        "Type:      {$lead->business_type}",
                        "Locations: {$lead->locations}",
                        "",
                        "Message:",
                        $lead->message ?? '(none)',
                    ]),
                    fn($msg) => $msg
                        ->to($notifyEmail)
                        ->subject("New Demo Request — {$lead->name} ({$lead->business})")
                );
            }
        } catch (\Throwable $e) {
            // Non-fatal — lead is already saved
            Log::warning('Contact lead email notification failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Thank you! We will be in touch within one business day.',
            'id'      => $lead->id,
        ], 201);
    }

    /**
     * List all leads — super-admin only.
     */
    public function index(Request $request)
    {
        $leads = ContactLead::latest()
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->paginate(50);

        return response()->json($leads);
    }

    /**
     * Update lead status — super-admin only.
     */
    public function update(Request $request, ContactLead $lead)
    {
        $lead->update($request->validate([
            'status' => 'required|in:new,contacted,qualified,closed',
        ]));

        return response()->json(['message' => 'Updated.', 'lead' => $lead]);
    }
}
