<?php

namespace App\Services;

use App\Models\SaaSSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NameSiloService
{
    protected static function apiKey(): ?string
    {
        return SaaSSetting::where('key', 'namesilo_api_key')->value('value');
    }

    protected static function enabled(): bool
    {
        return SaaSSetting::get('namesilo_enabled', false);
    }

    protected static function call(string $operation, array $params = []): ?array
    {
        $apiKey = self::apiKey();
        if (!$apiKey || !self::enabled()) {
            Log::error('NameSiloService: API key not configured or disabled.');
            return null;
        }

        $query = array_merge([
            'version' => 1,
            'type' => 'xml',
            'key' => $apiKey,
        ], $params);

        try {
            $response = Http::timeout(30)->get("https://www.namesilo.com/api/{$operation}", $query);
            if (!$response->successful()) {
                Log::error("NameSiloService: HTTP error {$response->status()} on {$operation}");
                return null;
            }

            $xml = simplexml_load_string($response->body());
            if (!$xml) {
                Log::error("NameSiloService: Failed to parse XML response for {$operation}");
                return null;
            }

            $json = json_decode(json_encode($xml), true);

            $code = $json['reply']['code'] ?? '';
            $detail = $json['reply']['detail'] ?? '';

            if ($code !== '300') {
                Log::error("NameSiloService: API error [{$code}] on {$operation}: {$detail}", $json['reply'] ?? []);
                return null;
            }

            return $json['reply'];
        } catch (\Exception $e) {
            Log::error("NameSiloService: Exception on {$operation}: " . $e->getMessage());
            return null;
        }
    }

    public static function checkAvailability(string $domain): ?array
    {
        $reply = self::call('checkRegisterAvailability', ['domains' => $domain]);
        if (!$reply) return null;

        $available = ($reply['available'] ?? '') === 'yes';

        return [
            'domain' => $domain,
            'available' => $available,
            'price' => $available ? ($reply['price'] ?? null) : null,
        ];
    }

    public static function registerDomain(
        string $domain,
        int $years = 1,
        array $contact = []
    ): ?array {
        $defaultContact = [
            'fn' => SaaSSetting::get('namesilo_registrant_first_name', 'Sectros'),
            'ln' => SaaSSetting::get('namesilo_registrant_last_name', 'Admin'),
            'ad' => SaaSSetting::get('namesilo_registrant_address', '123 Main St'),
            'cy' => SaaSSetting::get('namesilo_registrant_city', 'New York'),
            'st' => SaaSSetting::get('namesilo_registrant_state', 'NY'),
            'zp' => SaaSSetting::get('namesilo_registrant_zip', '10001'),
            'ct' => SaaSSetting::get('namesilo_registrant_country', 'US'),
            'em' => SaaSSetting::get('namesilo_registrant_email', 'admin@sectros.com'),
            'ph' => SaaSSetting::get('namesilo_registrant_phone', '+1.2125550100'),
        ];

        $contact = array_merge($defaultContact, $contact);

        $params = array_merge([
            'domain' => $domain,
            'years' => $years,
            'payment_id' => 0,
        ], $contact);

        $reply = self::call('registerDomain', $params);
        if (!$reply) return null;

        return [
            'domain' => $reply['domain'] ?? $domain,
            'order_id' => $reply['order_id'] ?? null,
            'registrant_id' => $reply['registrant_id'] ?? null,
            'expires' => $reply['expires'] ?? null,
            'auto_renew' => ($reply['auto_renew'] ?? '') === '1',
        ];
    }

    public static function addDnsRecord(string $domain, string $type, string $host, string $value, int $ttl = 7200): ?array
    {
        $params = [
            'domain' => $domain,
            'rrtype' => strtoupper($type),
            'rrhost' => $host,
            'rrvalue' => $value,
            'rrttl' => $ttl,
        ];

        $reply = self::call('dnsAddRecord', $params);
        if (!$reply) return null;

        return [
            'record_id' => $reply['record_id'] ?? null,
        ];
    }

    public static function listDnsRecords(string $domain): ?array
    {
        $reply = self::call('dnsListRecords', ['domain' => $domain]);
        if (!$reply) return null;

        $records = [];
        $raw = $reply['resource_record'] ?? [];
        if (isset($raw['record_id'])) {
            $raw = [$raw];
        }
        foreach ($raw as $r) {
            $records[] = [
                'record_id' => $r['record_id'] ?? '',
                'type' => $r['type'] ?? '',
                'host' => $r['host'] ?? '',
                'value' => $r['value'] ?? '',
                'ttl' => $r['ttl'] ?? '',
                'distance' => $r['distance'] ?? null,
            ];
        }

        return $records;
    }

    public static function deleteDnsRecord(string $domain, string $recordId): bool
    {
        $reply = self::call('dnsDeleteRecord', [
            'domain' => $domain,
            'rrid' => $recordId,
        ]);
        return $reply !== null;
    }

    public static function getDomainInfo(string $domain): ?array
    {
        $reply = self::call('getDomainInfo', ['domain' => $domain]);
        if (!$reply) return null;

        return [
            'domain' => $reply['domain'] ?? $domain,
            'created' => $reply['created'] ?? null,
            'expires' => $reply['expires'] ?? null,
            'auto_renew' => ($reply['auto_renew'] ?? '') === '1',
            'status' => $reply['status'] ?? null,
            'privacy' => ($reply['whois_privacy'] ?? '') === '1',
            'locked' => ($reply['locked'] ?? '') === '1',
        ];
    }

    public static function getPrices(): ?array
    {
        $reply = self::call('getPrices');
        if (!$reply) return null;

        $prices = [];
        $raw = $reply['types']['type'] ?? [];
        if (isset($raw['tld'])) {
            $raw = [$raw];
        }
        foreach ($raw as $t) {
            $tld = $t['tld'] ?? '';
            $prices[$tld] = [
                'registration' => $t['registration'] ?? null,
                'renew' => $t['renew'] ?? null,
                'transfer' => $t['transfer'] ?? null,
            ];
        }

        return $prices;
    }

    public static function configureDomainDns(string $domain, string $serverIp, ?string $platformDomain = null, ?string $verificationToken = null): array
    {
        $results = [];

        $results['a_record'] = self::addDnsRecord($domain, 'A', '@', $serverIp);

        if ($platformDomain) {
            $results['cname_record'] = self::addDnsRecord($domain, 'CNAME', 'www', $platformDomain);
        }

        if ($verificationToken) {
            $results['txt_record'] = self::addDnsRecord($domain, 'TXT', '@', $verificationToken);
        }

        return $results;
    }
}
