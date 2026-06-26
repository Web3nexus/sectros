<?php

namespace App\Services;

use Carbon\Carbon;
use Carbon\CarbonImmutable;

class VoiceBookingParser
{
    private array $timeKeywords = [
        'this evening' => '18:00',
        'tonight' => '19:00',
        'this afternoon' => '14:00',
        'this morning' => '09:00',
        'lunchtime' => '12:00',
        'lunch' => '12:30',
        'dinnertime' => '19:00',
        'dinner' => '19:30',
        'brunch' => '11:00',
        'midnight' => '00:00',
        'noon' => '12:00',
        'midday' => '12:00',
    ];

    private array $relativeDayKeywords = [
        'today' => 0,
        'tonight' => 0,
        'tomorrow' => 1,
        'the day after tomorrow' => 2,
        'day after tomorrow' => 2,
    ];

    private array $dayNames = [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
        'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
    ];

    public function parse(string $transcript): array
    {
        $transcript = $this->normalize($transcript);

        $dateTime = $this->extractExactDateTime($transcript);
        if ($dateTime !== null) {
            return $this->result($dateTime, 'exact');
        }

        $dateTime = $this->extractRelativeDateTime($transcript);
        if ($dateTime !== null) {
            return $this->result($dateTime, 'relative');
        }

        $date = $this->extractDate($transcript);
        $time = $this->extractTime($transcript);

        if ($date === null && $time === null) {
            return $this->result(now()->addHours(2)->setMinute(0)->setSecond(0), 'fallback');
        }

        if ($date === null) {
            $date = now();
            if ($time !== null && $time <= now()->format('H:i')) {
                $date = $date->addDay();
            }
        }

        if ($time === null) {
            $time = '18:00';
        }

        $parsed = Carbon::parse($date->format('Y-m-d') . ' ' . $time);

        return $this->result($parsed, 'combined');
    }

    private function normalize(string $text): string
    {
        $text = mb_strtolower(trim($text));
        $text = preg_replace('/\s+/', ' ', $text);
        $text = preg_replace('/[^\w\s:]/', '', $text);

        $replacements = [
            'around ' => '',
            'approximately ' => '',
            'roughly ' => '',
            'about ' => '',
            'like ' => '',
            'maybe ' => '',
            'i want to book for ' => '',
            'i want to book ' => '',
            'i\'d like to book ' => '',
            'i would like to book ' => '',
            'i need a reservation for ' => '',
            'book me for ' => '',
            'book me in for ' => '',
            'book me in ' => '',
            'can i book ' => '',
            'can i get ' => '',
            'can we get ' => '',
            'can we book ' => '',
            'reservation for ' => '',
            'booking for ' => '',
            'a table for ' => '',
            'table for ' => '',
            'for ' => '',
            'please' => '',
        ];

        foreach ($replacements as $search => $replace) {
            $text = str_replace($search, $replace, $text);
        }

        return trim(preg_replace('/\s+/', ' ', $text));
    }

    private function extractExactDateTime(string $text): ?Carbon
    {
        if (preg_match('/(\d{4})[-年\/](\d{1,2})[-月\/](\d{1,2})[日]?\s+(\d{1,2})[:：时](\d{2})/', $text, $m)) {
            return Carbon::create((int)$m[1], (int)$m[2], (int)$m[3], (int)$m[4], (int)$m[5], 0);
        }

        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})[t\s](\d{2}):(\d{2})/', $text, $m)) {
            return Carbon::create((int)$m[1], (int)$m[2], (int)$m[3], (int)$m[4], (int)$m[5], 0);
        }

        return null;
    }

    private function extractRelativeDateTime(string $text): ?Carbon
    {
        $explicitTime = $this->extractTime($text);

        $textWithDigits = $this->replaceWordNumbers($text);

        foreach ($this->timeKeywords as $keyword => $time) {
            if (str_contains($text, $keyword)) {
                $dayOffset = 0;
                foreach ($this->relativeDayKeywords as $dayWord => $offset) {
                    if (str_contains($text, $dayWord)) {
                        $dayOffset = $offset;
                        break;
                    }
                }

                foreach ($this->dayNames as $i => $dayName) {
                    $dayIndex = $i % 7;
                    if (str_contains($text, $dayName)) {
                        $targetDay = $this->resolveDayOfWeek($dayIndex);
                        $useTime = $explicitTime ?? $time;
                        $date = $targetDay->setTimeFromTimeString($useTime);
                        return $date;
                    }
                }

                $date = now()->addDays($dayOffset);
                $useTime = $explicitTime ?? $time;
                [$hours, $minutes] = explode(':', $useTime);
                return $date->setTime((int)$hours, (int)$minutes, 0);
            }
        }

        if (preg_match('/tomorrow\s+(afternoon|evening|night|morning|midnight)/', $text, $m)) {
            $timeMap = [
                'afternoon' => '14:00',
                'evening' => '18:00',
                'night' => '20:00',
                'morning' => '09:00',
                'midnight' => '00:00',
            ];
            $time = $explicitTime ?? ($timeMap[$m[1]] ?? '18:00');
            [$hours, $minutes] = explode(':', $time);
            return now()->addDay()->setTime((int)$hours, (int)$minutes, 0);
        }

        if (preg_match('/this\s+(coming\s+)?(saturday|sunday|friday|thursday|wednesday|tuesday|monday)/', $text, $m)) {
            $targetDay = $this->resolveDayOfWeek($this->dayNameToIndex($m[2]));
            $useTime = $explicitTime ?? '18:00';
            return $targetDay->setTimeFromTimeString($useTime);
        }

        if (preg_match('/next\s+(week\s+)?(saturday|sunday|friday|thursday|wednesday|tuesday|monday)/', $text, $m)) {
            $dayName = $m[2] ?? null;
            if ($dayName) {
                $targetDay = $this->resolveDayOfWeek($this->dayNameToIndex($dayName), true);
                $useTime = $explicitTime ?? '18:00';
                return $targetDay->setTimeFromTimeString($useTime);
            }
        }

        if (preg_match('/next\s+week/', $text)) {
            $nextWeekStart = now()->addWeek()->startOfWeek();
            $targetDay = $this->findNextDayName($text, $nextWeekStart);
            if ($targetDay === null) {
                $targetDay = $nextWeekStart->addDays(3);
            }
            $useTime = $explicitTime ?? '18:00';
            return $targetDay->setTimeFromTimeString($useTime);
        }

        if (preg_match('/in\s+(\d+)\s+days?/', $textWithDigits, $m)) {
            $days = (int)$m[1];
            $useTime = $explicitTime ?? '18:00';
            return now()->addDays($days)->setTimeFromTimeString($useTime);
        }

        if (preg_match('/in\s+(\d+)\s+weeks?/', $textWithDigits, $m)) {
            $weeks = (int)$m[1];
            $useTime = $explicitTime ?? '18:00';
            return now()->addWeeks($weeks)->setTimeFromTimeString($useTime);
        }

        if (preg_match('/next\s+weekend/', $text)) {
            $nextSaturday = now()->addWeek()->startOfWeek()->addDays(5);
            $useTime = $explicitTime ?? '18:00';
            return $nextSaturday->setTimeFromTimeString($useTime);
        }

        return null;
    }

    private function extractDate(string $text): ?Carbon
    {
        $textWithDigits = $this->replaceWordNumbers($text);

        foreach ($this->relativeDayKeywords as $word => $offset) {
            if (str_contains($text, $word)) {
                return now()->addDays($offset)->startOfDay();
            }
        }

        foreach ($this->dayNames as $i => $dayName) {
            if (str_contains($text, $dayName)) {
                $dayIndex = $i % 7;
                return $this->resolveDayOfWeek($dayIndex)->startOfDay();
            }
        }

        if (preg_match('/next\s+week/', $text)) {
            return now()->addWeek()->startOfWeek()->addDays(3)->startOfDay();
        }

        if (preg_match('/in\s+(\d+)\s+days?/', $textWithDigits, $m)) {
            return now()->addDays((int)$m[1])->startOfDay();
        }

        if (preg_match('/in\s+(\d+)\s+weeks?/', $textWithDigits, $m)) {
            return now()->addWeeks((int)$m[1])->startOfDay();
        }

        if (preg_match('/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/', $text, $m)) {
            $month = (int)$m[1];
            $day = (int)$m[2];
            $year = isset($m[3]) ? (int)$m[3] : now()->year;

            if ($year < 100) {
                $year += 2000;
            }

            if (checkdate($month, $day, $year)) {
                $date = Carbon::create($year, $month, $day, 0, 0, 0);
                if ($date !== false && $date->isPast() && !isset($m[3])) {
                    $date->addYear();
                }
                return $date ?: null;
            }
        }

        return null;
    }

    private function extractTime(string $text): ?string
    {
        if (preg_match('/(\d{1,2})[:\.](\d{2})\s*(am|pm|a\.m\.|p\.m\.)/i', $text, $m)) {
            $hours = (int)$m[1];
            $minutes = (int)$m[2];
            $meridiem = strtolower($m[3]);

            if ($meridiem === 'pm' && $hours < 12) {
                $hours += 12;
            } elseif ($meridiem === 'am' && $hours === 12) {
                $hours = 0;
            }

            return sprintf('%02d:%02d', $hours % 24, $minutes % 60);
        }

        if (preg_match('/(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)/i', $text, $m)) {
            $hours = (int)$m[1];
            $meridiem = strtolower($m[2]);

            if ($meridiem === 'pm' && $hours < 12) {
                $hours += 12;
            } elseif ($meridiem === 'am' && $hours === 12) {
                $hours = 0;
            }

            return sprintf('%02d:00', $hours % 24);
        }

        if (preg_match('/(\d{1,2})[:\.](\d{2})\s*(h|hrs?|hours?)?\s*$/', $text, $m)) {
            $hours = (int)$m[1];
            $minutes = (int)$m[2];
            if ($hours >= 0 && $hours <= 23 && $minutes >= 0 && $minutes <= 59) {
                return sprintf('%02d:%02d', $hours, $minutes);
            }
        }

        if (preg_match('/(\d{1,2})[:\.](\d{2})\s(?![ap]m)/i', $text, $m)) {
            $hours = (int)$m[1];
            $minutes = (int)$m[2];
            if ($hours >= 0 && $hours <= 23 && $minutes >= 0 && $minutes <= 59) {
                return sprintf('%02d:%02d', $hours, $minutes);
            }
        }

        if (preg_match('/(?:at\s+)?(\d{1,2})\s*(?:o\s*clock)?\s*(?:in\s+the\s+)?(morning|afternoon|evening)/i', $text, $m)) {
            $hours = (int)$m[1];
            $period = strtolower($m[2]);

            if ($period === 'afternoon' || $period === 'evening') {
                if ($hours < 12) $hours += 12;
            }
            if ($hours === 12 && $period === 'morning') {
                $hours = 0;
            }

            return sprintf('%02d:00', $hours);
        }

        return null;
    }

    private function resolveDayOfWeek(int $targetDayIndex, bool $nextWeek = false): Carbon
    {
        $now = now();
        $currentDayIndex = (int)$now->format('w');
        $daysUntil = $targetDayIndex - $currentDayIndex;

        if ($nextWeek) {
            $daysUntil += 7;
        } elseif ($daysUntil <= 0) {
            $daysUntil += 7;
        }

        return $now->addDays($daysUntil);
    }

    private function dayNameToIndex(string $name): int
    {
        $map = [
            'sunday' => 0, 'sun' => 0,
            'monday' => 1, 'mon' => 1,
            'tuesday' => 2, 'tue' => 2,
            'wednesday' => 3, 'wed' => 3,
            'thursday' => 4, 'thu' => 4,
            'friday' => 5, 'fri' => 5,
            'saturday' => 6, 'sat' => 6,
        ];
        return $map[$name] ?? 0;
    }

    private function findNextDayName(string $text, Carbon $start): ?Carbon
    {
        foreach ($this->dayNames as $dayName) {
            if (str_contains($text, $dayName)) {
                $targetIndex = $this->dayNameToIndex($dayName);
                $startIndex = (int)$start->format('w');
                $diff = $targetIndex - $startIndex;
                if ($diff < 0) {
                    $diff += 7;
                }
                return $start->copy()->addDays($diff);
            }
        }
        return null;
    }

    private array $wordNumbers = [
        'zero' => 0, 'one' => 1, 'two' => 2, 'three' => 3, 'four' => 4,
        'five' => 5, 'six' => 6, 'seven' => 7, 'eight' => 8, 'nine' => 9,
        'ten' => 10, 'eleven' => 11, 'twelve' => 12, 'thirteen' => 13,
        'fourteen' => 14, 'fifteen' => 15, 'sixteen' => 16, 'seventeen' => 17,
        'eighteen' => 18, 'nineteen' => 19, 'twenty' => 20,
        'thirty' => 30, 'forty' => 40, 'fifty' => 50,
    ];

    private function replaceWordNumbers(string $text): string
    {
        $pattern = '/\b(' . implode('|', array_keys($this->wordNumbers)) . ')\b/i';
        return preg_replace_callback($pattern, function ($m) {
            return (string) $this->wordNumbers[strtolower($m[1])];
        }, $text);
    }

    private function result(Carbon $dateTime, string $confidence): array
    {
        return [
            'iso_8601' => $dateTime->toIso8601String(),
            'date' => $dateTime->format('Y-m-d'),
            'time' => $dateTime->format('H:i'),
            'time_12h' => $dateTime->format('g:i A'),
            'day_of_week' => $dateTime->format('l'),
            'timestamp' => $dateTime->unix(),
            'confidence' => $confidence,
            'parsed_at' => now()->toIso8601String(),
        ];
    }

    public function parseReservationIntent(string $transcript): array
    {
        $dateTime = $this->parse($transcript);

        $partySize = $this->extractPartySize($transcript);
        $name = $this->extractName($transcript);
        $email = $this->extractEmail($transcript);

        return [
            'datetime' => $dateTime,
            'party_size' => $partySize,
            'customer_name' => $name,
            'customer_email' => $email,
            'original_transcript' => $transcript,
        ];
    }

    private function extractPartySize(string $text): ?int
    {
        if (preg_match('/(\d+)\s*(peoples?|persons?|guests?|covers?|pax|adults?|kids?|children?)/i', $text, $m)) {
            return (int)$m[1];
        }

        if (preg_match('/party\s+of\s+(\d+)/i', $text, $m)) {
            return (int)$m[1];
        }

        if (preg_match('/table\s+for\s+(\d+)/i', $text, $m)) {
            return (int)$m[1];
        }

        if (preg_match('/for\s+(\d+)\s*$/i', $text, $m)) {
            return (int)$m[1];
        }

        return null;
    }

    private function extractName(string $text): ?string
    {
        if (preg_match('/(?:name\s+is|my\s+name\s+is|calling\s+for|under\s+the\s+name)\s+([A-Za-z\s\'-]+?)(?:\.|,|$|and|my|i\s|for|please)/i', $text, $m)) {
            $name = trim($m[1]);
            if (strlen($name) > 2 && strlen($name) < 50) {
                return $name;
            }
        }

        if (preg_match('/for\s+([A-Za-z\s\'-]+?)(?:\.|,|$|at\s|on\s|this\s|please)/i', $text, $m)) {
            $name = trim($m[1]);
            $words = explode(' ', $name);
            if (count($words) <= 3 && strlen($name) > 2 && strlen($name) < 50) {
                $skipWords = ['today', 'tomorrow', 'dinner', 'lunch', 'breakfast', 'tonight', 'evening'];
                if (!in_array(strtolower($name), $skipWords) && !in_array(strtolower($words[0] ?? ''), $skipWords)) {
                    return $name;
                }
            }
        }

        return null;
    }

    private function extractEmail(string $text): ?string
    {
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text, $m)) {
            return $m[0];
        }
        return null;
    }
}
