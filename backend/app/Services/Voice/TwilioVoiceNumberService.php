<?php

namespace App\Services\Voice;

use App\Models\SaaSSetting;
use App\Models\VoiceAgentPhoneNumber;
use App\Models\VoiceAgentSetting;
use App\Models\VoiceProvider;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class TwilioVoiceNumberService
{
    protected ?Client $client = null;
    protected ?string $error = null;

    public function __construct()
    {
        $sid = SaaSSetting::where('key', 'twilio_sid')->value('value');
        $token = SaaSSetting::where('key', 'twilio_auth_token')->value('value');

        if (!$sid || !$token) {
            $this->error = 'Twilio credentials not configured in platform settings';
            return;
        }

        try {
            $this->client = new Client($sid, $token);
        } catch (\Exception $e) {
            $this->error = 'Failed to initialize Twilio client: ' . $e->getMessage();
            Log::error('TwilioVoiceNumberService initialization failed: ' . $e->getMessage());
        }
    }

    public function isAvailable(): bool
    {
        return $this->client !== null;
    }

    public function getError(): ?string
    {
        return $this->error;
    }

    public function getWebhookUrlForAgent(VoiceAgentSetting $settings): ?string
    {
        $provider = VoiceProvider::find($settings->provider_id);
        if (!$provider) return null;

        $agentId = $settings->provider_agent_id;
        if (!$agentId) return null;

        return match ($provider->provider_key) {
            'elevenlabs' => "https://api.elevenlabs.io/v1/convai/twilio/inbound/{$agentId}",
            'vapi' => "https://api.vapi.ai/call/{$agentId}/twilio",
            'retell' => "https://api.retellai.com/v1/twilio/{$agentId}",
            default => null,
        };
    }

    public function linkNumberToAgent(VoiceAgentPhoneNumber $phoneNumber, VoiceAgentSetting $settings): array
    {
        if (!$this->client) {
            return ['success' => false, 'message' => $this->error];
        }

        if (!$settings->provider_agent_id) {
            return ['success' => false, 'message' => 'Agent not yet created. Sync agent first.'];
        }

        try {
            $twilioNumberSid = $phoneNumber->external_phone_number_id;

            if (!$twilioNumberSid) {
                $lookup = $this->findIncomingPhoneNumber($phoneNumber->phone_number);
                if (!$lookup) {
                    return ['success' => false, 'message' => "Phone number {$phoneNumber->phone_number} not found in Twilio account"];
                }
                $twilioNumberSid = $lookup->sid;
                $phoneNumber->external_phone_number_id = $twilioNumberSid;
                $phoneNumber->save();
            }

            $agentId = $settings->provider_agent_id;
            $voiceUrl = $this->getWebhookUrlForAgent($settings);
            if (!$voiceUrl) {
                return ['success' => false, 'message' => 'Could not determine webhook URL for provider'];
            }

            $this->client->incomingPhoneNumbers($twilioNumberSid)
                ->update([
                    'voiceUrl' => $voiceUrl,
                    'voiceMethod' => 'POST',
                ]);

            $phoneNumber->external_agent_id = $agentId;
            $phoneNumber->status = 'active';
            $phoneNumber->save();

            Log::info("Twilio number {$phoneNumber->phone_number} linked to agent {$agentId}");

            return ['success' => true, 'message' => 'Twilio number linked to agent'];
        } catch (\Exception $e) {
            Log::error("TwilioVoiceNumberService::linkNumberToAgent failed: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function unlinkNumber(VoiceAgentPhoneNumber $phoneNumber): array
    {
        if (!$this->client) {
            return ['success' => false, 'message' => $this->error];
        }

        try {
            $twilioNumberSid = $phoneNumber->external_phone_number_id;

            if ($twilioNumberSid) {
                $this->client->incomingPhoneNumbers($twilioNumberSid)
                    ->update([
                        'voiceUrl' => null,
                        'voiceMethod' => 'POST',
                    ]);

                Log::info("Twilio number {$phoneNumber->phone_number} unlinked (voice URL reset)");
            }

            return ['success' => true, 'message' => 'Phone number unlinked from agent'];
        } catch (\Exception $e) {
            Log::error("TwilioVoiceNumberService::unlinkNumber failed: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function searchAvailable(array $params): array
    {
        if (!$this->client) {
            return ['success' => false, 'message' => $this->error ?? 'Twilio not configured'];
        }

        try {
            $countryCode = $params['country_code'] ?? 'US';
            $type = $params['type'] ?? 'local';
            $areaCode = $params['area_code'] ?? null;
            $limit = min((int)($params['limit'] ?? 10), 50);

            $readParams = ['limit' => $limit];
            if ($areaCode) {
                $readParams['areaCode'] = $areaCode;
            }

            $available = $this->client->availablePhoneNumbers($countryCode);
            $numbers = match ($type) {
                'tollfree' => $available->tollFree->read([], $limit),
                'mobile' => $available->mobile->read($readParams, $limit),
                default => $available->local->read($readParams, $limit),
            };

            $results = array_map(fn($n) => [
                'phone_number' => $n->phoneNumber,
                'friendly_name' => $n->friendlyName,
                'locality' => $n->locality ?? '',
                'region' => $n->region ?? '',
                'country' => $n->country ?? $countryCode,
                'capabilities' => [
                    'voice' => $n->capabilities['voice'] ?? false,
                    'sms' => $n->capabilities['sms'] ?? false,
                ],
            ], $numbers);

            return ['success' => true, 'numbers' => $results];
        } catch (\Exception $e) {
            Log::error("Twilio searchAvailable failed: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function purchaseNumber(string $phoneNumber): array
    {
        if (!$this->client) {
            return ['success' => false, 'message' => $this->error ?? 'Twilio not configured'];
        }

        try {
            $incoming = $this->client->incomingPhoneNumbers->create([
                'phoneNumber' => $phoneNumber,
            ]);

            return [
                'success' => true,
                'sid' => $incoming->sid,
                'phone_number' => $incoming->phoneNumber,
                'friendly_name' => $incoming->friendlyName,
            ];
        } catch (\Exception $e) {
            Log::error("Twilio purchaseNumber failed: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    protected function findIncomingPhoneNumber(string $phoneNumber)
    {
        $numbers = [];
        $page = $this->client->incomingPhoneNumbers->page([], 50);
        do {
            foreach ($page as $record) {
                $numbers[] = $record;
            }
            $page = $page->nextPage();
        } while ($page !== null);

        foreach ($numbers as $number) {
            if ($number->phoneNumber === $phoneNumber) {
                return $number;
            }
        }

        foreach ($numbers as $number) {
            if (preg_replace('/[^0-9]/', '', $number->phoneNumber) === preg_replace('/[^0-9]/', '', $phoneNumber)) {
                return $number;
            }
        }

        return null;
    }
}
