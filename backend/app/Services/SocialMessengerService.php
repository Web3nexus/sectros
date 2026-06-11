<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SocialMessengerService
{
    const META_API_VERSION = 'v22.0';

    /**
     * Send a message to a social platform (WhatsApp/Facebook/Instagram).
     */
    public function sendMessage(string $platform, string $recipientId, string $message, array $metadata = [])
    {
        try {
            if ($platform === 'WhatsApp') {
                $phoneNumberId = $metadata['phone_number_id'] ?? null;
                if (!$phoneNumberId) {
                    Log::warning("WhatsApp Dispatch Missing phone_number_id");
                    return false;
                }
                $token = $this->getToken($metadata['tenant_id'] ?? null, 'whatsapp');
                if (!$token) return false;
                return $this->sendWhatsApp($recipientId, $message, $phoneNumberId, $token);
            } elseif ($platform === 'Facebook') {
                $pageToken = $metadata['page_token'] ?? $this->getToken($metadata['tenant_id'] ?? null, 'facebook');
                if (!$pageToken) return false;
                return $this->sendFacebook($recipientId, $message, $pageToken);
            } elseif ($platform === 'Instagram') {
                $pageToken = $metadata['page_token'] ?? $this->getToken($metadata['tenant_id'] ?? null, 'instagram');
                if (!$pageToken) return false;
                $igUserId = $metadata['instagram_id'] ?? null;
                if (!$igUserId) {
                    Log::warning("Instagram Dispatch Missing instagram_id");
                    return false;
                }
                return $this->sendInstagram($recipientId, $message, $igUserId, $pageToken);
            }
        } catch (\Exception $e) {
            Log::error("Social Dispatch Failed", ['platform' => $platform, 'error' => $e->getMessage()]);
        }

        return false;
    }

    /**
     * Resolve the appropriate token for the platform.
     * Facebook/Instagram require a Page Access Token; WhatsApp uses the system token.
     */
    private function getToken(?int $tenantId, string $platform): ?string
    {
        $saasSettings = \App\Models\SaaSSetting::all()->pluck('value', 'key');

        if ($platform === 'whatsapp') {
            $token = $saasSettings['meta_system_token'] ?? env('META_SYSTEM_TOKEN');
            if (empty($token)) {
                Log::warning("Skipping WhatsApp dispatch: No META_SYSTEM_TOKEN configured.");
                return null;
            }
            return $token;
        }

        if ($tenantId) {
            $tenant = \App\Models\Tenant::find($tenantId);
            if ($tenant && $tenant->facebook_page_token) {
                return decrypt($tenant->facebook_page_token);
            }
        }

        $token = $saasSettings['meta_system_token'] ?? env('META_SYSTEM_TOKEN');
        if (empty($token)) {
            Log::warning("Skipping {$platform} dispatch: No token available.");
            return null;
        }
        return $token;
    }

    /**
     * Dispatch to WhatsApp Cloud API.
     */
    private function sendWhatsApp(string $recipientId, string $message, string $phoneNumberId, string $token): bool
    {
        $url = "https://graph.facebook.com/" . self::META_API_VERSION . "/{$phoneNumberId}/messages";

        $response = Http::withToken($token)->post($url, [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $recipientId,
            'type' => 'text',
            'text' => ['body' => $message],
        ]);

        if ($response->successful()) {
            return true;
        }

        Log::error("WhatsApp API Error", [
            'response' => $response->json(),
            'status' => $response->status(),
            'phone_number_id' => $phoneNumberId,
        ]);
        return false;
    }

    /**
     * Dispatch to Facebook Messenger API using a Page Access Token.
     */
    private function sendFacebook(string $recipientId, string $message, string $pageToken): bool
    {
        $url = "https://graph.facebook.com/" . self::META_API_VERSION . "/me/messages";

        $response = Http::withToken($pageToken)->post($url, [
            'recipient' => ['id' => $recipientId],
            'message' => ['text' => $message],
            'messaging_type' => 'RESPONSE',
        ]);

        if ($response->successful()) {
            return true;
        }

        Log::error("Facebook Messenger API Error", [
            'response' => $response->json(),
            'status' => $response->status(),
        ]);
        return false;
    }

    /**
     * Dispatch to Instagram Messaging API via the Instagram Business Account ID.
     * Uses the /{ig-user-id}/messages endpoint with a Page Access Token.
     */
    private function sendInstagram(string $recipientId, string $message, string $igUserId, string $pageToken): bool
    {
        $url = "https://graph.facebook.com/" . self::META_API_VERSION . "/{$igUserId}/messages";

        $response = Http::withToken($pageToken)->post($url, [
            'recipient' => ['id' => $recipientId],
            'message' => ['text' => $message],
            'messaging_type' => 'RESPONSE',
        ]);

        if ($response->successful()) {
            return true;
        }

        Log::error("Instagram API Error", [
            'response' => $response->json(),
            'status' => $response->status(),
            'ig_user_id' => $igUserId,
        ]);
        return false;
    }
}
