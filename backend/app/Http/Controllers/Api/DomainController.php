<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\SaaSSetting;
use App\Services\NameSiloService;

class DomainController extends Controller
{
    /**
     * Tenant: Connect a custom domain.
     */
    public function connect(Request $request)
    {
        $validated = $request->validate([
            'domain' => 'required|string|max:255',
        ]);

        $domain = strtolower(trim($validated['domain']));

        if (!preg_match('/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/', $domain)) {
            return response()->json(['message' => 'Invalid domain format.'], 422);
        }

        $tenant = tenant();
        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        $exists = \Stancl\Tenancy\Database\Models\Domain::where('domain', $domain)->exists();
        if ($exists) {
            return response()->json(['message' => 'This domain is already connected to a tenant.'], 422);
        }

        $token = \Illuminate\Support\Str::random(32);

        $domainRecord = $tenant->domains()->create([
            'domain' => $domain,
            'type' => 'custom',
            'is_verified' => false,
            'verification_token' => $token,
        ]);

        return response()->json([
            'message' => 'Domain added. Verify ownership by adding the TXT record below.',
            'domain' => $domainRecord->domain,
            'verification_token' => $token,
        ], 201);
    }

    /**
     * Tenant: Check domain DNS verification status.
     */
    public function verify(Request $request)
    {
        $request->validate(['domain' => 'required|string']);

        $tenant = tenant();
        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        $domainRecord = $tenant->domains()->where('domain', $request->domain)->first();
        if (!$domainRecord) {
            return response()->json(['message' => 'Domain not found for this tenant.'], 404);
        }

        $result = $this->checkDns($domainRecord->domain);

        $domainRecord->update([
            'is_verified' => $result['connected'],
            'verified_at' => $result['connected'] ? now() : null,
            'last_checked_at' => now(),
        ]);

        return response()->json($result);
    }

    /**
     * Tenant: Get current domain status for all domains.
     */
    public function status(Request $request)
    {
        $tenant = tenant();
        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        $domains = $tenant->domains()->get()->map(function ($d) {
            return [
                'id' => $d->id,
                'domain' => $d->domain,
                'type' => $d->type ?? 'subdomain',
                'is_verified' => (bool) ($d->is_verified ?? false),
                'verified_at' => $d->verified_at,
                'ssl_status' => $d->ssl_status ?? 'none',
                'last_checked_at' => $d->last_checked_at,
            ];
        });

        $platformDomain = SaaSSetting::get('platform_site_domain', '');
        $serverIp = SaaSSetting::get('server_ip', gethostbyname(gethostname()));

        return response()->json([
            'domains' => $domains,
            'dns_instructions' => [
                'server_ip' => $serverIp,
                'platform_domain' => $platformDomain,
            ],
        ]);
    }

    /**
     * Admin: Check domain status for a specific tenant.
     */
    public function adminCheckTenant($tenantId)
    {
        $tenant = Tenant::on('platform')->find($tenantId);
        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        $domains = $tenant->domains()->get()->map(function ($d) {
            $dnsCheck = $this->checkDns($d->domain);

            return [
                'id' => $d->id,
                'domain' => $d->domain,
                'type' => $d->type ?? 'subdomain',
                'is_verified' => (bool) ($d->is_verified ?? false),
                'verified_at' => $d->verified_at,
                'ssl_status' => $d->ssl_status ?? 'none',
                'last_checked_at' => $d->last_checked_at,
                'registrar' => $d->registrar ?? null,
                'registrar_domain_id' => $d->registrar_domain_id ?? null,
                'purchase_price' => $d->purchase_price ?? null,
                'renewal_price' => $d->renewal_price ?? null,
                'registered_at' => $d->registered_at,
                'expires_at' => $d->expires_at,
                'auto_renew' => (bool) ($d->auto_renew ?? false),
                'dns_check' => $dnsCheck,
            ];
        });

        $platformDomain = SaaSSetting::get('platform_site_domain', '');
        $serverIp = SaaSSetting::get('server_ip', gethostbyname(gethostname()));

        return response()->json([
            'tenant_id' => $tenant->id,
            'business_name' => $tenant->business_name,
            'domains' => $domains,
            'expected' => [
                'server_ip' => $serverIp,
                'platform_domain' => $platformDomain,
            ],
        ]);
    }

    /**
     * Admin: Trigger a fresh DNS check for a tenant's domain.
     */
    public function adminVerifyDomain($tenantId, $domainId)
    {
        $tenant = Tenant::on('platform')->find($tenantId);
        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        $domainRecord = $tenant->domains()->where('id', $domainId)->first();
        if (!$domainRecord) {
            return response()->json(['message' => 'Domain not found for this tenant.'], 404);
        }

        $result = $this->checkDns($domainRecord->domain);

        $domainRecord->update([
            'is_verified' => $result['connected'],
            'verified_at' => $result['connected'] ? now() : null,
            'last_checked_at' => now(),
        ]);

        return response()->json(array_merge($result, [
            'domain' => $domainRecord->domain,
            'domain_id' => $domainRecord->id,
        ]));
    }

    /**
     * Admin: Check domain availability via NameSilo.
     */
    public function adminCheckAvailability($tenantId, Request $request)
    {
        $request->validate(['domain' => 'required|string']);

        $tenant = Tenant::on('platform')->find($tenantId);
        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        $namesiloEnabled = SaaSSetting::get('namesilo_enabled', false);
        $apiKey = SaaSSetting::where('key', 'namesilo_api_key')->value('value');
        if (!$namesiloEnabled || !$apiKey) {
            return response()->json(['message' => 'NameSilo domain registration is not configured.'], 400);
        }

        $domain = strtolower(trim($request->domain));
        $result = NameSiloService::checkAvailability($domain);

        if ($result === null) {
            return response()->json(['message' => 'Failed to check domain availability. Check NameSilo configuration.'], 500);
        }

        return response()->json($result);
    }

    /**
     * Admin: Purchase a domain via NameSilo and configure DNS.
     */
    public function adminPurchaseDomain($tenantId, Request $request)
    {
        $request->validate([
            'domain' => 'required|string',
            'years' => 'nullable|integer|min:1|max:10',
        ]);

        $tenant = Tenant::on('platform')->find($tenantId);
        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        $namesiloEnabled = SaaSSetting::get('namesilo_enabled', false);
        $apiKey = SaaSSetting::where('key', 'namesilo_api_key')->value('value');
        if (!$namesiloEnabled || !$apiKey) {
            return response()->json(['message' => 'NameSilo domain registration is not configured.'], 400);
        }

        $domain = strtolower(trim($request->domain));
        $years = (int) ($request->years ?? 1);

        $check = NameSiloService::checkAvailability($domain);
        if ($check === null) {
            return response()->json(['message' => 'Failed to verify domain availability.'], 500);
        }
        if (!$check['available']) {
            return response()->json(['message' => 'Domain is not available for registration.'], 422);
        }

        if (\Stancl\Tenancy\Database\Models\Domain::where('domain', $domain)->exists()) {
            return response()->json(['message' => 'This domain is already connected to a tenant.'], 422);
        }

        $purchasePrice = SaaSSetting::get('namesilo_domain_price', 15);
        $costPrice = SaaSSetting::get('namesilo_cost_price', 11.05);
        $serverIp = SaaSSetting::get('server_ip', gethostbyname(gethostname()));
        $platformDomain = SaaSSetting::get('platform_site_domain', '');
        $verificationToken = \Illuminate\Support\Str::random(32);

        $result = NameSiloService::registerDomain($domain, $years);
        if ($result === null) {
            return response()->json(['message' => 'Failed to register domain via NameSilo. Check logs for details.'], 500);
        }

        $dnsResults = NameSiloService::configureDomainDns($domain, $serverIp, $platformDomain, $verificationToken);

        $domainRecord = $tenant->domains()->create([
            'domain' => $domain,
            'type' => 'registered',
            'is_verified' => true,
            'verified_at' => now(),
            'verification_token' => $verificationToken,
            'last_checked_at' => now(),
            'registrar' => 'namesilo',
            'registrar_domain_id' => $result['order_id'] ?? null,
            'purchase_price' => $purchasePrice,
            'cost_price' => $costPrice,
            'renewal_price' => $purchasePrice * 0.75,
            'registered_at' => now(),
            'expires_at' => now()->addYears($years),
            'auto_renew' => $result['auto_renew'] ?? false,
        ]);

        return response()->json([
            'message' => 'Domain registered and configured successfully.',
            'domain' => $domainRecord->domain,
            'domain_id' => $domainRecord->id,
            'profit' => round($purchasePrice - $costPrice, 2),
            'registrar_result' => $result,
            'dns_results' => $dnsResults,
        ], 201);
    }

    /**
     * Admin: Re-configure DNS records for a registered domain.
     */
    public function adminConfigureDns($tenantId, $domainId, Request $request)
    {
        $tenant = Tenant::on('platform')->find($tenantId);
        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        $domainRecord = $tenant->domains()->where('id', $domainId)->first();
        if (!$domainRecord) {
            return response()->json(['message' => 'Domain not found for this tenant.'], 404);
        }

        if ($domainRecord->registrar !== 'namesilo') {
            return response()->json(['message' => 'DNS auto-configuration is only available for NameSilo-registered domains.'], 400);
        }

        $serverIp = SaaSSetting::get('server_ip', gethostbyname(gethostname()));
        $platformDomain = SaaSSetting::get('platform_site_domain', '');
        $verificationToken = $domainRecord->verification_token ?? \Illuminate\Support\Str::random(32);

        $dnsResults = NameSiloService::configureDomainDns(
            $domainRecord->domain,
            $serverIp,
            $platformDomain,
            $verificationToken
        );

        if ($domainRecord->verification_token !== $verificationToken) {
            $domainRecord->update(['verification_token' => $verificationToken]);
        }

        return response()->json([
            'message' => 'DNS records configured.',
            'domain' => $domainRecord->domain,
            'dns_results' => $dnsResults,
        ]);
    }

    /**
     * Perform DNS checks against the given domain.
     */
    protected function checkDns(string $domain): array
    {
        $serverIp = SaaSSetting::get('server_ip', gethostbyname(gethostname()));
        $platformDomain = SaaSSetting::get('platform_site_domain', '');
        $now = now()->toIso8601String();

        $records = @dns_get_record($domain, DNS_A | DNS_AAAA | DNS_CNAME);
        if (!$records) {
            $records = [];
        }

        $aRecords = array_filter($records, fn($r) => ($r['type'] ?? '') === 'A');
        $aaaaRecords = array_filter($records, fn($r) => ($r['type'] ?? '') === 'AAAA');
        $cnameRecords = array_filter($records, fn($r) => ($r['type'] ?? '') === 'CNAME');

        $aValues = array_map(fn($r) => $r['ip'] ?? '', $aRecords);
        $aaaaValues = array_map(fn($r) => $r['ipv6'] ?? '', $aaaaRecords);
        $cnameValues = array_map(fn($r) => rtrim($r['target'] ?? '', '.'), $cnameRecords);

        $aMatch = in_array($serverIp, $aValues);
        $cnameMatch = $platformDomain && in_array($platformDomain, $cnameValues);

        $connected = $aMatch || $cnameMatch;

        $checks = [];

        if ($aRecords) {
            $checks[] = [
                'type' => 'A',
                'status' => $aMatch ? 'ok' : 'mismatch',
                'found' => $aValues,
                'expected' => $serverIp,
                'message' => $aMatch
                    ? 'A record points to the correct server IP.'
                    : "A record points to " . implode(', ', $aValues) . ", expected {$serverIp}.",
            ];
        } else {
            $checks[] = [
                'type' => 'A',
                'status' => 'missing',
                'found' => [],
                'expected' => $serverIp,
                'message' => 'No A record found. Add an A record pointing to ' . $serverIp . '.',
            ];
        }

        if ($cnameRecords) {
            $checks[] = [
                'type' => 'CNAME',
                'status' => $cnameMatch ? 'ok' : 'mismatch',
                'found' => $cnameValues,
                'expected' => $platformDomain ?: '(not configured)',
                'message' => $cnameMatch
                    ? 'CNAME points to the correct platform domain.'
                    : "CNAME points to " . implode(', ', $cnameValues) . ".",
            ];
        } elseif ($platformDomain) {
            $checks[] = [
                'type' => 'CNAME',
                'status' => 'missing',
                'found' => [],
                'expected' => $platformDomain,
                'message' => "No CNAME record found for www subdomain.",
            ];
        }

        return [
            'connected' => $connected,
            'domain' => $domain,
            'checked_at' => $now,
            'server_ip' => $serverIp,
            'platform_domain' => $platformDomain,
            'checks' => $checks,
            'records' => array_map(fn($r) => [
                'type' => $r['type'] ?? '',
                'host' => $r['host'] ?? '',
                'target' => $r['type'] === 'CNAME' ? ($r['target'] ?? '') : ($r['ip'] ?? ($r['ipv6'] ?? '')),
            ], $records),
        ];
    }
}
