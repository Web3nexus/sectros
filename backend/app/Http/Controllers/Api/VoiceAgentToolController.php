<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\TenantNotification;
use App\Models\VoiceAgentCall;
use App\Models\VoiceAgentSetting;
use App\Models\TenantSetting;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VoiceAgentToolController extends Controller
{
    protected function resolveTenantFromToken(Request $request): ?VoiceAgentSetting
    {
        $token = $request->input('agent_token');
        if (empty($token)) {
            return null;
        }
        return VoiceAgentSetting::withoutGlobalScopes()
            ->where('agent_token', $token)
            ->first();
    }

    protected function error(string $message, int $code = 401): JsonResponse
    {
        return response()->json(['error' => $message], $code);
    }

    protected function getOpeningHours(int $tenantId): array
    {
        $hours = TenantSetting::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('key', 'business_hours')
            ->first();

        if ($hours && $hours->value) {
            $decoded = json_decode($hours->value, true);
            if (is_array($decoded)) return $decoded;
        }

        $settings = VoiceAgentSetting::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->first();

        return $settings?->opening_hours ?? [];
    }

    protected function isWithinOpeningHours(array $openingHours, string $date, string $time): bool
    {
        $dayOfWeek = Carbon::parse($date)->format('l');
        $dayLower = strtolower($dayOfWeek);

        $dayHours = $openingHours[$dayOfWeek] ?? $openingHours[$dayLower] ?? null;
        if (!$dayHours) return false;

        if (is_array($dayHours)) {
            $open = $dayHours['open'] ?? $dayHours[0] ?? null;
            $close = $dayHours['close'] ?? $dayHours[1] ?? null;
        } else {
            $parts = explode('-', $dayHours);
            $open = $parts[0] ?? null;
            $close = $parts[1] ?? null;
        }

        if (!$open || !$close) return false;

        $requestTime = Carbon::parse($time);
        $openTime = Carbon::parse($open);
        $closeTime = Carbon::parse($close);

        if ($closeTime->lessThan($openTime)) {
            $closeTime->addDay();
        }

        return $requestTime->between($openTime, $closeTime->subMinutes(30));
    }

    protected function findAvailableTables(int $tenantId, string $date, string $time, int $partySize): array
    {
        $startTime = Carbon::parse($date . ' ' . $time);
        $settings = VoiceAgentSetting::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->first();

        $duration = $settings->reservation_duration_minutes ?? 90;
        $endTime = (clone $startTime)->addMinutes($duration);

        $tables = RestaurantTable::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('status', 'available')
            ->where('capacity', '>=', $partySize)
            ->get();

        $available = [];
        foreach ($tables as $table) {
            $conflicting = Reservation::withoutGlobalScopes()
                ->where('tenant_id', $tenantId)
                ->where('restaurant_table_id', $table->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->whereBetween('reservation_time', [$startTime, $endTime])
                      ->orWhereBetween('end_time', [$startTime, $endTime])
                      ->orWhere(function ($q) use ($startTime, $endTime) {
                          $q->where('reservation_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                      });
                })
                ->exists();

            if (!$conflicting) {
                $available[] = $table;
            }
        }

        return $available;
    }

    protected function getSuggestedTimes(int $tenantId, string $date, int $partySize): array
    {
        $settings = VoiceAgentSetting::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->first();

        $duration = $settings->reservation_duration_minutes ?? 90;
        $suggestions = [];

        $openingHours = $this->getOpeningHours($tenantId);
        $dayOfWeek = Carbon::parse($date)->format('l');
        $dayLower = strtolower($dayOfWeek);
        $dayHours = $openingHours[$dayOfWeek] ?? $openingHours[$dayLower] ?? null;

        $open = '11:00';
        $close = '21:00';
        if ($dayHours) {
            if (is_array($dayHours)) {
                $open = $dayHours['open'] ?? $dayHours[0] ?? '11:00';
                $close = $dayHours['close'] ?? $dayHours[1] ?? '21:00';
            } else {
                $parts = explode('-', $dayHours);
                $open = $parts[0] ?? '11:00';
                $close = $parts[1] ?? '21:00';
            }
        }

        $baseTime = Carbon::parse($open);
        $endTime = Carbon::parse($close)->subMinutes(30);

        while ($baseTime->lessThan($endTime)) {
            $timeStr = $baseTime->format('H:i');
            $available = $this->findAvailableTables($tenantId, $date, $timeStr, $partySize);
            if (!empty($available)) {
                $suggestions[] = $timeStr;
                if (count($suggestions) >= 3) break;
            }
            $baseTime->addMinutes($duration);
        }

        return $suggestions;
    }

    protected function usesTables(int $tenantId): bool
    {
        return RestaurantTable::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->exists();
    }

    public function checkAvailability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'agent_token' => 'required|string',
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
            'party_size' => 'required|integer|min:1',
        ]);

        $settings = $this->resolveTenantFromToken($request);
        if (!$settings) {
            return $this->error('Invalid agent token');
        }

        $maxPartySize = $settings->max_party_size ?? 20;
        if ($validated['party_size'] > $maxPartySize) {
            return response()->json([
                'available' => false,
                'message' => "The maximum party size is {$maxPartySize} guests. Would you like me to transfer you to a team member who can help?",
                'suggested_times' => [],
            ]);
        }

        $openingHours = $this->getOpeningHours($settings->tenant_id);
        $withinHours = $this->isWithinOpeningHours($openingHours, $validated['date'], $validated['time']);

        if (!$withinHours) {
            $offHoursBehavior = $settings->off_hours_behavior ?? 'take_message';
            $message = match ($offHoursBehavior) {
                'allow_confirmed' => 'The business is currently closed. Would you like to request a booking for review?',
                'pending_review' => 'The business is currently closed. I can save your request for the team to review later.',
                'transfer_human' => 'The business is closed now. Let me check if I can transfer you.',
                default => 'The business is currently closed. I can take a message and pass it along.',
            };

            return response()->json([
                'available' => false,
                'within_hours' => false,
                'message' => $message,
                'suggested_times' => [],
            ]);
        }

        if ($this->usesTables($settings->tenant_id)) {
            $availableTables = $this->findAvailableTables(
                $settings->tenant_id,
                $validated['date'],
                $validated['time'],
                $validated['party_size']
            );

            if (!empty($availableTables)) {
                return response()->json([
                    'available' => true,
                    'message' => "Yes, that time is available!",
                    'suggested_times' => [],
                ]);
            }

            $suggested = $this->getSuggestedTimes(
                $settings->tenant_id,
                $validated['date'],
                $validated['party_size']
            );

            return response()->json([
                'available' => false,
                'message' => 'That time is not available.',
                'suggested_times' => $suggested,
            ]);
        }

        return response()->json([
            'available' => true,
            'message' => "Yes, that time is available!",
            'suggested_times' => [],
        ]);
    }

    public function createReservation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'agent_token' => 'required|string',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
            'party_size' => 'required|integer|min:1',
            'special_request' => 'nullable|string|max:1000',
            'provider_call_id' => 'nullable|string|max:255',
        ]);

        $settings = $this->resolveTenantFromToken($request);
        if (!$settings) {
            return $this->error('Invalid agent token');
        }

        $maxPartySize = $settings->max_party_size ?? 20;
        $offHoursBehavior = $settings->off_hours_behavior ?? 'take_message';

        $openingHours = $this->getOpeningHours($settings->tenant_id);
        $withinHours = $this->isWithinOpeningHours($openingHours, $validated['date'], $validated['time']);

        $isOffHours = !$withinHours;
        $needsReview = false;

        if ($isOffHours) {
            if ($offHoursBehavior === 'allow_confirmed') {
            } elseif ($offHoursBehavior === 'pending_review' || $offHoursBehavior === 'take_message') {
                $needsReview = true;
            } elseif ($offHoursBehavior === 'transfer_human') {
                return response()->json([
                    'success' => false,
                    'needs_transfer' => true,
                    'message' => 'The business is closed. Please hold while I transfer you.',
                ]);
            }
        }

        if ($validated['party_size'] > $maxPartySize) {
            return response()->json([
                'success' => false,
                'needs_transfer' => true,
                'message' => "The maximum party size is {$maxPartySize} guests. Please hold while I transfer you to a team member.",
            ]);
        }

        $reservationTime = Carbon::parse($validated['date'] . ' ' . $validated['time']);
        $duration = $settings->reservation_duration_minutes ?? 90;
        $endTime = (clone $reservationTime)->addMinutes($duration);

        $reservationData = [
            'tenant_id' => $settings->tenant_id,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_email' => 'voice-' . uniqid() . '@placeholder.local',
            'reservation_time' => $reservationTime,
            'end_time' => $endTime,
            'duration_minutes' => $duration,
            'party_size' => $validated['party_size'],
            'special_requests' => $validated['special_request'] ?? null,
            'source' => 'ai_voice_agent',
            'status' => $needsReview ? 'pending' : 'confirmed',
        ];

        $reservation = DB::transaction(function () use ($reservationData, $needsReview, $settings, $validated) {
            if (!$needsReview && $this->usesTables($settings->tenant_id)) {
                RestaurantTable::withoutGlobalScopes()
                    ->where('tenant_id', $settings->tenant_id)
                    ->whereIn('id', function ($q) use ($settings, $validated) {
                        $date = $validated['date'];
                        $time = $validated['time'];
                        $startTime = Carbon::parse($date . ' ' . $time);
                        $duration = $settings->reservation_duration_minutes ?? 90;
                        $endTime = (clone $startTime)->addMinutes($duration);
                        $q->select('restaurant_table_id')
                            ->from('reservations')
                            ->where('tenant_id', $settings->tenant_id)
                            ->whereIn('status', ['pending', 'confirmed'])
                            ->where('reservation_time', '<', $endTime)
                            ->where('end_time', '>', $startTime);
                    })
                    ->lockForUpdate()
                    ->get();

                $tables = $this->findAvailableTables(
                    $settings->tenant_id,
                    $validated['date'],
                    $validated['time'],
                    $validated['party_size']
                );

                if (!empty($tables)) {
                    $reservationData['restaurant_table_id'] = $tables[0]->id;
                    $reservationData['resource_type'] = 'table';
                    $reservationData['resource_id'] = $tables[0]->id;
                }
            }

            return Reservation::withoutGlobalScopes()->create($reservationData);
        });

        if (!empty($validated['provider_call_id'])) {
            VoiceAgentCall::withoutGlobalScopes()
                ->where('provider_call_id', $validated['provider_call_id'])
                ->where('tenant_id', $settings->tenant_id)
                ->update([
                    'reservation_id' => $reservation->id,
                    'outcome' => $needsReview ? 'reservation_pending_review' : 'reservation_created',
                ]);
        }

        $reservationId = $reservation->id;

        if ($needsReview) {
            return response()->json([
                'success' => true,
                'reservation_id' => "RES-{$reservationId}",
                'status' => 'pending_review',
                'message' => 'Your booking request has been sent to the team for review. They will confirm shortly.',
            ]);
        }

        TenantNotification::withoutGlobalScopes()->create([
            'tenant_id' => $settings->tenant_id,
            'type' => 'voice_reservation',
            'title' => 'New AI Voice Reservation',
            'message' => "{$validated['customer_name']} booked for {$validated['party_size']} on {$validated['date']} at {$validated['time']} via AI Voice Agent.",
            'icon' => 'phone',
            'status' => 'unread',
            'reference_id' => $reservation->id,
        ]);

        return response()->json([
            'success' => true,
            'reservation_id' => "RES-{$reservationId}",
            'message' => 'Booking confirmed.',
        ]);
    }

    public function cancelReservation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'agent_token' => 'required|string',
            'reservation_id' => 'required|string',
        ]);

        $settings = $this->resolveTenantFromToken($request);
        if (!$settings) {
            return $this->error('Invalid agent token');
        }

        $numericId = str_replace('RES-', '', $validated['reservation_id']);

        $reservation = Reservation::withoutGlobalScopes()
            ->where('id', $numericId)
            ->where('tenant_id', $settings->tenant_id)
            ->first();

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found.',
            ]);
        }

        if (in_array($reservation->status, ['cancelled', 'completed'])) {
            return response()->json([
                'success' => false,
                'message' => "This reservation is already {$reservation->status}.",
            ]);
        }

        $reservation->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Your reservation has been cancelled.',
        ]);
    }

    public function transferToHuman(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'agent_token' => 'required|string',
            'reason' => 'nullable|string|max:500',
        ]);

        $settings = $this->resolveTenantFromToken($request);
        if (!$settings) {
            return $this->error('Invalid agent token');
        }

        $escalationPhone = $settings->escalation_phone_number;

        if (empty($escalationPhone)) {
            return response()->json([
                'success' => false,
                'message' => 'No team member is available for handoff right now. Please leave a message and we will get back to you.',
            ]);
        }

        return response()->json([
            'success' => true,
            'escalation_phone' => $escalationPhone,
            'message' => "Please hold while I transfer you to a team member.",
        ]);
    }
}
