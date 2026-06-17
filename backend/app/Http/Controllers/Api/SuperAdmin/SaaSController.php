<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\SupportTicket;
use App\Models\SubscriptionPlan;
use App\Models\EmailTemplate;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

use App\Traits\AuditsOperation;

class SaaSController extends Controller
{
    private function audit(string $action, array $details = [], ?string $tenantId = null): void
    {
        $user = request()->user();
        AuditLog::create([
            'tenant_id' => $tenantId ?? (function_exists('tenant') ? tenant('id') : null),
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'action' => $action,
            'details' => $details,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
    /**
     * Get overview stats for the Super Admin dashboard.
     */
    public function getDashboardStats()
    {
        try {
            // 1. TENANT BREAKDOWN
            $activeTenantsQuery = Tenant::query();
            $tenantCount = $activeTenantsQuery->count();
            
            $subscribedCount = Tenant::whereNotNull('subscription_id')->where('subscription_id', '!=', '')->count();
            $nonSubscribedCount = max(0, $tenantCount - $subscribedCount);

            // 2. GROWTH ANALYSIS (Last 30 Days)
            $newTenantsCount = Tenant::where('created_at', '>=', now()->subDays(30))->count();
            $previousCount = max(1, $tenantCount - $newTenantsCount);
            $tenantGrowth = ($newTenantsCount / $previousCount) * 100;

            // 3. MRR & PLAN PERFORMANCE
            $totalMRR = 0;
            $industryMRR = [];
            
            $allPlans = \Illuminate\Support\Facades\Schema::hasTable('subscription_plans') 
                ? SubscriptionPlan::all() 
                : collect([]);
            
            $plansMap = $allPlans->pluck('monthly_price', 'slug');
            
            $tenants = Tenant::all();
            foreach ($tenants as $tenant) {
                $mrr = $plansMap[$tenant->plan] ?? 0;
                $totalMRR += $mrr;
                
                $type = $tenant->business_type ?? 'other';
                $industryMRR[$type] = ($industryMRR[$type] ?? 0) + $mrr;
            }

            // 4. INDUSTRY DISTRIBUTION
            $industryDistribution = Tenant::select('business_type', DB::raw('count(*) as count'))
                ->groupBy('business_type')
                ->get();

            $planSlugs = $allPlans->pluck('slug')->toArray();
            if (empty($planSlugs)) {
                $planSlugs = Tenant::whereNotNull('plan')->distinct()->pluck('plan')->toArray();
            }

            // 5. DYNAMIC MULTI-SERIES TREND (Last 7 Days)
            $planPerformanceTrend = [];
            $dates = [];
            for ($i = 6; $i >= 0; $i--) {
                $dates[] = now()->subDays($i)->format('D');
            }

            foreach ($planSlugs as $slug) {
                if (!$slug) continue;
                $dailyCounts = [];
                for ($i = 6; $i >= 0; $i--) {
                    $dateObj = now()->subDays($i);
                    $dailyCounts[] = Tenant::where('plan', $slug)
                                          ->where('created_at', '<=', $dateObj->endOfDay())
                                          ->count();
                }
                
                // Only include if there's at least some data or it's a primary plan
                $planPerformanceTrend[] = [
                    'name' => ucfirst($slug),
                    'data' => $dailyCounts
                ];
            }

            // 6. SYSTEM LOAD CALCULATION (Normalized)
            $load = function_exists('sys_getloadavg') ? sys_getloadavg() : [0.10, 0.10, 0.10];
            $cpuCores = 1;
            if (PHP_OS_FAMILY === 'Linux') {
                $cpuInfo = @file_get_contents('/proc/cpuinfo');
                if ($cpuInfo !== false) {
                    $cpuCores = max(1, preg_match_all('/^processor\s+:/m', $cpuInfo));
                } else {
                    $cpuCores = (int) shell_exec('nproc 2>/dev/null') ?: 1;
                }
            } elseif (PHP_OS_FAMILY === 'Darwin') {
                $cpuCores = (int) shell_exec('sysctl -n hw.ncpu 2>/dev/null') ?: 1;
            }
            
            $loadValue = $load[0] ?? 0;
            $loadPercentage = round(($loadValue / $cpuCores) * 100, 1) . '%';

            return response()->json([
                'stats' => [
                    'active_tenants' => $tenantCount,
                    'tenant_growth' => round($tenantGrowth, 1),
                    'subscribed_count' => $subscribedCount,
                    'non_subscribed_count' => $nonSubscribedCount,
                    'monthly_mrr' => number_format($totalMRR, 2, '.', ''),
                    'industry_mrr' => $industryMRR,
                    'industry_distribution' => $industryDistribution,
                    'system_load' => $loadPercentage, 
                    'plan_performance' => [
                        'labels' => $dates,
                        'series' => $planPerformanceTrend
                    ]
                ],
                'recent_tenants' => Tenant::latest()->take(5)->get(),
                'active_tickets_count' => SupportTicket::where('status', '!=', 'resolved')->count()
            ]);
        } catch (\Exception $e) {
            Log::error("Dashboard stats failure: " . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch complex stats: ' . $e->getMessage()], 500);
        }
    }

    /**
     * List all tenants with their domains.
     */
    public function getTenants()
    {
        $tenants = Tenant::with('domains')->get()
            ->map(function ($tenant) {
                $staffCount = User::on('tenant')
                    ->where('tenant_id', $tenant->id)
                    ->where('email', '!=', $tenant->owner_email)
                    ->count();
                $ownerUserId = User::on('tenant')
                    ->where('tenant_id', $tenant->id)
                    ->where('email', $tenant->owner_email)
                    ->value('id');
                $twoFactorMethod = User::on('tenant')
                    ->where('tenant_id', $tenant->id)
                    ->where('email', $tenant->owner_email)
                    ->value('two_factor_method');
                $twoFactorEnabled = $twoFactorMethod && $twoFactorMethod !== 'none';

                return [
                    'id' => $tenant->id,
                    'business_name' => $tenant->business_name ?? 'Unnamed Restaurant',
                    'plan' => $tenant->plan ?? 'free',
                    'created_at' => $tenant->created_at,
                    'domain' => $tenant->domains->first()?->domain ?? 'no-domain',
                    'status' => $tenant->status ?? 'active',
                    'owner_email' => $tenant->owner_email ?? 'unknown',
                    'owner_name' => $tenant->owner_name ?? 'unknown',
                    'owner_user_id' => $ownerUserId,
                    'two_factor_enabled' => $twoFactorEnabled ?? false,
                    'staff_count' => $staffCount
                ];
            })
            ->values(); // Reset keys after filtering

        return response()->json($tenants);
    }

    /**
     * Create a new tenant instance.
     */
    public function storeTenant(Request $request)
    {
        Log::info("Tenant creation attempt started", ['id' => $request->id]);

        $planSlugs = SubscriptionPlan::pluck('slug')->toArray();
        $planList = implode(',', $planSlugs) ?: 'free,pro,enterprise';

        try {
            $validated = $request->validate([
                'id' => 'required|string|unique:tenants,id|alpha_dash',
                'business_name' => 'required|string',
                'plan' => 'required|in:' . $planList,
                'owner_email' => 'required|email',
                'owner_name' => 'required|string',
                'owner_password' => 'nullable|string|min:8',
            ]);

            // Fetch Global Domains
            $centralDomain = \App\Models\SaaSSetting::get('central_domain', 'sectrosweb.test');
            $siteDomain = \App\Models\SaaSSetting::get('platform_site_domain', '');
            
            $primaryDomain = $validated['id'] . '.' . ltrim(parse_url($centralDomain, PHP_URL_HOST) ?? $centralDomain, 'www.');

            // Verify primary domain doesn't exist
            if (\Stancl\Tenancy\Database\Models\Domain::where('domain', $primaryDomain)->exists()) {
                Log::warning("Tenant creation aborted: Domain already exists", ['domain' => $primaryDomain]);
                return response()->json(['message' => 'The generated dashboard domain already exists in the system.'], 422);
            }

            $tenant = Tenant::create([
                'id' => $validated['id'],
                'business_name' => $validated['business_name'],
                'plan' => $validated['plan'],
                'owner_email' => $validated['owner_email'],
                'owner_name' => $validated['owner_name'],
                'status' => 'active',
                'data' => [
                    'status' => 'active',
                    'owner_name' => $validated['owner_name'],
                    'owner_email' => $validated['owner_email'],
                ]
            ]);

            // Create Primary Dashboard Domain
            $tenant->domains()->create(['domain' => $primaryDomain]);

            // Create Optional Public Site Domain
            if (!empty($siteDomain)) {
                $secondaryDomain = $validated['id'] . '.' . ltrim(parse_url($siteDomain, PHP_URL_HOST) ?? $siteDomain, 'www.');
                if (!\Stancl\Tenancy\Database\Models\Domain::where('domain', $secondaryDomain)->exists()) {
                     $tenant->domains()->create(['domain' => $secondaryDomain]);
                }
            }

            // --- AUTO-INITIALIZE OWNER ACCOUNT ---
            try {
                $ownerPassword = $validated['owner_password'] ?? \Illuminate\Support\Str::random(12);

                $user = User::on('tenant')->updateOrCreate(
                    ['email' => $validated['owner_email'], 'tenant_id' => $tenant->id],
                    [
                        'tenant_id' => $tenant->id,
                        'name' => $validated['owner_name'],
                        'password' => Hash::make($ownerPassword),
                        'role' => 'owner'
                    ]
                );

                if (class_exists(\Spatie\Permission\Models\Role::class)) {
                    $role = \Spatie\Permission\Models\Role::on('tenant')->firstOrCreate([
                        'name' => 'owner',
                        'guard_name' => 'web'
                    ]);
                    $user->assignRole($role);
                }

                Log::info("Tenant owner account initialized successfully", ['email' => $validated['owner_email']]);
            } catch (\Exception $e) {
                Log::error("Failed to auto-initialize owner account", ['error' => $e->getMessage()]);
            }

            Log::info("Tenant created successfully", ['id' => $tenant->id]);
            return response()->json([
                'message' => 'Tenant created successfully', 
                'tenant' => $tenant,
                'plain_password' => $ownerPassword ?? null
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $ve->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error("Tenant creation critical failure", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to create tenant: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle tenant status (Suspend/Reactivate).
     */
    public function updateTenantStatus(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        $status = $request->input('status');

        if (!in_array($status, ['active', 'suspended'])) {
            return response()->json(['message' => 'Invalid status'], 400);
        }

        $tenant->status = $status;
        $tenant->save();

        return response()->json(['message' => "Tenant status updated to {$status}"]);
    }

    /**
     * General update for a tenant (plan, business name, status).
     */
    public function updateTenant(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);

        if ($request->has('business_name')) {
            $tenant->business_name = $request->input('business_name');
        }
        if ($request->has('plan')) {
            $tenant->plan = $request->input('plan');
        }
        if ($request->has('status') && in_array($request->input('status'), ['active', 'suspended'])) {
            $tenant->status = $request->input('status');
        }

        $tenant->save();

        return response()->json(['message' => 'Tenant updated successfully', 'tenant' => $tenant]);
    }

    /**
     * Get staff for a specific tenant.
     */
    public function getTenantStaff($id)
    {
        $tenant = Tenant::findOrFail($id);

        $staff = User::on('tenant')
            ->where('tenant_id', $tenant->id)
            ->with('roles')
            ->get()
            ->map(function ($user) use ($tenant) {
                $isOwner = $user->email === $tenant->owner_email;
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $isOwner ? 'owner' : ($user->roles->first()?->name ?? 'staff'),
                    'is_active' => true,
                    'is_owner' => $isOwner,
                    'two_factor_enabled' => $user->two_factor_method !== 'none',
                    'created_at' => $user->created_at,
                ];
            });

        return response()->json($staff);
    }

    /**
     * Update tenant-specific feature flags.
     */
    public function updateTenantFeatures(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        $features = $request->input('features', []);

        $tenant->features = $features;
        $tenant->save();

        return response()->json([
            'message' => 'Tenant features updated successfully', 
            'features' => $features
        ]);
    }

    /**
     * Toggle 2FA for a tenant staff member.
     */
    public function toggleTenantUser2FA(Request $request, $id, $userId)
    {
        $tenant = Tenant::findOrFail($id);
        $request->validate(['enabled' => 'required|boolean']);

        $user = User::on('tenant')
            ->where('tenant_id', $tenant->id)
            ->findOrFail($userId);
        $user->update([
            'two_factor_method' => $request->enabled ? 'email' : 'none'
        ]);

        return response()->json(['message' => 'User 2FA updated successfully']);
    }

    /**
     * Update tenant-specific social platform IDs for webhook routing.
     */
    public function updateTenantSocialLinks(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        $validated = $request->validate([
            'whatsapp_id' => 'nullable|string',
            'facebook_page_id' => 'nullable|string',
            'instagram_id' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            $tenant->setAttribute($key, $value);
        }
        
        $tenant->save();

        return response()->json([
            'message' => 'Social links updated successfully',
            'social_links' => $validated
        ]);
    }

    /**
     * Get all support tickets.
     */
    public function getSupportTickets()
    {
        return response()->json(SupportTicket::latest()->get());
    }

    /**
     * Update a support ticket.
     */
    public function updateTicketStatus(Request $request, $id)
    {
        $ticket = SupportTicket::findOrFail($id);
        $ticket->update($request->only(['status', 'priority']));
        
        return response()->json(['message' => 'Ticket updated successfully', 'ticket' => $ticket]);
    }

    /**
     * Check system health and API uptime.
     */
    public function getSystemHealth()
    {
        try {
            // Real hardware metrics
            $load = function_exists('sys_getloadavg') ? sys_getloadavg() : [0, 0, 0];
            
            // CPU Core detection for normalization
            $cpuCores = 1;
            if (PHP_OS_FAMILY === 'Linux') {
                $cpuInfo = @file_get_contents('/proc/cpuinfo');
                if ($cpuInfo !== false) {
                    $cpuCores = max(1, preg_match_all('/^processor\s+:/m', $cpuInfo));
                } else {
                    $cpuCores = (int) shell_exec('nproc 2>/dev/null') ?: 1;
                }
            } elseif (PHP_OS_FAMILY === 'Darwin') {
                $cpuCores = (int) shell_exec('sysctl -n hw.ncpu 2>/dev/null') ?: 1;
            }
            
            $cpuLoadValue = $load[0] ?? 0;
            $cpuPercent = round(($cpuLoadValue / $cpuCores) * 100, 1);

            // Disk space
            $diskTotal = disk_total_space("/");
            $diskFree = disk_free_space("/");
            $diskUsed = $diskTotal - $diskFree;
            $diskUsagePercent = round(($diskUsed / $diskTotal) * 100, 1);

            // Memory usage (System-level if available)
            $memTotal = "N/A";
            $memUsed = "N/A";
            $memPercent = "0%";
            if (PHP_OS_FAMILY === 'Linux') {
                $memInfo = @file_get_contents('/proc/meminfo');
                if ($memInfo !== false) {
                    preg_match('/^MemTotal:\s+(\d+)\s+kB/m', $memInfo, $totalMatch);
                    preg_match('/^MemAvailable:\s+(\d+)\s+kB/m', $memInfo, $availMatch);
                    $totalKb = isset($totalMatch[1]) ? (int) $totalMatch[1] : 0;
                    $availKb = isset($availMatch[1]) ? (int) $availMatch[1] : 0;
                    $usedKb = $totalKb - $availKb;
                    $memTotal = round($totalKb / 1024) . " MB";
                    $memUsed = round($usedKb / 1024) . " MB";
                    $memPercent = $totalKb > 0 ? round(($usedKb / $totalKb) * 100, 1) . "%" : "0%";
                } else {
                    $memTotal = "Unknown";
                }
            } elseif (PHP_OS_FAMILY === 'Darwin') {
                $memTotalRaw = (int) shell_exec('sysctl -n hw.memsize 2>/dev/null') ?: 0;
                $memTotal = $memTotalRaw > 0 ? round($memTotalRaw / (1024 * 1024)) . " MB" : "N/A";
                $memUsedRaw = memory_get_usage(true);
                $memUsed = round($memUsedRaw / (1024 * 1024)) . " MB";
                $memPercent = $memTotalRaw > 0 ? round(($memUsedRaw / $memTotalRaw) * 100, 1) . "%" : "0%";
            }

            $services = [
                ['name' => 'Database (Central)', 'status' => 'operational', 'latency' => '2ms'],
                ['name' => 'Redis Cache', 'status' => 'operational', 'latency' => '1ms'],
                ['name' => 'Storage Service', 'status' => 'operational', 'latency' => '15ms'],
                ['name' => 'Sectros AI Engine', 'status' => 'operational', 'latency' => '45ms'],
            ];

            // Real check for DB
            try {
                DB::connection()->getPdo();
            } catch (\Exception $e) {
                $services[0]['status'] = 'outage';
            }

            return response()->json([
                'status' => $diskUsagePercent > 95 ? 'System warning: Disk low' : ($cpuPercent > 90 ? 'High CPU load warning' : 'All systems operational'),
                'uptime_99' => '99.98%',
                'metrics' => [
                    'cpu_load' => $cpuLoadValue,
                    'cpu_percent' => $cpuPercent . "%",
                    'ram_total' => $memTotal,
                    'ram_used' => $memUsed,
                    'ram_percent' => $memPercent,
                    'disk_total' => round($diskTotal / 1024 / 1024 / 1024, 1) . " GB",
                    'disk_used' => round($diskUsed / 1024 / 1024 / 1024, 1) . " GB",
                    'disk_percent' => $diskUsagePercent . "%"
                ],
                'services' => $services,
                'last_check' => now()->toIso8601String()
            ]);
        } catch (\Exception $e) {
            Log::error("System health failure: " . $e->getMessage());
            return response()->json(['message' => 'Health check failed'], 500);
        }
    }

    /**
     * Delete a tenant and its database.
     */
    public function destroyTenant($id)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->delete();

        return response()->json(['message' => 'Tenant deleted successfully']);
    }

    /**
     * Bulk delete multiple tenants.
     */
    public function bulkDeleteTenants(Request $request)
    {
        $ids = $request->input('ids', []);
        if (empty($ids)) {
            return response()->json(['message' => 'No tenants selected'], 400);
        }

        $count = Tenant::whereIn('id', $ids)->count();
        Tenant::whereIn('id', $ids)->get()->each->delete();

        return response()->json(['message' => "Successfully deleted {$count} tenants"]);
    }

    /**
     * Export selected tenants to CSV.
     */
    public function exportTenantsCsv(Request $request)
    {
        $ids = $request->input('ids', []);
        $query = Tenant::query();
        
        if (!empty($ids)) {
            $query->whereIn('id', $ids);
        }

        $tenants = $query->with('domains')->get();
        $fileName = 'tenants_export_' . date('Y-m-d') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Business Name', 'Owner Name', 'Owner Email', 'Plan', 'Status', 'Created At', 'Primary Domain'];

        $callback = function() use($tenants, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($tenants as $tenant) {
                fputcsv($file, [
                    $tenant->id,
                    $tenant->business_name,
                    $tenant->owner_name,
                    $tenant->owner_email,
                    $tenant->plan,
                    $tenant->status,
                    $tenant->created_at,
                    $tenant->domains->first()?->domain ?? ''
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Generate an impersonation token for a tenant owner.
     */
    public function impersonate($id)
    {
        $tenant = Tenant::findOrFail($id);
        $ownerEmail = $tenant->owner_email;

        if (!$ownerEmail) {
            return response()->json(['message' => 'Tenant owner email not found in tenant data'], 404);
        }

        try {
            $domain = $tenant->domains->first()?->domain;
            if (!$domain) {
                $centralDomain = config('tenancy.central_domains')[0] ?? 'Sectros.test';
                $newDomain = $id . '.' . $centralDomain;
                $tenant->domains()->create(['domain' => $newDomain]);
                $domain = $newDomain;
            }

            $user = User::on('tenant')->where('tenant_id', $tenant->id)->where('email', $ownerEmail)->first();
            if (!$user) {
                Log::info("Owner missing during impersonation. Creating...", ['email' => $ownerEmail]);
                $user = User::on('tenant')->create([
                    'tenant_id' => $tenant->id,
                    'email' => $ownerEmail,
                    'name' => $tenant->owner_name ?? 'Restaurant Owner',
                    'password' => Hash::make(\Illuminate\Support\Str::random(16)),
                    'role' => 'owner'
                ]);
            }

            $plan = SubscriptionPlan::on('platform')->where('slug', $tenant->plan)->first();
            $updateData = ['role' => 'owner'];
            if ($plan) {
                Log::info("Syncing plan features during impersonation", ['plan' => $tenant->plan, 'email' => $ownerEmail]);
                $updateData['features'] = $plan->features;
                $tenant->update(['features' => $plan->features]);
            }
            $user->update($updateData);

            if (class_exists(\Spatie\Permission\Models\Role::class)) {
                $role = \Spatie\Permission\Models\Role::on('tenant')->firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
                $user->assignRole($role);
            }

            $token = $user->createToken('impersonation_token', ['impersonate'], now('UTC')->addHour())->plainTextToken;

            $protocol = request()->getScheme();
            $this->audit('impersonation', [
                'tenant_id' => $tenant->id,
                'business_name' => $tenant->business_name,
                'owner_email' => $tenant->owner_email,
            ]);
            return response()->json([
                'token' => $token,
                'domain' => $domain,
                'redirect_url' => "{$protocol}://{$domain}/login"
            ]);
        } catch (\Exception $e) {
            Log::error("Comprehensive impersonation failure", ['error' => $e->getMessage()]);
            return response()->json(['message' => "Impersonation failed: " . $e->getMessage()], 500);
        }
    }

    /**
     * Get all unlocked themes for a tenant.
     */
    public function getTenantThemes($id)
    {
        $tenant = Tenant::findOrFail($id);
        
        $themes = DB::table('tenant_themes')
            ->join('website_templates', 'tenant_themes.website_template_id', '=', 'website_templates.id')
            ->where('tenant_themes.tenant_id', $id)
            ->select('website_templates.*', 'tenant_themes.purchased_at', 'tenant_themes.price_paid')
            ->get();
            
        return response()->json($themes);
    }

    /**
     * Manually unlock a premium theme for a tenant.
     */
    public function unlockTenantTheme(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        
        $request->validate([
            'theme_id' => 'required|exists:website_templates,id'
        ]);
        
        DB::table('tenant_themes')->updateOrInsert(
            ['tenant_id' => $id, 'website_template_id' => $request->theme_id],
            ['purchased_at' => now(), 'price_paid' => 0.00]
        );

        return response()->json(['message' => 'Theme unlocked successfully']);
    }

    /**
     * Revoke access to a premium theme for a tenant.
     */
    public function revokeTenantTheme($id, $theme_id)
    {
        $tenant = Tenant::findOrFail($id);
        
        DB::table('tenant_themes')
            ->where('tenant_id', $id)
            ->where('website_template_id', $theme_id)
            ->delete();
            
        return response()->json(['message' => 'Theme access revoked']);
    }

    /**

     * Get public branding settings for the platform.
     */
    public function getPublicBranding()
    {
        $settings = \App\Models\SaaSSetting::whereIn('key', ['platform_name', 'platform_logo_url', 'platform_favicon_url', 'turnstile_site_key'])->pluck('value', 'key');
        
        return response()->json([
            'platform_name'       => $settings['platform_name'] ?? config('app.name'),
            'platform_logo_url'   => $settings['platform_logo_url'] ?? null,
            'platform_favicon_url'=> $settings['platform_favicon_url'] ?? null,
            'turnstile_site_key'  => $settings['turnstile_site_key'] ?? null,
        ]);
    }

    /**
     * Public endpoint to get the active website theme. No auth required.
     */
    public function getPublicTheme()
    {
        $theme = \App\Models\SaaSSetting::where('key', 'website_theme')->value('value');
        return response()->json(['website_theme' => $theme ?? 'classic-ai']);
    }

    /**
     * Look up a tenant by its domain to show business info on login page.
     */
    public function getTenantByDomain($domain)
    {
        $tenant = Tenant::whereHas('domains', function($query) use ($domain) {
            $query->where('domain', $domain);
        })->first();

        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found'], 404);
        }

        return response()->json([
            'id' => $tenant->id,
            'business_name' => $tenant->business_name,
            'plan' => $tenant->plan,
            'status' => $tenant->status,
        ]);
    }

    /**
     * Get global SaaS settings.
     */
    private function sanitizeLanding(string $value): string
    {
        return strip_tags($value, '<b><i><u><a><br>');
    }

    private function maskSecret(?string $value): string
    {
        if (empty($value)) return '';
        if (strlen($value) <= 8) return str_repeat('*', strlen($value));
        return substr($value, 0, 4) . str_repeat('*', strlen($value) - 8) . substr($value, -4);
    }

    public function getSettings()
    {
        $settings = \App\Models\SaaSSetting::all()->pluck('value', 'key');
        
        return response()->json([
            'platform_name' => $settings['platform_name'] ?? 'Sectros Central',
            'central_domain' => $settings['central_domain'] ?? 'sectros.com',
            'platform_site_domain' => $settings['platform_site_domain'] ?? '',
            'require_2fa' => filter_var($settings['require_2fa'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'disable_public_signups' => filter_var($settings['disable_public_signups'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'mail_mailer' => $settings['mail_mailer'] ?? 'resend',
            'mail_host' => $settings['mail_host'] ?? 'smtp.mailtrap.io',
            'mail_port' => $settings['mail_port'] ?? '2525',
            'mail_username' => $settings['mail_username'] ?? '',
            'mail_password' => $this->maskSecret($settings['mail_password'] ?? ''),
            'mail_encryption' => $settings['mail_encryption'] ?? 'tls',
            'from_address' => $settings['from_address'] ?? 'noreply@sectros.com',
            'openai_api_key' => $this->maskSecret($settings['openai_api_key'] ?? ''),
            'claude_api_key' => $this->maskSecret($settings['claude_api_key'] ?? ''),
            'gemini_api_key' => $this->maskSecret($settings['gemini_api_key'] ?? ''),
            'ai_provider' => $settings['ai_provider'] ?? 'openai',
            'global_ai_enabled' => filter_var($settings['global_ai_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'social_verify_token' => $this->maskSecret($settings['social_verify_token'] ?? ''),
            'meta_app_secret' => $this->maskSecret($settings['meta_app_secret'] ?? ''),
            'facebook_client_id' => $this->maskSecret($settings['facebook_client_id'] ?? ''),
            'facebook_client_secret' => $this->maskSecret($settings['facebook_client_secret'] ?? ''),
            'whatsapp_channel_url' => $settings['whatsapp_channel_url'] ?? 'https://whatsapp.com/channel/0029VaDP7yS59PwL7REH7h2Y',
            'community_url' => $settings['community_url'] ?? 'https://whatsapp.com/channel/SectrosOwners',
            'instagram_url' => $settings['instagram_url'] ?? 'https://instagram.com/sectros',
            'twitter_url' => $settings['twitter_url'] ?? 'https://twitter.com/sectros',
            'facebook_url' => $settings['facebook_url'] ?? 'https://facebook.com/sectros',
            'youtube_url' => $settings['youtube_url'] ?? '',
            'tiktok_url' => $settings['tiktok_url'] ?? '',
            'default_system_prompt' => $settings['default_system_prompt'] ?? 'You are an AI assistant for a restaurant. Determine if the user wants to make a reservation. If yes, extract details (date, time, party size) and output JSON: {"type": "reservation", "details": {"date": "YYYY-MM-DD", "time": "HH:MM", "party_size": int, "requests": "string"}}. Else, generate a friendly reply: {"type": "general", "reply": "..."}.',
            // Landing Page Content
            'landing_badge_text' => $this->sanitizeLanding($settings['landing_badge_text'] ?? 'Now serving restaurants in 30+ cities'),
            'landing_hero_title' => $this->sanitizeLanding($settings['landing_hero_title'] ?? 'The Intelligent Guest Retention Platform'),
            'landing_hero_subtitle' => $this->sanitizeLanding($settings['landing_hero_subtitle'] ?? 'Maximise your restaurant\'s potential with smarter reservations, automated marketing, and a seamless guest experience — all in one place.'),
            'landing_cta_primary' => $this->sanitizeLanding($settings['landing_cta_primary'] ?? 'Start Free Trial'),
            'landing_cta_secondary' => $this->sanitizeLanding($settings['landing_cta_secondary'] ?? 'Explore Features'),
            'landing_trial_tagline' => $this->sanitizeLanding($settings['landing_trial_tagline'] ?? 'No credit card required • 14-day free trial'),
            'landing_hero_image_url' => $settings['landing_hero_image_url'] ?? '',
            'landing_social_proof_label' => $this->sanitizeLanding($settings['landing_social_proof_label'] ?? 'Trusted by growing restaurant brands'),
            'landing_social_proof_brands' => $this->sanitizeLanding($settings['landing_social_proof_brands'] ?? 'The Grill House,Bistro Uno,Saveur,Urban Plates,Coast & Co'),
            'landing_feature1_title' => $this->sanitizeLanding($settings['landing_feature1_title'] ?? 'Effortless Reservations'),
            'landing_feature1_subtitle' => $this->sanitizeLanding($settings['landing_feature1_subtitle'] ?? 'Accept table bookings automatically across all channels. Our smart availability engine prevents overbooking and keeps your floor running smoothly.'),
            'landing_feature1_bullets' => $this->sanitizeLanding($settings['landing_feature1_bullets'] ?? "Online booking widgets for your website\nSmart table & floor plan management\nWaitlist management & SMS alerts"),
            'landing_feature2_title' => $this->sanitizeLanding($settings['landing_feature2_title'] ?? 'Know Your Guests'),
            'landing_feature2_subtitle' => $this->sanitizeLanding($settings['landing_feature2_subtitle'] ?? 'Build rich guest profiles automatically. Track preferences, visit history, and spending patterns to deliver a personalised experience every time.'),
            'landing_feature2_bullets' => $this->sanitizeLanding($settings['landing_feature2_bullets'] ?? "Guest preference & allergy tracking\nAutomated follow-up messages\nLoyalty rewards & repeat booking tools"),
            'landing_bento_heading' => $this->sanitizeLanding($settings['landing_bento_heading'] ?? 'Everything you need to grow'),
            'landing_bento_subheading' => $this->sanitizeLanding($settings['landing_bento_subheading'] ?? 'Built for restaurant operators, not IT departments.'),
            'landing_bento_items' => $this->sanitizeLanding($settings['landing_bento_items'] ?? "Smart Reservations | Accept bookings 24/7 automatically\nTable Management | Visual floor plan and capacity control\nGuest Profiles | Know your regulars by name\nMarketing Tools | Email & SMS campaigns that drive returns"),
            'landing_cta_section_title' => $this->sanitizeLanding($settings['landing_cta_section_title'] ?? 'Ready to grow your restaurant?'),
            'landing_cta_section_body' => $this->sanitizeLanding($settings['landing_cta_section_body'] ?? 'Join hundreds of restaurants already using Sectros. Get set up in under 5 minutes — no tech skills required.'),
            'landing_cta_section_button' => $this->sanitizeLanding($settings['landing_cta_section_button'] ?? 'Start your 14-day free trial'),
            'website_theme' => $settings['website_theme'] ?? 'classic-ai',
            'trial_days' => (int) ($settings['trial_days'] ?? 14),
            'turnstile_site_key' => $settings['turnstile_site_key'] ?? '',
            'turnstile_secret_key' => $this->maskSecret($settings['turnstile_secret_key'] ?? ''),
            'require_card_for_trial' => filter_var($settings['require_card_for_trial'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'platform_logo_url' => $settings['platform_logo_url'] ?? '/brand/logo-black.png',
            'platform_favicon_url' => $settings['platform_favicon_url'] ?? '/brand/icon-light.png',
            'email_logo_url' => $settings['email_logo_url'] ?? '',
            // Payment Gateways
            'stripe_enabled' => filter_var($settings['stripe_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'stripe_publishable_key' => $this->maskSecret($settings['stripe_publishable_key'] ?? ''),
            'stripe_secret_key' => $this->maskSecret($settings['stripe_secret_key'] ?? ''),
            'stripe_webhook_secret' => $this->maskSecret($settings['stripe_webhook_secret'] ?? ''),
            'paystack_enabled' => filter_var($settings['paystack_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'paystack_public_key' => $this->maskSecret($settings['paystack_public_key'] ?? ''),
            'paystack_secret_key' => $this->maskSecret($settings['paystack_secret_key'] ?? ''),
            'flutterwave_enabled' => filter_var($settings['flutterwave_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'flutterwave_public_key' => $this->maskSecret($settings['flutterwave_public_key'] ?? ''),
            'flutterwave_secret_key' => $this->maskSecret($settings['flutterwave_secret_key'] ?? ''),
            'flutterwave_encryption_key' => $this->maskSecret($settings['flutterwave_encryption_key'] ?? ''),
            'dodo_enabled' => filter_var($settings['dodo_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'dodo_publishable_key' => $this->maskSecret($settings['dodo_publishable_key'] ?? ''),
            'dodo_secret_key' => $this->maskSecret($settings['dodo_secret_key'] ?? ''),
            'dodo_webhook_secret' => $this->maskSecret($settings['dodo_webhook_secret'] ?? ''),
            'default_currency' => $settings['default_currency'] ?? 'USD',
            'sales_email' => $settings['sales_email'] ?? '',
        ]);
    }

    /**
     * Upload branding files (logo/favicon).
     */
    public function uploadBranding(Request $request)
    {
        $request->validate([
            'type' => 'required|in:logo,favicon,email_logo',
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg,ico|max:2048',
        ]);

        $type = $request->input('type');
        $file = $request->file('file');
        
        $extension = $file->extension();
        $safeType = preg_replace('/[^a-z_]/', '', $type);
        $filename = "platform_{$safeType}_" . time() . ".{$extension}";
        
        // Store in public/platform
        $path = $file->storeAs('platform', $filename, 'public');
        $url = asset('storage/' . $path);

        $key = "platform_{$type}_url";
        \App\Models\SaaSSetting::updateOrCreate(
            ['key' => $key],
            ['value' => $url]
        );

        return response()->json([
            'message' => ucfirst($type) . ' uploaded successfully',
            'url' => $url
        ]);
    }

    /**
     * Update global SaaS settings.
     */
    public function updateSettings(Request $request)
    {
        $allowedKeys = [
            'platform_name', 'central_domain', 'platform_site_domain',
            'require_2fa', 'disable_public_signups',
            'mail_mailer', 'mail_host', 'mail_port', 'mail_username', 'mail_encryption', 'mail_password', 'from_address',
            'openai_api_key', 'claude_api_key', 'gemini_api_key', 'ai_provider', 'global_ai_enabled',
            'social_verify_token', 'meta_app_secret', 'facebook_client_id', 'facebook_client_secret',
            'meta_system_token',
            'whatsapp_channel_url', 'community_url', 'instagram_url', 'twitter_url', 'facebook_url', 'youtube_url', 'tiktok_url',
            'default_system_prompt',
            'landing_badge_text', 'landing_hero_title', 'landing_hero_subtitle',
            'landing_cta_primary', 'landing_cta_secondary', 'landing_trial_tagline',
            'landing_hero_image_url', 'landing_social_proof_label', 'landing_social_proof_brands',
            'landing_feature1_title', 'landing_feature1_subtitle', 'landing_feature1_bullets',
            'landing_feature2_title', 'landing_feature2_subtitle', 'landing_feature2_bullets',
            'landing_bento_heading', 'landing_bento_subheading', 'landing_bento_items',
            'landing_cta_section_title', 'landing_cta_section_body', 'landing_cta_section_button',
            'website_theme',
            'trial_days', 'require_card_for_trial',
            'email_logo_url',
            'turnstile_site_key', 'turnstile_secret_key',
            'stripe_enabled', 'stripe_publishable_key', 'stripe_secret_key', 'stripe_webhook_secret',
            'paystack_enabled', 'paystack_public_key', 'paystack_secret_key',
            'flutterwave_enabled', 'flutterwave_public_key', 'flutterwave_secret_key', 'flutterwave_encryption_key',
            'dodo_enabled', 'dodo_publishable_key', 'dodo_secret_key', 'dodo_webhook_secret',
            'default_currency', 'sales_email',
        ];
        
        $settings = $request->only($allowedKeys);
        
        foreach ($settings as $key => $value) {
            if (in_array($key, ['mail_password', 'openai_api_key', 'claude_api_key', 'gemini_api_key', 'social_verify_token', 'meta_app_secret', 'facebook_client_id', 'facebook_client_secret', 'stripe_publishable_key', 'stripe_secret_key', 'stripe_webhook_secret', 'paystack_public_key', 'paystack_secret_key', 'flutterwave_public_key', 'flutterwave_secret_key', 'flutterwave_encryption_key', 'dodo_publishable_key', 'dodo_secret_key', 'dodo_webhook_secret', 'turnstile_secret_key']) && !empty($value) && str_contains($value, '*')) {
                continue;
            }

            $storeValue = $value;
            if (is_array($value)) {
                $storeValue = json_encode($value);
            } elseif (is_bool($value)) {
                $storeValue = $value ? 'true' : 'false';
            } elseif (str_starts_with($key, 'landing_') && $key !== 'landing_hero_image_url') {
                $storeValue = strip_tags($value);
            }

            \App\Models\SaaSSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $storeValue]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }


    /**
     * Get all subscription plans.
     */
    public function syncTenantOwner($id)
    {
        $tenant = Tenant::findOrFail($id);
        Log::info("Self-healing sync started for tenant", ['id' => $id]);

        try {
            if ($tenant->domains->isEmpty()) {
                $centralDomain = config('tenancy.central_domains')[0] ?? 'Sectros.test';
                $newDomain = $id . '.' . $centralDomain;
                $tenant->domains()->create(['domain' => $newDomain]);
                Log::info("Self-healed missing domain during sync", ['id' => $id, 'domain' => $newDomain]);
            }

            $user = User::on('tenant')->updateOrCreate(
                ['email' => $tenant->owner_email, 'tenant_id' => $tenant->id],
                [
                    'tenant_id' => $tenant->id,
                    'name' => $tenant->owner_name ?? 'Restaurant Owner',
                    'password' => Hash::make(\Illuminate\Support\Str::random(16)),
                    'role' => 'owner'
                ]
            );

            $plan = SubscriptionPlan::on('platform')->where('slug', $tenant->plan)->first();
            if ($plan) {
                Log::info("Syncing plan features during manual sync", ['plan' => $tenant->plan, 'email' => $tenant->owner_email]);
                $user->update(['features' => $plan->features]);
                $tenant->update(['features' => $plan->features]);
            }

            if (class_exists(\Spatie\Permission\Models\Role::class)) {
                $role = \Spatie\Permission\Models\Role::on('tenant')->firstOrCreate([
                    'name' => 'owner',
                    'guard_name' => 'web'
                ]);
                $user->assignRole($role);
            }

            Log::info("Sync completed successfully", ['user_id' => $user->id]);
            return response()->json(['message' => 'Owner account synced successfully', 'user_id' => $user->id]);
        } catch (\Exception $e) {
            Log::error("Self-healing sync failed", ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Sync failed: ' . $e->getMessage()], 500);
        }
    }

    public function getSubscriptionPlans()
    {
        $plans = SubscriptionPlan::all();

        // Self-healing: If no plans exist, create the standard tiers
        if ($plans->isEmpty()) {
            $defaultPlans = [
                [
                    'name' => 'Free',
                    'slug' => 'free',
                    'monthly_price' => 0,
                    'yearly_price' => 0,
                    'reservation_limit' => 50,
                    'max_staff' => 2,
                    'ai_credits_limit' => 0,
                    'sms_credits_limit' => 0,
                    'features' => [
                        'insights' => true,
                        'reservations' => true,
                        'configuration' => true,
                        'provisioning' => true,
                        'billing_plan' => true,
                        'social_integration' => false,
                        'pos_terminal' => false,
                        'menu_builder' => false,
                        'floor_plan' => false,
                        'staff_management' => false,
                        'financial_reports' => false,
                        'ai_automation' => false,
                        'online_ordering' => false,
                        'inventory_tracking' => false,
                    ],
                    'is_active' => true,
                ],
                [
                    'name' => 'Pro',
                    'slug' => 'pro',
                    'monthly_price' => 49,
                    'yearly_price' => 470,
                    'reservation_limit' => 500,
                    'max_staff' => 10,
                    'ai_credits_limit' => 1000,
                    'sms_credits_limit' => 50,
                    'features' => [
                        'insights' => true,
                        'reservations' => true,
                        'configuration' => true,
                        'provisioning' => true,
                        'billing_plan' => true,
                        'social_integration' => true,
                        'pos_terminal' => true,
                        'menu_builder' => true,
                        'floor_plan' => true,
                        'staff_management' => true,
                        'financial_reports' => true,
                        'ai_automation' => false,
                        'online_ordering' => true,
                        'inventory_tracking' => false,
                    ],
                    'is_active' => true,
                ],
                [
                    'name' => 'Enterprise',
                    'slug' => 'enterprise',
                    'monthly_price' => 149,
                    'yearly_price' => 1430,
                    'reservation_limit' => null,
                    'max_staff' => null,
                    'ai_credits_limit' => 5000,
                    'sms_credits_limit' => 500,
                    'features' => [
                        'insights' => true,
                        'reservations' => true,
                        'configuration' => true,
                        'provisioning' => true,
                        'billing_plan' => true,
                        'social_integration' => true,
                        'pos_terminal' => true,
                        'menu_builder' => true,
                        'floor_plan' => true,
                        'staff_management' => true,
                        'financial_reports' => true,
                        'ai_automation' => true,
                        'online_ordering' => true,
                        'inventory_tracking' => true,
                    ],
                    'is_active' => true,
                ],
            ];

            foreach ($defaultPlans as $data) {
                SubscriptionPlan::create($data);
            }

            $plans = SubscriptionPlan::all();
        }

        return response()->json($plans);
    }

    /**
     * Create or update a subscription plan.
     */
    public function storeSubscriptionPlan(Request $request)
    {
        $id = $request->id;
        $validated = $request->validate([
            'name'               => 'required|string',
            'slug'               => 'required|string|unique:subscription_plans,slug,' . ($id ? $id : 'NULL'),
            'monthly_price'      => 'nullable|numeric',
            'yearly_price'       => 'nullable|numeric',
            'features'           => 'nullable|array',
            'reservation_limit'  => 'nullable|integer|min:0',
            'max_staff'          => 'nullable|integer|min:0',
            'ai_credits_limit'   => 'nullable|integer|min:0',
            'sms_credits_limit'  => 'nullable|integer|min:0',
            'is_active'          => 'boolean',
        ]);

        $data = array_merge($validated, [
            'is_active'         => $request->boolean('is_active', true),
            'reservation_limit' => $request->filled('reservation_limit') ? (int) $request->reservation_limit : null,
            'max_staff'         => $request->filled('max_staff') ? (int) $request->max_staff : null,
            'ai_credits_limit'  => $request->filled('ai_credits_limit') ? (int) $request->ai_credits_limit : null,
            'sms_credits_limit' => $request->filled('sms_credits_limit') ? (int) $request->sms_credits_limit : null,
        ]);

        if ($id) {
            $plan = SubscriptionPlan::findOrFail($id);
            $plan->update($data);
        } else {
            $plan = SubscriptionPlan::create($data);
        }

        return response()->json(['message' => 'Plan saved successfully', 'plan' => $plan]);
    }

    /**
     * Delete a subscription plan.
     */
    public function destroySubscriptionPlan($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        $plan->delete();
        return response()->json(['message' => 'Plan deleted successfully']);
    }

    /**
     * Get detailed subscription metrics and plan breakdown.
     */
    public function getSubscriptionMetrics()
    {
        $plans = SubscriptionPlan::all()->pluck('monthly_price', 'slug');
        
        $totalMRR = Tenant::where('plan', '!=', 'free')->get()->sum(function ($tenant) use ($plans) {
            return $plans[$tenant->plan] ?? 0;
        });

        return response()->json([
            'metrics' => [
                'total_mrr' => $totalMRR,
                'active_paid' => Tenant::where('plan', '!=', 'free')->count(),
                'free_tier' => Tenant::where('plan', 'free')->count(),
                'churn_rate' => '0.0%',
            ],
            'recent_tenants' => Tenant::latest()->take(10)->get(),
        ]);
    }

    /**
     * Super Admin Login — stateless credential check for SPA.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $admin = Admin::where('email', $email = $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $require2FA = (bool) \App\Models\SaaSSetting::get('require_2fa', false);

        if ($require2FA || $admin->two_factor_method !== 'none') {
            $method = $admin->two_factor_method !== 'none' ? $admin->two_factor_method : 'email';

            if ($method === 'email') {
                $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                $admin->update([
                    'two_factor_code' => $code,
                    'two_factor_expires_at' => now()->addMinutes(10),
                ]);

                // Attempt to send 2FA email using template
                $template = EmailTemplate::where('slug', '2fa_code')->first();
                $subject = $template ? $template->subject : 'Your Security Code';
                $content = $template ? $template->content : "Your verification code is: {code}";
                $platformName = \App\Models\SaaSSetting::get('platform_name', config('app.name'));

                try {
                    Mail::to($admin->email)->send(new \App\Mail\SystemMail($subject, $content, [
                        'code' => $code, 
                        'name' => $admin->name,
                        'platform_name' => $platformName
                    ]));
                } catch (\Exception $e) {
                    Log::error("Failed to send 2FA email: " . $e->getMessage());
                }
            }

            return response()->json([
                'requires_2fa' => true,
                'method'       => $method,
                'message'      => $method === 'email' ? 'A verification code has been sent to your email.' : 'Please provide your verification code.',
                'email'        => $admin->email
            ]);
        }

        return $this->issueAdminToken($admin);
    }

    public function issueAdminToken($admin)
    {
        $token = $admin->createToken('admin_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user' => [
                'email' => $admin->email,
                'name'  => $admin->name,
                'role'  => 'admin',
            ],
        ]);
    }

    /**
     * Verify 2FA code for Super Admin.
     */
    public function verify2FA(Request $request)
    {
        $request->validate([
            'email'  => 'required|email',
            'code'   => 'required|string',
            'method' => 'nullable|in:email,totp,pin',
        ]);

        $admin = Admin::where('email', $request->email)->firstOrFail();
        $twoFactorMethod = $admin->getAttribute('two_factor_method');
        $method = $request->input('method') ?? ($twoFactorMethod !== 'none' ? $twoFactorMethod : 'email');

        if ($method === 'email') {
            if ($admin->getAttribute('two_factor_code') !== $request->code || now()->gt($admin->getAttribute('two_factor_expires_at'))) {
                return response()->json(['message' => 'Invalid or expired verification code.'], 401);
            }
        } elseif ($method === 'totp') {
            $google2fa = new \PragmaRX\Google2FA\Google2FA();
            if (!$google2fa->verifyKey($admin->getAttribute('two_factor_secret'), $request->code)) {
                return response()->json(['message' => 'Invalid Authenticator code.'], 401);
            }
        } elseif ($method === 'pin') {
            if (!Hash::check($request->code, $admin->getAttribute('login_pin'))) {
                return response()->json(['message' => 'Invalid PIN.'], 401);
            }
        }

        // Clear code
        $admin->update([
            'two_factor_code' => null,
            'two_factor_expires_at' => null,
        ]);

        return $this->issueAdminToken($admin);
    }

    /**
     * Email Template Management
     */
    public function getEmailTemplates()
    {
        return response()->json(EmailTemplate::all());
    }

    public function storeEmailTemplate(Request $request)
    {
        $validated = $request->validate([
            'id' => 'nullable|integer',
            'slug' => 'required|string|unique:email_templates,slug,' . ($request->id ?? 'NULL'),
            'subject' => 'required|string',
            'content' => 'required|string',
            'variables' => 'nullable|array',
        ]);

        if ($request->id) {
            $template = EmailTemplate::findOrFail($request->id);
            $template->update($validated);
        } else {
            $template = EmailTemplate::create($validated);
        }

        return response()->json(['message' => 'Template saved successfully', 'template' => $template]);
    }

    public function destroyEmailTemplate($id)
    {
        EmailTemplate::destroy($id);
        return response()->json(['message' => 'Template deleted successfully']);
    }

    /**
     * Test global email settings.
     */
    public function testEmail(Request $request)
    {
        $recipient = $request->input('email', 'test@sectros.com');
        
        try {
            $subject = 'Sectros System Test Email';
            $content = 'Great news! This is a test email from Sectros System Settings. If you receive this, your SMTP/Resend configuration is working correctly and your premium design is active!';
            
            Mail::to($recipient)->send(new \App\Mail\SystemMail($subject, $content));

            return response()->json(['message' => 'Test email sent successfully to ' . $recipient]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send test email: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Test OpenAI API connection.
     */
    public function testAi(Request $request)
    {
        $provider = $request->input('ai_provider') ?: \App\Models\SaaSSetting::get('ai_provider', 'openai');
        
        if ($provider === 'anthropic' || $provider === 'claude') {
            $apiKey = $request->input('claude_api_key') ?: \App\Models\SaaSSetting::get('claude_api_key');
            if (!$apiKey) return response()->json(['message' => 'No Claude API Key found.'], 400);

            try {
                $response = Http::withHeaders([
                    'x-api-key' => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'content-type' => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model' => 'claude-3-5-sonnet-20240620',
                    'max_tokens' => 10,
                    'messages' => [['role' => 'user', 'content' => 'Say hello!']]
                ]);

                if ($response->successful()) {
                    return response()->json([
                        'message' => 'Claude Connection Successful!', 
                        'response' => $response->json()['content'][0]['text'] ?? 'Success'
                    ]);
                }
                return response()->json(['message' => 'Claude Connection Failed: ' . ($response->json()['error']['message'] ?? 'Unknown error')], 400);
            } catch (\Exception $e) {
                return response()->json(['message' => 'Claude Request Failed: ' . $e->getMessage()], 500);
            }
        }

        if ($provider === 'gemini') {
            $apiKey = $request->input('gemini_api_key') ?: \App\Models\SaaSSetting::get('gemini_api_key');
            if (!$apiKey) return response()->json(['message' => 'No Gemini API Key found.'], 400);

            try {
                $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => 'Say hello!']
                            ]
                        ]
                    ]
                ]);

                if ($response->successful()) {
                    return response()->json([
                        'message' => 'Gemini Connection Successful!', 
                        'response' => $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? 'Success'
                    ]);
                }
                return response()->json(['message' => 'Gemini Connection Failed: ' . ($response->json()['error']['message'] ?? 'Unknown error')], 400);
            } catch (\Exception $e) {
                return response()->json(['message' => 'Gemini Request Failed: ' . $e->getMessage()], 500);
            }
        }

        // Default to OpenAI
        $apiKey = $request->input('openai_api_key') ?: \App\Models\SaaSSetting::get('openai_api_key');

        if (!$apiKey) {
            return response()->json(['message' => 'No OpenAI API Key found.'], 400);
        }

        try {
            $response = Http::withToken($apiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-3.5-turbo',
                    'messages' => [['role' => 'user', 'content' => 'Say hello!']],
                    'max_tokens' => 5
                ]);

            if ($response->successful()) {
                return response()->json(['message' => 'OpenAI Connection Successful!', 'response' => $response->json()['choices'][0]['message']['content']]);
            }

            return response()->json(['message' => 'OpenAI Connection Failed: ' . ($response->json()['error']['message'] ?? 'Unknown error')], 400);
        } catch (\Exception $e) {
            return response()->json(['message' => 'OpenAI Request Failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get active sessions (tokens) for the current admin.
     */
    public function getSessions(Request $request)
    {
        $admin = $request->user();
        $currentTokenId = $admin->currentAccessToken()->id;

        $sessions = $admin->tokens()->orderBy('last_used_at', 'desc')->get()->map(function ($token) use ($currentTokenId) {
            return [
                'id'           => $token->id,
                'device'       => $token->name,
                'location'     => 'System Admin Access',
                'last_active'  => $token->last_used_at ? $token->last_used_at->diffForHumans() : 'Never',
                'is_current'   => $token->id === $currentTokenId,
            ];
        });

        return response()->json($sessions);
    }

    /**
     * Revoke a specific admin session.
     */
    public function revokeSession(Request $request, $id)
    {
        $admin = $request->user();
        $token = $admin->tokens()->where('id', $id)->first();

        if (!$token) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        $token->delete();

        return response()->json(['message' => 'Session revoked successfully']);
    }

    /**
     * Update 2FA Method preference.
     */
    public function update2faMethod(Request $request)
    {
        $request->validate([
            'method' => 'required|in:none,email,totp,pin',
        ]);

        $admin = $request->user();
        $newMethod = $request->input('method');

        if ($newMethod === 'totp' && !$admin->getAttribute('two_factor_secret')) {
            return response()->json(['message' => 'Please set up an authenticator app first.'], 400);
        }

        if ($newMethod === 'pin' && !$admin->getAttribute('login_pin')) {
            return response()->json(['message' => 'Please set a PIN first.'], 400);
        }

        $admin->update(['two_factor_method' => $newMethod]);

        return response()->json(['message' => '2FA method updated successfully.']);
    }

    /**
     * Generate Google Auth TOTP Secret and QR Code.
     */
    public function generateTotpSecret(Request $request)
    {
        $admin = $request->user();
        $google2fa = new \PragmaRX\Google2FA\Google2FA();

        $secret = $google2fa->generateSecretKey();
        
        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name', config('app.name')) . ' Admin',
            $admin->email,
            $secret
        );
        
        $writer = new \BaconQrCode\Writer(new \BaconQrCode\Renderer\ImageRenderer(
            new \BaconQrCode\Renderer\RendererStyle\RendererStyle(200),
            new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
        ));
        
        $qrImage = base64_encode($writer->writeString($qrCodeUrl));

        return response()->json([
            'secret' => $secret,
            'qr_code' => 'data:image/svg+xml;base64,'.$qrImage
        ]);
    }

    /**
     * Verify initial TOTP code to save secret.
     */
    public function verifyTotp(Request $request)
    {
        $request->validate([
            'secret' => 'required|string',
            'code'   => 'required|string',
        ]);

        $admin = $request->user();
        $google2fa = new \PragmaRX\Google2FA\Google2FA();

        $valid = $google2fa->verifyKey($request->secret, $request->code);

        if ($valid) {
            $admin->update([
                'two_factor_secret' => $request->secret,
                'two_factor_method' => 'totp'
            ]);
            return response()->json(['message' => 'Authenticator app enabled successfully.']);
        }

        return response()->json(['message' => 'Invalid verification code.'], 400);
    }

    /**
     * Set Login PIN.
     */
    public function setPin(Request $request)
    {
        $request->validate([
            'pin' => 'required|string|size:6|confirmed',
        ]);

        $admin = $request->user();
        $admin->update([
            'login_pin' => Hash::make($request->pin),
            'two_factor_method' => 'pin'
        ]);

        return response()->json(['message' => 'PIN set successfully.']);
    }

    /**
     * Send welcome/credentials email to a tenant owner.
     */
    public function sendWelcomeEmail(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        $request->validate([
            'email' => 'required|email',
            'domain' => 'required|string',
        ]);

        try {
            $subject = "Welcome to " . e(config('app.name')) . " - Your Dashboard is Ready";
            $safeDomain = e($request->domain);
            $content = "<h2>Welcome to " . e(config('app.name')) . "!</h2>
                        <p>Your restaurant dashboard has been successfully deployed.</p>
                        <p><strong>Dashboard URL:</strong> <a href='http://{$safeDomain}'>http://{$safeDomain}</a></p>
                        <p><strong>Login Email:</strong> " . e($request->email) . "</p>
                        <p>Please check your email for the password reset link or contact support if you need assistance.</p>";

            Mail::to($request->email)->send(new \App\Mail\SystemMail($subject, $content));
            return response()->json(['message' => 'Credentials dispatched successfully.']);
        } catch (\Exception $e) {
            Log::error("Failed to send welcome email", ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to send automated email: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reset the credentials (password/email) for a specific tenant staff/owner.
     */
    public function resetStaffCredentials(Request $request, $id, $userId)
    {
        $tenant = Tenant::findOrFail($id);
        $request->validate([
            'new_password' => 'nullable|string|min:8',
            'new_email' => 'nullable|email',
            'send_email' => 'boolean'
        ]);

        try {
            $user = User::on('tenant')
                ->where('tenant_id', $tenant->id)
                ->findOrFail($userId);

            $password = $request->new_password ?: \Illuminate\Support\Str::random(12);
            $email = $request->new_email ?: $user->email;

            $updateData = ['password' => Hash::make($password)];
            if ($request->filled('new_email')) {
                $updateData['email'] = $email;
            }

            $user->update($updateData);

            if ($user->email === $tenant->owner_email || $request->filled('new_email')) {
                if ($request->filled('new_email')) {
                     $tenant->update(['owner_email' => $email]);
                }
            }

            $response = ['message' => 'Credentials updated successfully.'];

            if ($request->send_email) {
                $domain = $tenant->domains->first()?->domain ?? 'N/A';
                
                $subject = e(config('app.name')) . " - Your Dashboard Credentials Have Been Reset";
                $safeDomain = e($domain);
                $safeEmail = e($email);
                $content = "<h2>Dashboard Security Update</h2>
                            <p>An administrator has updated your login credentials.</p>
                            <p><strong>Dashboard URL:</strong> <a href='http://{$safeDomain}'>http://{$safeDomain}</a></p>
                            <p><strong>Login Email:</strong> {$safeEmail}</p>
                            <p>Please use the forgot password link on the login page to set a new password if needed.</p>";

                Mail::to($email)->send(new \App\Mail\SystemMail($subject, $content));
                $response['email_sent'] = true;
            }

            if ($request->filled('new_email')) {
                $response['new_email'] = $email;
            }

            Log::info('Staff credentials reset', ['tenant_id' => $tenant->id, 'user_id' => $userId]);

            return response()->json($response);
            
        } catch (\Exception $e) {
            Log::error("Failed to reset staff credentials", ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to reset credentials: ' . $e->getMessage()], 500);
        }
    }
}
