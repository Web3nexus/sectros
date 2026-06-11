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
        if (!$tenant) {
            return response()->json(['error' => 'Tenant context not found'], 400);
        }

        // Use direct DB query to ensure we see exactly what is in the tenant users table
        // This bypasses any Eloquent global scopes that might be filtering results unexpectedly
        $users = \Illuminate\Support\Facades\DB::table('users')->get();
        $profiles = \Illuminate\Support\Facades\DB::table('staff_profiles')->get();

        // --- Auto-Healing: Ensure all staff_profiles have a corresponding User record ---
        // This fixes legacy records (like waitstaff) created before the users-table unification
        $usersByEmail = $users->keyBy(fn($u) => strtolower($u->email));
        $usersById = $users->keyBy('id');
        $newUsersAdded = false;

        foreach ($profiles as $profile) {
            $hasUser = false;
            if ($profile->user_id && $usersById->has($profile->user_id)) {
                $hasUser = true;
            } elseif ($profile->email && $usersByEmail->has(strtolower($profile->email))) {
                $hasUser = true;
                // Fix missing linkage if needed
                if (!$profile->user_id) {
                    \Illuminate\Support\Facades\DB::table('staff_profiles')
                        ->where('id', $profile->id)
                        ->update(['user_id' => $usersByEmail[strtolower($profile->email)]->id]);
                }
            }

            if (!$hasUser) {
                // Auto-create missing user for this staff profile
                $email = $profile->email ?: 'staff_' . $profile->id . '@' . ($tenant->id ?? 'tenant') . '.local';
                
                $userId = \Illuminate\Support\Facades\DB::table('users')->insertGetId([
                    'name' => $profile->name ?? 'Unknown Staff',
                    'email' => $email,
                    'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(12)),
                    'role' => $profile->role ?? 'waiter',
                    'tenant_id' => $tenant->id ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                \Illuminate\Support\Facades\DB::table('staff_profiles')
                    ->where('id', $profile->id)
                    ->update([
                        'user_id' => $userId,
                        'email' => $email
                    ]);

                // Try to assign correct role
                try {
                    $userModel = \App\Models\User::find($userId);
                    if ($userModel) {
                        $roleName = $profile->role ?? 'waiter';
                        $roleRecord = \Spatie\Permission\Models\Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
                        $userModel->syncRoles([$roleRecord]);
                    }
                } catch (\Exception $e) {}

                $newUsersAdded = true;
            }
        }

        if ($newUsersAdded) {
            $users = \Illuminate\Support\Facades\DB::table('users')->get();
            $profiles = \Illuminate\Support\Facades\DB::table('staff_profiles')->get();
        }
        // -------------------------------------------------------------------------

        $profilesByEmail = $profiles->keyBy('email');
        $profilesByUserId = $profiles->keyBy('user_id');

        $staff = $users->map(function($user) use ($tenant, $profilesByEmail, $profilesByUserId) {
            $isOwner = strtolower($user->email) === strtolower($tenant->owner_email ?? '');
            
            // Try to find profile by user_id first, then fallback to email
            $profile = $profilesByUserId->get($user->id) ?? $profilesByEmail->get($user->email);

            // Handle role: use column if exists, otherwise fallback
            $role = $user->role ?? 'staff';
            if ($isOwner) $role = 'owner';

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
                'is_active' => $profile ? (bool)$profile->is_active : true,
                'two_factor_enabled' => ($user->two_factor_method ?? 'none') !== 'none',
                'phone' => $profile->phone ?? null,
                'avatar_url' => $profile->avatar_url ?? null,
                'is_owner' => $isOwner,
                'created_at' => $user->created_at ?? null,
            ];
        });

        return response()->json($staff);
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
            'name' => 'string|max:255',
            'email' => 'email|unique:staff_profiles,email,' . $id,
            'role' => 'in:manager,waiter,chef,cashier,accountant,owner',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'avatar_url' => 'nullable|string|max:2048',
        ]);

        $profile = StaffProfile::findOrFail($id);
        $profile->update($validated);

        $user = \App\Models\User::find($profile->user_id);
        if ($user && isset($validated['role'])) {
            $roleRecord = \Spatie\Permission\Models\Role::firstOrCreate(['name' => $validated['role'], 'guard_name' => 'web']);
            $user->syncRoles([$roleRecord]);
        }

        return response()->json(['message' => 'Staff updated successfully', 'staff' => $profile]);
    }

    public function destroy($id)
    {
        $profile = StaffProfile::findOrFail($id);
        if ($profile->user_id) {
            \App\Models\User::find($profile->user_id)?->delete();
        }
        $profile->delete();
        return response()->json(['message' => 'Staff deleted']);
    }

    public function store(Request $request)
    {
        // 1. Check Max Staff Limit
        $tenant = tenant();
        $planSlug = $tenant->plan ?? 'free';

        $plan = \Stancl\Tenancy\Facades\Tenancy::central(function () use ($planSlug) {
            return \App\Models\SubscriptionPlan::where('slug', $planSlug)->first();
        });

        if ($plan && $plan->max_staff !== null) {
            $count = StaffProfile::count();
            
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
            'email' => 'required|email|unique:staff_profiles',
            'role' => 'required|in:manager,waiter,chef,cashier,accountant',
            'is_active' => 'boolean',
        ]);

        // Create the profile record
        $staff = StaffProfile::create($validated);

        // Create a functional user account for login
        $user = \App\Models\User::firstOrCreate(
            ['email' => $validated['email']],
            [
                'name' => $validated['name'],
                'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(12)),
            ]
        );

        // Assign the role (Spatie) - Dynamically ensure it exists in the tenant DB first
        $roleRecord = \Spatie\Permission\Models\Role::firstOrCreate(['name' => $validated['role'], 'guard_name' => 'web']);
        $user->syncRoles([$roleRecord]);

        // Send Staff Registration Email
        $template = \App\Models\EmailTemplate::where('slug', 'staff_registration')->first();
        if ($template) {
            $platformName = \App\Models\SaaSSetting::get('platform_name', 'Sectros');
            $businessName = tenant('business_name') ?? 'Your Business';
            $loginUrl = 'https://' . (tenant('id') ? tenant('id') . '.' : '') . (config('tenancy.central_domains')[0] ?? 'sectros.com') . '/login';

            try {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SystemMail($template->subject, $template->content, [
                    'name' => $user->name,
                    'business_name' => $businessName,
                    'platform_name' => $platformName,
                    'login_url' => $loginUrl,
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
