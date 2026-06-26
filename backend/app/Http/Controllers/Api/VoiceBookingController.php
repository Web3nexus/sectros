<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\TenantSetting;
use App\Services\VoiceBookingParser;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VoiceBookingController extends Controller
{
    private VoiceBookingParser $parser;

    public function __construct()
    {
        $this->parser = new VoiceBookingParser();
    }

    public function parseTranscript(Request $request)
    {
        $request->validate([
            'transcript' => 'required|string|max:2000',
        ]);

        $transcript = $request->input('transcript');

        try {
            $result = $this->parser->parseReservationIntent($transcript);

            $parsedAt = $result['datetime']['iso_8601'] ?? null;
            $parsedDate = $result['datetime']['date'] ?? null;
            $parsedTime = $result['datetime']['time'] ?? null;
            $confidence = $result['datetime']['confidence'] ?? 'fallback';

            return response()->json([
                'parsed' => true,
                'original' => $transcript,
                'datetime' => $result['datetime'],
                'party_size' => $result['party_size'],
                'customer_name' => $result['customer_name'],
                'customer_email' => $result['customer_email'],
                'confidence' => $confidence,
            ]);
        } catch (\Exception $e) {
            Log::error('Voice transcript parsing failed', [
                'transcript' => $transcript,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'parsed' => false,
                'original' => $transcript,
                'error' => 'Could not parse the transcript. Please try again with clearer details.',
            ], 422);
        }
    }

    public function parseAndValidate(Request $request)
    {
        $request->validate([
            'transcript' => 'required|string|max:2000',
        ]);

        $transcript = $request->input('transcript');

        try {
            $result = $this->parser->parseReservationIntent($transcript);

            $dateTime = $result['datetime'];

            if (!isset($dateTime['date']) || !isset($dateTime['time'])) {
                return response()->json([
                    'valid' => false,
                    'error' => 'Could not determine a date and time from the transcript.',
                    'suggestion' => 'Please provide both a date and time for the reservation.',
                    'partial' => $result,
                ], 422);
            }

            $isInPast = $this->isInPast($dateTime['date'], $dateTime['time']);
            $isWithinHours = $this->isWithinBusinessHours($dateTime['date'], $dateTime['time']);

            return response()->json([
                'valid' => !$isInPast,
                'original' => $transcript,
                'datetime' => $dateTime,
                'party_size' => $result['party_size'],
                'customer_name' => $result['customer_name'],
                'is_in_past' => $isInPast,
                'within_business_hours' => $isWithinHours,
                'suggestion' => $isInPast
                    ? 'The requested time is in the past. Did you mean a future date?'
                    : null,
            ]);
        } catch (\Exception $e) {
            Log::error('Voice booking validation failed', ['error' => $e->getMessage()]);

            return response()->json([
                'valid' => false,
                'error' => 'Failed to process booking request.',
            ], 500);
        }
    }

    public function quickBook(Request $request)
    {
        $request->validate([
            'transcript' => 'required|string|max:2000',
        ]);

        $tenant = tenant();
        if (!$tenant) {
            return response()->json(['error' => 'Tenant context required'], 400);
        }

        $transcript = $request->input('transcript');

        try {
            DB::beginTransaction();

            $result = $this->parser->parseReservationIntent($transcript);

            $dateTime = $result['datetime'];
            $partySize = $result['party_size'] ?? 2;
            $name = $result['customer_name'] ?? 'Voice Booking Guest';
            $email = $result['customer_email'];

            if (!isset($dateTime['date']) || !isset($dateTime['time'])) {
                DB::rollBack();
                return response()->json([
                    'error' => 'Could not determine reservation date and time.',
                    'partial' => $result,
                ], 422);
            }

            if ($this->isInPast($dateTime['date'], $dateTime['time'])) {
                DB::rollBack();
                return response()->json([
                    'error' => 'The requested time is in the past.',
                    'suggestion' => 'Please request a future date and time.',
                ], 422);
            }

            $reservationDate = $dateTime['date'];
            $reservationTime = $dateTime['time'];
            $reservationDateTime = Carbon::parse("{$reservationDate} {$reservationTime}");

            $settings = $this->cacheTenantSettings();
            $bookingPhone = $settings['booking_phone'] ?? '';

            $reservation = Reservation::create([
                'customer_name' => $name,
                'customer_email' => $email,
                'customer_phone' => $request->input('customer_phone', $bookingPhone),
                'reservation_date' => $reservationDate,
                'reservation_time' => $reservationTime,
                'party_size' => $partySize,
                'status' => 'pending',
                'source' => 'voice_booking',
                'notes' => "Voice transcript: {$transcript}",
            ]);

            $availableTables = RestaurantTable::where('status', 'available')
                ->where('capacity', '>=', $partySize)
                ->orderBy('capacity')
                ->get();

            if ($availableTables->isNotEmpty()) {
                $table = $availableTables->first();
                $reservation->update(['table_id' => $table->id, 'table_number' => $table->table_number]);
            }

            DB::commit();

            Log::info('Voice quick-book reservation created', [
                'tenant_id' => $tenant->id,
                'reservation_id' => $reservation->id,
                'transcript' => $transcript,
            ]);

            return response()->json([
                'success' => true,
                'reservation' => $reservation,
                'parsed' => $result,
                'message' => "Reservation confirmed for {$name} on {$reservationDate} at {$reservationTime} for {$partySize} guests.",
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Voice quick-book failed', [
                'error' => $e->getMessage(),
                'transcript' => $transcript,
            ]);

            return response()->json([
                'error' => 'Failed to create reservation from voice input.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    private function isInPast(string $date, string $time): bool
    {
        try {
            $dateTime = Carbon::parse("{$date} {$time}");
            return $dateTime->isPast();
        } catch (\Exception $e) {
            return false;
        }
    }

    private function isWithinBusinessHours(string $date, string $time): ?bool
    {
        try {
            $settings = $this->cacheTenantSettings();
            $hoursRaw = $settings['business_hours'] ?? null;

            if (!$hoursRaw) {
                return null;
            }

            $hours = is_string($hoursRaw) ? json_decode($hoursRaw, true) : $hoursRaw;

            if (!is_array($hours)) {
                return null;
            }

            $dayOfWeek = Carbon::parse($date)->format('l');

            $dayHours = $hours[$dayOfWeek] ?? $hours[strtolower($dayOfWeek)] ?? null;

            if (!$dayHours) {
                return false;
            }

            $open = $dayHours['open'] ?? $dayHours[0] ?? null;
            $close = $dayHours['close'] ?? $dayHours[1] ?? null;

            if (!$open || !$close) {
                return null;
            }

            $requestTime = Carbon::parse($time);
            $openTime = Carbon::parse($open);
            $closeTime = Carbon::parse($close);

            if ($closeTime->lessThan($openTime)) {
                $closeTime->addDay();
            }

            return $requestTime->between($openTime, $closeTime);
        } catch (\Exception $e) {
            return null;
        }
    }
}
