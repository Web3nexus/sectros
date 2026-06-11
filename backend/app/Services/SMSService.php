<?php

namespace App\Services;

use App\Models\SaaSSetting;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class SMSService
{
    /**
     * Send an SMS message using Twilio.
     */
    public static function send($to, $message)
    {
        $sid = SaaSSetting::where('key', 'twilio_sid')->value('value');
        $token = SaaSSetting::where('key', 'twilio_auth_token')->value('value');
        $from = SaaSSetting::where('key', 'twilio_from_number')->value('value');

        if (!$sid || !$token || !$from) {
            Log::error("SMS Service: Twilio credentials not configured.");
            return false;
        }

        try {
            $client = new Client($sid, $token);
            $client->messages->create($to, [
                'from' => $from,
                'body' => $message
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error("SMS Service Error: " . $e->getMessage());
            return false;
        }
    }
}
