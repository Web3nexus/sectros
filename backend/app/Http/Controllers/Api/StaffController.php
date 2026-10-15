<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffProfile;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index()
    {
        $tenant = tenant();
        if (!$tenant && auth()->check() && auth()->user()->tenant_id) {
            $tenant = \App\Models\Tenant::find(auth()->user()->tenant_id);
            if ($tenant) {
                \App\Services\TenantResolver::set($tenant);
                try {
                    tenancy()->initialize($tenant);
                } catch (\Throwable $e) {}
            }
        }

        if (!$tenant) {
            return response()->json(['message' => 'Tenant context not found'], 400);
        }

        // Query scoped to the active tenant
        $users = \App\Models\User::on('tenant')
            ->where('tenant_id', $tenant->id)
            ->get();
        $profiles = StaffProfile::on('tenant')
            ->where('tenant_id', $tenant->id)
            ->get();

        $usersByEmail = $users->keyBy(fn($u) => strtolower($u->email));
        $usersById = $users->keyBy('id');
        $profilesByUserId = $profiles->keyBy('user_id');
        $profilesByEmail = $profiles->keyBy(fn($p) => strtolower($p->email ?? ''));

        // Ensure every profile has a user_id link
        foreach ($profiles as $profile) {
            if (!$profile->user_id && $profile->email && $usersByEmail->has(strtolower($profile->email))) {
                $linkedUser = $usersByEmail[strtolower($profile->email)];
                $profile->update(['user_id' => $linkedUser->id]);
                $profilesByUserId->put($linkedUser->id, $profile);
            }
        }

        // Build staff list combining users and profiles
        $staff = $users->map(function ($user) use ($tenant, $profilesByEmail, $profilesByUserId) {
            $isOwner = strtolower($user->email) === strtolower($tenant->owner_email ?? '');
            $profile = $profilesByUserId->get($user->id) ?? $profilesByEmail->get(strtolower($user->email));

            $role = $user->role ?? ($profile->role ?? 'waiter');
            if ($isOwner) $role = 'owner';

            return [
                'id' => $profile?->id ?? $user->id,
                'user_id' => $user->id,
                'profile_id' => $profile?->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
                'is_active' => $profile ? (bool) $profile->is_active : true,
                'two_factor_enabled' => ($user->two_factor_method ?? 'none') !== 'none',
                'phone' => $profile->phone ?? null,
                'avatar_url' => $profile->avatar_url ?? null,
                'is_owner' => $isOwner,
                'created_at' => $user->created_at ?? null,
            ];
        });

        // Also include any profiles without a user record yet
        foreach ($profiles as $profile) {
            if ($profile->user_id && $usersById->has($profile->user_id)) continue;
            if ($profile->email && $usersByEmail->has(strtolower($profile->email))) continue;

            $staff->push([
                'id' => $profile->id,
                'user_id' => null,
                'profile_id' => $profile->id,
                'name' => $profile->name,
                'email' => $profile->email,
                'role' => $profile->role ?? 'waiter',
                'is_active' => (bool) $profile->is_active,
                'two_factor_enabled' => false,
                'phone' => $profile->phone,
                'avatar_url' => $profile->avatar_url,
                'is_owner' => false,
                'created_at' => $profile->created_at,
            ]);
        }

        return response()->json($staff->values());
    }

    public function toggle2FA(Request $request, $id)
    {
        // $id is now User ID
        $user = \App\Models\User::findOrFail($id);
        
        $request->validate(['enabled' => 'required|boolean']);
        
        $user->update([
            'two_factor_method' => $request->enabled ? 'email' : 'none'
        ]);
        
        return response()->json([
            'message' => 'Staff 2FA updated successfully.',
            'two_factor_enabled' => $request->enabled
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'role' => 'nullable|in:manager,waiter,chef,cashier,accountant,owner',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'nullable|boolean',
            'avatar_url' => 'nullable|string|max:2048',
        ]);

        $profile = StaffProfile::where('id', $id)->orWhere('user_id', $id)->first();
        if (!$profile) {
            $user = \App\Models\User::find($id);
            if ($user) {
                $profile = StaffProfile::create([
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'waiter',
                    'tenant_id' => $user->tenant_id ?? tenant('id'),
                ]);
            }
        }

        if (!$profile) {
            return response()->json(['message' => 'Staff profile not found'], 404);
        }

        $profile->update(array_filter($validated, fn($v) => !is_null($v)));

        if ($profile->user_id) {
            $user = \App\Models\User::find($profile->user_id);
            if ($user) {
                if (isset($validated['name'])) $user->name = $validated['name'];
                if (isset($validated['role'])) {
                    $user->role = $validated['role'];
                    try {
                        $roleRecord = \Spatie\Permission\Models\Role::firstOrCreate(['name' => $validated['role'], 'guard_name' => 'web']);
                        $user->syncRoles([$roleRecord]);
                    } catch (\Throwable $e) {}
                }
                $user->save();
            }
        }

        return response()->json(['message' => 'Staff updated successfully', 'staff' => $profile]);
    }

    public function destroy($id)
    {
        $profile = StaffProfile::where('id', $id)->orWhere('user_id', $id)->first();
        if ($profile) {
            if ($profile->user_id) {
                \App\Models\User::find($profile->user_id)?->delete();
            }
            $profile->delete();
        } else {
            \App\Models\User::find($id)?->delete();
        }
        return response()->json(['message' => 'Staff deleted']);
    }

    public function store(Request $request)
    {
        $tenant = tenant();
        if (!$tenant && auth()->check() && auth()->user()->tenant_id) {
            $tenant = \App\Models\Tenant::find(auth()->user()->tenant_id);
            if ($tenant) {
                \App\Services\TenantResolver::set($tenant);
                try {
                    tenancy()->initialize($tenant);
                } catch (\Throwable $e) {}
            }
        }

        if (!$tenant) {
            return response()->json(['message' => 'Tenant context not found'], 400);
        }

        // 1. Check Max Staff Limit
        $planSlug = $tenant->plan ?? 'free';

        $plan = \Stancl\Tenancy\Facades\Tenancy::central(function () use ($planSlug) {
            return \App\Models\SubscriptionPlan::where('slug', $planSlug)->first();
        });

        if ($plan && $plan->max_staff !== null) {
            $count = StaffProfile::where('tenant_id', $tenant->id)->count();
            
            if ($count >= $plan->max_staff) {
                return response()->json([
                    'error' => 'limit_reached',
                    'message' => "Maximum staff accounts limit of {$plan->max_staff} has been reached for your {$plan->name} plan.",
                    'limit' => $plan->max_staff
                ], 403);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'role' => 'required|in:manager,waiter,chef,cashier,accountant',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        [$staff, $user, $plainPassword] = $this->transaction(function () use ($validated, $tenant) {
            $staff = StaffProfile::create(array_merge($validated, [
                'tenant_id' => $tenant->id,
            ]));

            $plainPassword = \Illuminate\Support\Str::random(12);
            $user = \App\Models\User::create([
                'email' => $validated['email'],
                'name' => $validated['name'],
                'password' => \Illuminate\Support\Facades\Hash::make($plainPassword),
                'tenant_id' => $tenant->id,
                'role' => $validated['role'],
            ]);

            $staff->update(['user_id' => $user->id]);

            try {
                $roleRecord = \Spatie\Permission\Models\Role::firstOrCreate(['name' => $validated['role'], 'guard_name' => 'web']);
                $user->syncRoles([$roleRecord]);
            } catch (\Throwable $e) {}

            return [$staff, $user, $plainPassword];
        });

        // Send Staff Registration Email with credentials
        $template = \App\Models\EmailTemplate::where('slug', 'staff_registration')->first();
        if ($template) {
            $platformName = $this->cacheSetting('platform_name', 'Sectros');
            $businessName = tenant('business_name') ?? 'Your Business';
            $loginUrl = 'https://' . (tenant('id') ? tenant('id') . '.' : '') . (config('tenancy.central_domains')[0] ?? 'sectros.com') . '/login';

            try {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SystemMail($template->subject, $template->content, [
                    'name' => $user->name,
                    'business_name' => $businessName,
                    'platform_name' => $platformName,
                    'login_url' => $loginUrl,
                    'password' => $plainPassword,
                    'email' => $user->email,
            ]));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send staff registration email: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Staff member and user account created successfully.',
            'staff' => $staff,
            'user_id' => $user->id,
        ], 201);
    }
}
