<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SuperAdmin\AdminUserController;
use App\Http\Controllers\Api\SuperAdmin\SaaSController;
use App\Http\Controllers\Api\SuperAdmin\SaaSCMSAdminController;
use App\Http\Controllers\Api\SuperAdmin\TranslationController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\ProvisioningController;

// Public Branding & Tenant Lookup
Route::get('/public/branding', [SaaSController::class, 'getPublicBranding']);
Route::get('/public/tenant-by-domain/{domain}', [SaaSController::class, 'getTenantByDomain']);
Route::get('/public/theme', [SaaSController::class, 'getPublicTheme']);

// Public Auth
Route::prefix('saas')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/login/verify-2fa', [AuthController::class, 'verify2FA']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
    // Public Pricing Plans
    Route::get('/plans', [SaaSController::class, 'getSubscriptionPlans']);
});

// User Profile (Central)
Route::get('/user', function (Request $request) {
    $user = $request->user();
    $tenant = \App\Models\Tenant::find($user->tenant_id);
    $plan = $tenant ? \App\Models\SubscriptionPlan::where('slug', $tenant->plan)->first() : null;
    $platformName = \App\Models\SaaSSetting::where('key', 'platform_name')->value('value') ?? 'Sectros';
    
    return array_merge($user->toArray(), [
        'plan' => $tenant?->plan ?? 'free',
        'features' => array_merge(
            $plan ? $plan->features : [],
            $tenant->features ?? []
        ),
        'platform_name' => $platformName,
        'role' => $user->role ?? 'admin',
    ]);
})->middleware('auth:sanctum');

// SaaS Super Admin
Route::middleware(['auth:sanctum', 'throttle:120,1'])->prefix('saas')->group(function () {
    // Admin Management
    Route::get('/admins', [AdminUserController::class, 'index']);
    Route::post('/admins', [AdminUserController::class, 'store']);
    Route::put('/admins/{id}', [AdminUserController::class, 'update']);
    Route::patch('/admins/{id}/2fa', [AdminUserController::class, 'toggle2FA']);
    Route::delete('/admins/{id}', [AdminUserController::class, 'destroy']);
    
    // Tenant Management
    Route::get('/tenants', [SaaSController::class, 'getTenants']);
    Route::post('/tenants', [SaaSController::class, 'storeTenant']);
    Route::post('/tenants/bulk-delete', [SaaSController::class, 'bulkDeleteTenants']);
    Route::post('/tenants/bulk-export', [SaaSController::class, 'exportTenantsCsv']);
    Route::patch('/tenants/{id}/status', [SaaSController::class, 'updateTenantStatus']);
    Route::patch('/tenants/{id}', [SaaSController::class, 'updateTenant']);
    Route::get('/tenants/{id}/staff', [SaaSController::class, 'getTenantStaff']);
    Route::patch('/tenants/{id}/staff/{userId}/2fa', [SaaSController::class, 'toggleTenantUser2FA']);
    Route::post('/tenants/{id}/impersonate', [SaaSController::class, 'impersonate']);
    Route::delete('/tenants/{id}', [SaaSController::class, 'destroyTenant']);
    Route::get('/provisioning/{tenant}/status', [ProvisioningController::class, 'status']);
    Route::post('/provisioning/full', [ProvisioningController::class, 'fullProvision']);
    Route::get('/tenants/{id}/themes', [SaaSController::class, 'getTenantThemes']);
    Route::post('/tenants/{id}/themes/unlock', [SaaSController::class, 'unlockTenantTheme']);
    Route::delete('/tenants/{id}/themes/{theme_id}', [SaaSController::class, 'revokeTenantTheme']);
    Route::post('/tenants/{id}/send-welcome', [SaaSController::class, 'sendWelcomeEmail']);
    Route::post('/tenants/{id}/staff/{userId}/reset-credentials', [SaaSController::class, 'resetStaffCredentials']);
    
    // Stats & Health
    Route::get('/stats', [SaaSController::class, 'getDashboardStats']);
    Route::get('/health', [SaaSController::class, 'getSystemHealth']);
    Route::get('/tickets', [SaaSController::class, 'getSupportTickets']);
    
    // Subscription Plans (Management)
    Route::post('/plans', [SaaSController::class, 'storeSubscriptionPlan']);
    Route::delete('/plans/{id}', [SaaSController::class, 'destroySubscriptionPlan']);

    // Add-ons Management
    Route::get('/addons', [\App\Http\Controllers\Api\SuperAdmin\SaaSAddonController::class, 'index']);
    Route::post('/addons', [\App\Http\Controllers\Api\SuperAdmin\SaaSAddonController::class, 'store']);
    Route::put('/addons/{id}', [\App\Http\Controllers\Api\SuperAdmin\SaaSAddonController::class, 'update']);
    Route::delete('/addons/{id}', [\App\Http\Controllers\Api\SuperAdmin\SaaSAddonController::class, 'destroy']);
    Route::get('/tenants/{id}/addons', [\App\Http\Controllers\Api\SuperAdmin\SaaSAddonController::class, 'tenantAddons']);
    Route::post('/tenants/{id}/addons', [\App\Http\Controllers\Api\SuperAdmin\SaaSAddonController::class, 'assignAddon']);
    Route::delete('/tenants/{id}/addons/{addonId}', [\App\Http\Controllers\Api\SuperAdmin\SaaSAddonController::class, 'revokeAddon']);
    
    // Email Templates
    Route::get('/email-templates', [SaaSController::class, 'getEmailTemplates']);
    Route::post('/email-templates', [SaaSController::class, 'storeEmailTemplate']);
    Route::delete('/email-templates/{id}', [SaaSController::class, 'destroyEmailTemplate']);
    
    // Settings
    Route::get('/settings', [SaaSController::class, 'getSettings']);
    Route::post('/settings', [SaaSController::class, 'updateSettings']);
    Route::post('/settings/upload-branding', [SaaSController::class, 'uploadBranding']);
    Route::post('/settings/test-email', [SaaSController::class, 'testEmail']);
    Route::post('/settings/test-ai', [SaaSController::class, 'testAi']);
    
    // CMS Management
        Route::prefix('cms')->group(function () {
            Route::get('/blogs', [SaaSCMSAdminController::class, 'blogs']);
            Route::post('/blogs', [SaaSCMSAdminController::class, 'storeBlog']);
            Route::get('/stories', [SaaSCMSAdminController::class, 'stories']);
            Route::get('/docs', [SaaSCMSAdminController::class, 'docs']);
            
            // Website Themes (Admin CRUD)
            Route::get('/themes', [\App\Http\Controllers\Api\SuperAdmin\SaaSThemeAdminController::class, 'index']);
            Route::get('/themes/{id}', [\App\Http\Controllers\Api\SuperAdmin\SaaSThemeAdminController::class, 'show']);
            Route::post('/themes', [\App\Http\Controllers\Api\SuperAdmin\SaaSThemeAdminController::class, 'store']);
            Route::put('/themes/{id}', [\App\Http\Controllers\Api\SuperAdmin\SaaSThemeAdminController::class, 'update']);
            Route::delete('/themes/{id}', [\App\Http\Controllers\Api\SuperAdmin\SaaSThemeAdminController::class, 'destroy']);
        });

    // Translation Management
    Route::get('/translations', [TranslationController::class, 'index']);
    Route::post('/translations', [TranslationController::class, 'store']);
    Route::put('/translations/{id}', [TranslationController::class, 'update']);
    Route::delete('/translations/{id}', [TranslationController::class, 'destroy']);

    // Contact Leads Management
    Route::get('/contact-leads', [\App\Http\Controllers\Api\ContactLeadController::class, 'index']);
    Route::patch('/contact-leads/{lead}', [\App\Http\Controllers\Api\ContactLeadController::class, 'update']);

# Move out of prefix group
});

// Aliased route for Website Builder consistency (matches tenant-api path)
Route::get('/website-themes/{id}', [\App\Http\Controllers\Api\SuperAdmin\SaaSThemeAdminController::class, 'show'])->middleware('auth:sanctum');

// Central Website Builder (for platform site or testing)
Route::middleware(['auth:sanctum'])->prefix('builder')->group(function () {
    Route::get('/', [\App\Http\Controllers\BuilderController::class, 'index']);
    Route::get('/load/{slug?}', [\App\Http\Controllers\BuilderController::class, 'load']);
    Route::post('/save/{slug?}', [\App\Http\Controllers\BuilderController::class, 'save']);
    Route::post('/publish/{slug?}', [\App\Http\Controllers\BuilderController::class, 'publish']);
    Route::post('/unpublish/{slug}', [\App\Http\Controllers\BuilderController::class, 'unpublish']);
    Route::delete('/{slug}', [\App\Http\Controllers\BuilderController::class, 'destroy']);
});

// Profile Management (Central) - Keep it consistent with /api/profile
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'index']);
    Route::post('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
    Route::post('/profile/password', [\App\Http\Controllers\Api\ProfileController::class, 'updatePassword']);
    Route::post('/profile/email-otp', [\App\Http\Controllers\Api\ProfileController::class, 'sendEmailOTP']);
    Route::post('/profile/verify-email', [\App\Http\Controllers\Api\ProfileController::class, 'verifyEmailOTP']);
    Route::delete('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'destroy']);
});

// Tenants list for registration etc.
Route::post('/tenants', [TenantController::class, 'store'])->middleware('throttle:10,1');

// Public Translations & CMS (Load these in api.php if needed publically)
Route::get('/public/translations/{locale}', [TranslationController::class, 'fetch']);
