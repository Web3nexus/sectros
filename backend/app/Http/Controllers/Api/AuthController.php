<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;

class AuthController extends Controller
{
    /**
     * Authenticate a tenant user (Business Owner or Staff).
     */
    public function login(Request $request)
    {
        try {
            \Illuminate\Support\Facades\Log::info('DEBUG: Login attempt started', [
                'email' => $request->email,
                'path' => $request->path(),
                'method' => $request->method(),
            ]);

            $request->validate([
                'email'    => 'required|email',
                'password' => 'required',
            ]);

            // 1. Identify if this is an Admin (SaaS) login attempt.
            $isAdminPath = $request->is('central-api/saas/*') || 
                           $request->is('*/saas/*') || 
                           str_contains($request->path(), 'saas/');

            $adminUser = null;
            $tenantUser = null;
            $tenantRecord = null;

            if ($isAdminPath) {
                $adminUser = \App\Models\Admin::where('email', $request->email)->first();
            } else {
                $isAdminEmail = \App\Models\Admin::where('email', $request->email)->exists();
                if ($isAdminEmail) {
                    $adminUser = \App\Models\Admin::where('email', $request->email)->first();
                } else {
                    $tenantUser = User::on('tenant')->where('email', $request->email)->first();
                    if ($tenantUser) {
                        $tenantRecord = Tenant::on('platform')->find($tenantUser->tenant_id);
                    }
                }
            }

            // Validate password for the identified user
            $validAdmin = $adminUser && Hash::check($request->password, $adminUser->password);
            $validTenant = $tenantUser && $tenantRecord && Hash::check($request->password, $tenantUser->password);

            if (!$validAdmin && !$validTenant) {
                return response()->json(['message' => 'The provided credentials are incorrect.'], 401);
            }

            if ($validAdmin) {
                $twoFactorMethod = $adminUser->two_factor_method ?: 'none';
                if ($twoFactorMethod !== 'none') {
                    return $this->sendTwoFactorCode($adminUser, $twoFactorMethod);
                }
                return $this->issueToken($adminUser);
            }

            // Tenant user flow
            $user = $tenantUser;
            $tenant = $tenantRecord;

            $authData = [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'two_factor_method' => $user->two_factor_method ?: 'none',
                'array_data' => $user->toArray(),
            ];

            // Check 2FA preference
            $twoFactorMethod = $authData['two_factor_method'];
            if ($twoFactorMethod !== 'none') {
                \Illuminate\Support\Facades\Log::info('DEBUG: Tenant user requires 2FA', ['email' => $request->email, 'method' => $twoFactorMethod]);
                if ($twoFactorMethod === 'email') {
                    $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                    User::on('tenant')->where('id', $authData['id'])->update([
                        'two_factor_code' => $code,
                        'two_factor_expires_at' => now()->addMinutes(10),
                    ]);

                    try {
                        $platformName = \App\Models\SaaSSetting::get('platform_name', config('app.name'));
                        \Illuminate\Support\Facades\Mail::to($authData['email'])->send(new \App\Mail\SystemMail(
                            'Your Security Code',
                            'Your security verification code is: {code}',
                            ['name' => $authData['name'], 'code' => $code, 'platform_name' => $platformName]
                        ));
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error("DEBUG: Failed to send 2FA email: " . $e->getMessage());
                    }
                }

                return response()->json([
                    'requires_2fa' => true,
                    'method'       => $twoFactorMethod,
                    'email'        => $authData['email'],
                ]);
            }

            \Illuminate\Support\Facades\Log::info('DEBUG: Tenant user authenticated successfully', ['email' => $request->email]);
            
            // Issue token
            $token = $user->createToken('auth-token')->plainTextToken;

            $tenantDomain = $tenant->domains()->first()?->domain;

            return response()->json([
                'token'         => $token,
                'user'          => $authData['array_data'],
                'tenant_domain' => $tenantDomain,
                'business_type' => $tenant->business_type ?? 'restaurant',
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('DEBUG: Critical login failure', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'An internal error occurred during login.'], 500);
        }
    }


    /**
     * Register a new tenant owner and verify Turnstile CAPTCHA.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'business_name' => 'required|string|max:255',
            'business_type' => 'required|string|in:restaurant,cafe,salon,hotel',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'country' => 'required|string|size:2',
            'turnstile_token' => 'nullable|string'
        ]);

        // Verify Turnstile Token if not mobile bypass
        if (($validated['turnstile_token'] ?? '') !== 'mobile_bypass') {
            if (empty($validated['turnstile_token'])) {
                return response()->json(['message' => 'CAPTCHA validation required.'], 400);
            }
            $turnstileSecret = \App\Models\SaaSSetting::get('turnstile_secret_key')
                ?: env('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA');
            
            \Illuminate\Support\Facades\Log::info('Registration: Starting Turnstile Verification');
            $response = \Illuminate\Support\Facades\Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret' => $turnstileSecret,
                'response' => $validated['turnstile_token'],
                'remoteip' => $request->ip()
            ]);

            if (!$response->json('success')) {
                return response()->json(['message' => 'CAPTCHA validation failed. Please try again.'], 400);
            }
        }

        // Check if email is already registered as a tenant owner
        if (Tenant::where('owner_email', $validated['email'])->exists()) {
            return response()->json(['message' => 'This email is already registered with a business.'], 422);
        }

        try {
            // Generate a unique tenant ID based on business name
            $tenantId = \Illuminate\Support\Str::slug($validated['business_name']);
            if (Tenant::where('id', $tenantId)->exists()) {
                $tenantId = $tenantId . '-' . rand(1000, 9999);
            }

            \Illuminate\Support\Facades\Log::info('Registration: Starting Phase 1 (Tenant Creation)');
            // Phase 1: Create Tenant
            try {
                $tenant = Tenant::create([
                    'id' => $tenantId,
                    'business_name' => $validated['business_name'],
                    'business_type' => $validated['business_type'],
                    'plan' => 'free',
                    'owner_email' => $validated['email'],
                    'owner_name' => $validated['name'],
                    'country' => $validated['country'],
                    'status' => 'active',
                    'data' => [
                        'status' => 'active',
                        'owner_name' => $validated['name'],
                        'owner_email' => $validated['email'],
                        'business_type' => $validated['business_type'],
                    ]
                ]);
            } catch (\Exception $e) {
                return response()->json(['message' => 'Registration failed at Phase 1 (Tenant Creation): ' . $e->getMessage()], 500);
            }

            \Illuminate\Support\Facades\Log::info('Registration: Starting Phase 2 (Domain Creation)');
            // Phase 2: Create Domain
            try {
                $centralDomain = config('tenancy.central_domains')[0] ?? 'localhost';
                $tenant->domains()->create(['domain' => $tenantId . '.' . $centralDomain]);
            } catch (\Exception $e) {
                return response()->json(['message' => 'Registration failed at Phase 2 (Domain Creation): ' . $e->getMessage()], 500);
            }

            \Illuminate\Support\Facades\Log::info('Registration: Starting Phase 3 (User Creation)');
            // Phase 3: Create User (shared tenant connection)
            try {
                $user = User::on('tenant')->create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
                    'role' => 'owner',
                    'tenant_id' => $tenant->id,
                ]);
                $userData = $user->toArray();
            } catch (\Exception $e) {
                return response()->json(['message' => 'Registration failed at Phase 3 (User Creation): ' . $e->getMessage()], 500);
            }

            \Illuminate\Support\Facades\Log::info('Registration: Starting Phase 4 (Welcome Email)');
            // Phase 4: Welcome Email
            try {
                $template = \App\Models\EmailTemplate::on('platform')->where('slug', 'welcome_email')->first();
            } catch (\Exception $e) {
                return response()->json(['message' => 'Registration failed at Phase 4 (Email Template Fetch): ' . $e->getMessage()], 500);
            }
            $subject = $template ? $template->subject : 'Welcome to ' . config('app.name');
            $content = $template ? $template->content : "Hello {name}, your account has been created successfully. Welcome to {platform_name}!";
            
            $platformName = \App\Models\SaaSSetting::get('platform_name', config('app.name'));
            
            try {
                \Illuminate\Support\Facades\Mail::to($userData['email'])->send(new \App\Mail\SystemMail($subject, $content, [
                    'name' => $userData['name'],
                    'platform_name' => $platformName,
                    'business_name' => $validated['business_name']
                ]));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send welcome email: " . $e->getMessage());
            }

            // Generate auth token for auto-login after registration
            $freshUser = \App\Models\User::on('tenant')->where('email', $userData['email'])->first();
            $authToken = $freshUser ? $freshUser->createToken('auth-token')->plainTextToken : null;

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'tenant_id' => $tenant->id,
                'domain' => $tenant->domains()->first()->domain,
                'token' => $authToken,
                'user' => $userData
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Registration Error', [
                'message' => $e->getMessage(),
            ]);
            if (isset($tenant) && $tenant) {
                try {
                    $tenant->delete();
                } catch (\Exception $deleteEx) {
                    \Illuminate\Support\Facades\Log::error("Failed to delete partially created tenant: " . $deleteEx->getMessage());
                }
            }
            return response()->json([
                'message' => 'Registration failed due to an internal error.',
            ], 500);
        }
    }

    /**
     * Auto-login using a pre-issued Sanctum token (for impersonation handoff).
     */
    public function loginWithToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'domain' => 'nullable|string'
        ]);

        if ($request->domain && !\App\Services\TenantResolver::resolve()) {
            $tenant = \App\Models\Tenant::whereHas('domains', function ($query) use ($request) {
                $query->where('domain', $request->domain);
            })->first();

            if ($tenant) {
                \App\Services\TenantResolver::set($tenant);
            }
        }

        // personal_access_tokens is ALWAYS in the central database.
        // When on a tenant subdomain, tenancy switches the default DB connection.
        // We cannot use ::on('mysql')->findToken() as ::on() returns a Builder, not the model.
        // Sanctum stores tokens as: token_id|plaintext_token in the DB the hash is sha256(plaintext)
        $parts = explode('|', $request->token, 2);
        if (count($parts) !== 2) {
            return response()->json(['message' => 'Invalid token format.'], 401);
        }
        [$tokenId, $plaintext] = $parts;

        // Try current connection first (tenant-aware)
        $tokenRow = \Illuminate\Support\Facades\DB::table('personal_access_tokens')
            ->where('id', $tokenId)
            ->first();

        // Fallback to central if not found (e.g. for central-to-central impersonation)
        if (!$tokenRow) {
            $tokenRow = \Illuminate\Support\Facades\DB::connection('mysql')
                ->table('personal_access_tokens')
                ->where('id', $tokenId)
                ->first();
        }

        if (!$tokenRow) {
            return response()->json(['message' => 'Invalid or expired token.'], 401);
        }

        // Verify hash matches
        if (!hash_equals($tokenRow->token, hash('sha256', $plaintext))) {
            return response()->json(['message' => 'Invalid or expired token.'], 401);
        }

        // Check expiry
        if ($tokenRow->expires_at && now()->isAfter($tokenRow->expires_at)) {
            return response()->json(['message' => 'Token has expired.'], 401);
        }

        $userId    = $tokenRow->tokenable_id;
        $userClass = $tokenRow->tokenable_type;
        $user      = $userClass::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        // The tenant context is already active via InitializeTenancyByDomain middleware
        // Use tenant() helper to get current tenant and determine role accurately
        $currentTenant = tenant();
        $isOwner = $currentTenant && $user->email === $currentTenant->owner_email;

        // Get plan info from the central DB (Tenant model lives there)
        $plan = $currentTenant ? SubscriptionPlan::where('slug', $currentTenant->plan)->first() : null;

        return response()->json([
            'message' => 'Login successful',
            'token'   => $request->token,
            'user'    => [
                'id'        => $user->id,
                'name'      => $user->name,
                'email'     => $user->email,
                'role'      => ($isOwner || $user->role === 'restaurant_owner' || $user->role === 'owner') ? 'owner' : ($user->role ?? ($user->roles?->first()?->name ?? 'staff')),
                'is_owner'  => $isOwner,
                'tenant_id' => $currentTenant?->id,
                'plan'      => $currentTenant?->plan ?? 'free',
                'features'  => array_values(array_keys(array_filter((array) ($user->features ?? ($currentTenant?->features ?? ($plan?->features ?? ['insights' => true, 'reservations' => true])))))),
            ],
        ]);
    }

    /**
     * Issue Sanctum token and return user data.
     */
    protected function issueToken($user)
    {
        // Detect admin context: Admin model class OR saas/central-api path
        $isAdmin = ($user instanceof \App\Models\Admin)
            || request()->is('central-api/*')
            || str_contains(request()->path(), 'saas/');

        if ($isAdmin) {
            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json([
                'message' => 'Login successful',
                'token'   => $token,
                'user'    => [
                    'id'        => $user->id,
                    'name'      => $user->name,
                    'email'     => $user->email,
                    'role'      => 'admin',
                ],
            ]);
        }

        $tenant = Tenant::on('platform')->find($user->tenant_id);
        $plan = $tenant ? SubscriptionPlan::on('platform')->where('slug', $tenant->plan)->first() : null;

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'tenant_domain' => $tenant ? $tenant->domains->first()?->domain : null,
            'user'    => [
                'id'        => $user->id,
                'name'      => $user->name,
                'email'     => $user->email,
                'role'      => ($user->role === 'restaurant_owner' || $user->role === 'owner') ? 'owner' : ($user->role ?? 'staff'),
                'is_owner'  => ($user->role === 'restaurant_owner' || $user->role === 'owner'),
                'tenant_id' => $user->tenant_id,
                'plan'      => $tenant?->plan ?? 'free',
                'features'  => array_values(array_keys(array_filter((array) ($user->features ?? ($tenant->features ?? ($plan->features ?? ['insights' => true, 'reservations' => true])))))),
                'business_type' => $tenant?->business_type ?? 'restaurant',
            ],
        ]);
    }

    /**
     * Verify any 2FA method (Email Code, TOTP, or PIN).
     */
    public function verify2FA(Request $request)
    {
        $request->validate([
            'email'  => 'required|email',
            'code'   => 'required|string',
            'method' => 'required|in:email,totp,pin',
        ]);

        if ($request->is('central-api/*')) {
            $user = \App\Models\Admin::on('platform')->where('email', $request->email)->firstOrFail();
        } else {
            $user = User::on('tenant')->where('email', $request->email)->firstOrFail();
        }

        if ($request->method === 'email') {
            if ($user->two_factor_code !== $request->code || now()->greaterThan($user->two_factor_expires_at)) {
                return response()->json(['message' => 'Invalid or expired verification code.'], 401);
            }
        } elseif ($request->method === 'totp') {
            $google2fa = new \PragmaRX\Google2FA\Google2FA();
            $valid = $google2fa->verifyKey($user->two_factor_secret, $request->code);
            if (!$valid) {
                 return response()->json(['message' => 'Invalid Google Authenticator code.'], 401);
            }
        } elseif ($request->method === 'pin') {
            if (!Hash::check($request->code, $user->login_pin)) {
                return response()->json(['message' => 'Invalid PIN.'], 401);
            }
        }

        // Clear temporary code
        $user->update([
            'two_factor_code' => null,
            'two_factor_expires_at' => null,
        ]);

        return $this->issueToken($user);
    }

    /**
     * Stateless logout.
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }
        
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Send a password reset link to the user.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        if ($request->is('central-api/*')) {
            $user = \App\Models\Admin::where('email', $request->email)->first();
            $connection = 'mysql';
        } else {
            $user = User::where('email', $request->email)->first();
            $connection = config('database.default');
        }

        if (!$user) {
            // We return success to avoid email enumeration
            return response()->json(['message' => 'If your email is in our system, you will receive a reset link shortly.']);
        }

        $token = \Illuminate\Support\Str::random(64);
        $hashedToken = \Illuminate\Support\Facades\Hash::make($token);

        \Illuminate\Support\Facades\DB::connection($connection)->table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => $hashedToken, 'created_at' => now()]
        );

        $template = \App\Models\EmailTemplate::where('slug', 'password_reset')->first();
        $subject = $template ? $template->subject : 'Reset Your Password';
        $content = $template ? $template->content : "Hello {name}, click the link below to reset your password: {reset_link}";

        $domain = $request->getHost();
        $protocol = $request->getScheme();
        $resetLink = "{$protocol}://{$domain}/reset-password?token={$token}&email=" . urlencode($user->email);

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SystemMail($subject, $content, [
                'name' => $user->name,
                'reset_link' => $resetLink,
                'platform_name' => \App\Models\SaaSSetting::get('platform_name', config('app.name'))
            ]));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send password reset email: " . $e->getMessage());
        }

        return response()->json(['message' => 'If your email is in our system, you will receive a reset link shortly.']);
    }

    /**
     * Reset the user's password using the provided token.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($request->is('central-api/*')) {
            $user = \App\Models\Admin::on('platform')->where('email', $request->email)->first();
            $connection = 'platform';
        } else {
            $user = User::on('tenant')->where('email', $request->email)->first();
            $connection = 'tenant';
        }

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $records = \Illuminate\Support\Facades\DB::connection($connection)->table('password_reset_tokens')
            ->where('email', $request->email)
            ->get();

        $record = $records->first(function ($r) use ($request) {
            return \Illuminate\Support\Facades\Hash::check($request->token, $r->token);
        });

        if (!$record || now()->subHours(2)->greaterThan($record->created_at)) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 400);
        }

        $user->update(['password' => Hash::make($request->password)]);

        \Illuminate\Support\Facades\DB::connection($connection)->table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json(['message' => 'Password reset successfully. You can now log in.']);
    }

    /**
     * Helper to send 2FA code and return the required response.
     */
    protected function sendTwoFactorCode($user, $method)
    {
        if ($method === 'email') {
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $user->update([
                'two_factor_code' => $code,
                'two_factor_expires_at' => now()->addMinutes(10),
            ]);

            try {
                $platformName = \App\Models\SaaSSetting::get('platform_name', config('app.name'));
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SystemMail(
                    'Your Security Code',
                    'Your security verification code is: {code}',
                    ['name' => $user->name, 'code' => $code, 'platform_name' => $platformName]
                ));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send 2FA email: " . $e->getMessage());
            }
        }

        return response()->json([
            'requires_2fa' => true,
            'method'       => $method,
            'email'        => $user->email,
        ]);
    }
}
