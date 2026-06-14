<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\AutomationController;
use App\Http\Controllers\Api\BrandingController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SocialiteController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\SettlementController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\TenantBlogController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\IntegrationController;
use App\Http\Controllers\Api\WaitlistController;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

// ── Helper: render a published builder page ──────────────────────────────
if (!function_exists('renderPublicPage')) {
    function renderPublicPage($page)
    {
        $tenant = tenant();
        $html   = $page->html_content;
        $css    = $page->css_content;

        $html = str_replace('{{restaurant_name}}', $tenant->name ?? 'Restaurant', $html);
        $html = str_replace('{{establishment_year}}', $tenant->establishment_year ?? date('Y'), $html);
        $html = str_replace('[[BUSINESS_PHONE]]', $tenant->data['phone'] ?? '(555) 000-0000', $html);
        $html = str_replace('[[BUSINESS_ADDRESS]]', $tenant->data['address'] ?? 'Street Address', $html);

        if (str_contains($html, '[[DYNAMIC_MENU]]')) {
            $categories = \App\Models\MenuCategory::with('items')->orderBy('order_index')->get();
            $menuHtml   = '<div class="space-y-12">';
            foreach ($categories as $cat) {
                $menuHtml .= "<div><h3 class='text-2xl font-black uppercase tracking-widest text-[#E8730C] border-b-2 border-[#E8730C] pb-2 mb-6'>{$cat->name}</h3>";
                $menuHtml .= "<div class='grid grid-cols-1 md:grid-cols-2 gap-8'>";
                foreach ($cat->items as $item) {
                    $menuHtml .= "
                    <div class='flex justify-between items-start gap-4'>
                        <div class='flex-1'>
                            <p class='font-bold text-lg text-white'>{$item->name}</p>
                            <p class='text-xs text-stone-400 mt-1'>{$item->description}</p>
                        </div>
                        <p class='font-black text-[#E8730C]'>$" . number_format($item->price, 2) . "</p>
                    </div>";
                }
                $menuHtml .= "</div></div>";
            }
            $menuHtml .= '</div>';
            $html = str_replace('[[DYNAMIC_MENU]]', $menuHtml, $html);
        }

        if (str_contains($html, '[[OPENING_HOURS]]')) {
            $hours    = \App\Models\TenantSetting::where('key', 'service_hours')->first()?->value ?? [];
            $hoursHtml = "<table class='w-full text-sm text-stone-400 font-medium'>";
            if (is_array($hours)) {
                foreach ($hours as $day => $h) {
                    $hoursHtml .= "<tr class='border-b border-stone-800'><td class='py-2 font-bold uppercase'>{$day}</td><td class='py-2 text-right'>" . (is_string($h) ? htmlspecialchars($h) : '') . "</td></tr>";
                }
            } else {
                $hoursHtml .= "<tr><td class='py-4 text-center'>Mon - Sun: 11:00 AM - 10:00 PM</td></tr>";
            }
            $hoursHtml .= "</table>";
            $html = str_replace('[[OPENING_HOURS]]', $hoursHtml, $html);
        }

        $globalWidgets = "
        <div id='newsletter-popup' class='fixed inset-0 z-[9999] items-center justify-center p-6 bg-black/80 backdrop-blur-sm hidden'>
            <div class='bg-[#111] border border-stone-800 p-8 md:p-12 rounded-[2rem] max-w-lg w-full relative shadow-2xl'>
                <button onclick='closeNewsletter()' class='absolute top-6 right-6 text-stone-500 hover:text-white'>
                    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M18 6L6 18M6 6l12 12'></path></svg>
                </button>
                <div class='text-center space-y-4'>
                    <h3 class='text-3xl font-black text-white italic uppercase tracking-tighter'>Exclusive Access</h3>
                    <p class='text-stone-400 font-medium'>Join our inner circle for secret menus and 15% off your first reservation.</p>
                    <form id='newsletter-form' class='pt-6 space-y-4'>
                        <input type='email' required placeholder='Enter your email address' class='w-full bg-stone-900 border border-stone-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[#E8730C]' />
                        <button type='submit' class='w-full bg-[#E8730C] hover:bg-[#ff8c2b] text-white font-black uppercase tracking-widest py-4 rounded-xl'>Join the Club</button>
                    </form>
                    <p id='newsletter-status' class='text-[10px] text-stone-600 font-bold uppercase tracking-widest pt-4 hidden'>Thank you! You're on the list.</p>
                </div>
            </div>
        </div>
        <div class='fixed bottom-8 right-8 z-[9990] flex flex-col gap-3'>
            <button onclick='window.scrollTo({top: 0, behavior: \"smooth\"})' class='w-12 h-12 bg-[#111]/80 backdrop-blur-md border border-stone-800 text-white rounded-full flex items-center justify-center hover:bg-[#E8730C] hover:border-[#E8730C] transition-all shadow-xl'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M18 15l-6-6-6 6'></path></svg>
            </button>
        </div>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                if (!localStorage.getItem('newsletter_closed')) {
                    setTimeout(function() {
                        var popup = document.getElementById('newsletter-popup');
                        if (popup) popup.classList.remove('hidden');
                    }, 3000);
                }
                var nForm = document.getElementById('newsletter-form');
                if (nForm) {
                    nForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        nForm.classList.add('hidden');
                        var status = document.getElementById('newsletter-status');
                        if (status) status.classList.remove('hidden');
                        localStorage.setItem('newsletter_closed', 'true');
                        setTimeout(closeNewsletter, 2000);
                    });
                }
                var bookingForm = document.getElementById('sectros-booking-form');
                if (bookingForm) {
                    bookingForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        var submitBtn = bookingForm.querySelector('button[type=submit]');
                        var originalText = submitBtn ? submitBtn.innerHTML : '';
                        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Processing...'; }
                        var formData = new FormData(bookingForm);
                        var data = Object.fromEntries(formData.entries());
                        fetch('/tenant-api/public/reservations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                            body: JSON.stringify(data)
                        }).then(function(r) { return r.json(); }).then(function(res) {
                            if (res.success) {
                                bookingForm.innerHTML = '<div style=\"text-align:center;padding:2rem;color:#10b981;\"><h3>Reservation Confirmed!</h3><p>See you soon!</p></div>';
                            } else {
                                alert(res.message || 'Error.');
                                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalText; }
                            }
                        });
                    });
                }
            });
            function closeNewsletter() {
                var popup = document.getElementById('newsletter-popup');
                if (popup) popup.classList.add('hidden');
                localStorage.setItem('newsletter_closed', 'true');
            }
        </script>";

        return response(
            "<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>{$page->title} — " . ($tenant->name ?? 'Restaurant') . "</title>
    <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap\" rel=\"stylesheet\">
    <script src=\"https://cdn.tailwindcss.com\"></script>
    <style>body { font-family: 'Inter', sans-serif; scroll-behavior: smooth; } {$css}</style>
</head>
<body>
    {$html}
    {$globalWidgets}
</body>
</html>"
        )->header('Cache-Control', 'no-cache, no-store, must-revalidate')
         ->header('Pragma', 'no-cache')
         ->header('Expires', '0');
    }
}

// ── All Tenant Routes ─────────────────────────────────────────────────────

// ── Tenant API Routes ─────────────────────────────────────────────────
// Prefix is set in bootstrap/app.php (used under both central-api and tenant-api)
Route::middleware(['api'])->group(function () {

        // Public endpoints (no auth required)
        Route::post('/public/reservations', [\App\Http\Controllers\PublicReservationController::class, 'store'])->middleware('throttle:10,1');
        Route::get('/public/translations/{locale}', [\App\Http\Controllers\Api\SuperAdmin\TranslationController::class, 'fetch']);

        // Payments (Deposits)
        Route::post('/public/payments/create-checkout', [\App\Http\Controllers\Api\TenantPaymentController::class, 'createCheckoutSession']);
        Route::get('/public/payments/verify', [\App\Http\Controllers\Api\TenantPaymentController::class, 'verifyPayment']);

        Route::middleware('throttle:6,1')->group(function () {
            Route::post('/login', [AuthController::class, 'login']);
            Route::post('/login/token', [AuthController::class, 'loginWithToken']);
            Route::post('/login/verify-2fa', [AuthController::class, 'verify2FA']);
            Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
            Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        });

        Route::get('/auth/facebook', [SocialiteController::class, 'redirectToFacebook']);
        Route::get('/auth/facebook/callback', [SocialiteController::class, 'handleFacebookCallback']);

        // Billing
        Route::prefix('billing')->group(function () {
            Route::get('/plans', [\App\Http\Controllers\Api\SubscriptionController::class, 'getPlans']);

            Route::middleware('auth:sanctum')->group(function () {
                Route::get('/status', [\App\Http\Controllers\Api\SubscriptionController::class, 'currentStatus']);
                Route::post('/subscribe', [\App\Http\Controllers\Api\SubscriptionController::class, 'subscribe']);
                Route::post('/purchase-credits', [\App\Http\Controllers\Api\SubscriptionController::class, 'purchaseCredits']);
            });
        });

        // Add-ons
        Route::prefix('addons')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\AddonController::class, 'index']);

            Route::middleware('auth:sanctum')->group(function () {
                Route::get('/active', [\App\Http\Controllers\Api\AddonController::class, 'active']);
                Route::post('/{addonId}/purchase', [\App\Http\Controllers\Api\AddonController::class, 'purchase']);
                Route::post('/{addonId}/cancel', [\App\Http\Controllers\Api\AddonController::class, 'cancel']);
            });
        });

        // Protected routes
        Route::middleware('auth:sanctum')->group(function () {

            Route::get('/user', function (\Illuminate\Http\Request $request) {
                $user   = $request->user();
                $tenant = tenant();

                // Get plan info from platform connection
                $plan = $tenant ? \App\Models\SubscriptionPlan::on('platform')->where('slug', $tenant->plan)->first() : null;

                // Determine Role
                $rawRole = $user->role ?? ($user->roles->first()?->name);
                if (!$rawRole) {
                    $rawRole = (strtolower($user->email) === strtolower($tenant->owner_email ?? ''))
                        ? 'owner'
                        : 'staff';
                }
                $normalizedRole = ($rawRole === 'restaurant_owner' || $rawRole === 'owner') ? 'owner' : $rawRole;

                $platformName = \App\Models\SaaSSetting::on('platform')->where('key', 'platform_name')->value('value') ?? 'Sectros';

                // MERGE FEATURES: User settings > Tenant settings > Plan defaults
                $planFeatures = (array) ($plan?->features ?? []);
                $tenantFeatures = (array) ($tenant->features ?? []);
                $userFeatures = (array) ($user->features ?? []);

                $mergedFeatures = array_merge($planFeatures, $tenantFeatures, $userFeatures);

                return array_merge($user->toArray(), [
                    'role'          => $normalizedRole,
                    'plan'          => $tenant->plan ?? 'free',
                    'business_type' => $tenant->business_type ?? 'restaurant',
                    'features'      => array_keys(array_filter($mergedFeatures)),
                    'platform_name' => $platformName,
                ]);
            });

            Route::get('/menu', [MenuController::class, 'index']);
            Route::post('/menu/categories', [MenuController::class, 'storeCategory']);
            Route::put('/menu/categories/{id}', [MenuController::class, 'updateCategory']);
            Route::delete('/menu/categories/{id}', [MenuController::class, 'destroyCategory']);
            Route::post('/menu/items', [MenuController::class, 'storeItem']);
            Route::put('/menu/items/{id}', [MenuController::class, 'updateItem']);
            Route::delete('/menu/items/{id}', [MenuController::class, 'destroyItem']);

            Route::get('/tables', [TableController::class, 'index']);
            Route::post('/tables', [TableController::class, 'store']);
            Route::patch('/tables/{table}/status', [TableController::class, 'updateStatus']);

            Route::prefix('stats')->group(function () {
                Route::get('/', [DashboardController::class, 'stats']);
                Route::get('/comparison', [DashboardController::class, 'comparison']);
            });
            Route::get('/staff', [StaffController::class, 'index']);
            Route::post('/staff', [StaffController::class, 'store']);
            Route::put('/staff/{id}', [StaffController::class, 'update']);
            Route::delete('/staff/{id}', [StaffController::class, 'destroy']);

            Route::apiResource('/reviews', ReviewController::class);
            Route::apiResource('/gallery', GalleryController::class);
            Route::apiResource('/rooms', RoomController::class);
            Route::apiResource('/services', ServiceController::class);
            Route::apiResource('/blog-posts', TenantBlogController::class);
            Route::apiResource('/team-members', TeamMemberController::class);
            Route::apiResource('/inventory', InventoryController::class);
            Route::post('/inventory/{id}/adjust-stock', [InventoryController::class, 'adjustStock']);

            Route::get('/branding', [BrandingController::class, 'index']);
            Route::post('/branding', [BrandingController::class, 'update']);

            Route::apiResource('/orders', OrderController::class);
            Route::apiResource('/reservations', ReservationController::class);
            Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus']);

            Route::get('/expenses', [ExpenseController::class, 'index']);
            Route::post('/expenses', [ExpenseController::class, 'store']);

            Route::apiResource('/shifts', ShiftController::class);
            Route::apiResource('/attendance', AttendanceController::class);
            Route::apiResource('/settlements', SettlementController::class);
            Route::apiResource('/branches', BranchController::class);
            Route::apiResource('/integrations', IntegrationController::class);
            Route::apiResource('/waitlist', WaitlistController::class);
            Route::post('/waitlist/{id}/notify', [\App\Http\Controllers\Api\WaitlistController::class, 'notify']);
            Route::post('/waitlist/{id}/seat', [\App\Http\Controllers\Api\WaitlistController::class, 'seat']);
            Route::post('/waitlist/{id}/cancel', [\App\Http\Controllers\Api\WaitlistController::class, 'cancel']);

            Route::prefix('automation')->group(function () {
                Route::get('/activity', [AutomationController::class, 'getActivity']);
                Route::get('/settings', [AutomationController::class, 'getSettings']);
                Route::post('/settings', [AutomationController::class, 'updateSettings']);
                Route::patch('/social-links', [AutomationController::class, 'updateSocialLinks']);
                Route::post('/social/webhook', [AutomationController::class, 'handleSocialWebhook']);
                Route::post('/interactions/{id}/reply', [AutomationController::class, 'postReply']);
                Route::post('/scan-receipt', [AutomationController::class, 'scanReceipt']);
            });

            Route::get('/dashboard/stats', [\App\Http\Controllers\Api\DashboardController::class, 'stats']);

            Route::prefix('builder')->group(function () {
                Route::get('/', [\App\Http\Controllers\BuilderController::class, 'index']);
                Route::get('/load/{slug?}', [\App\Http\Controllers\BuilderController::class, 'load']);
                Route::post('/save/{slug?}', [\App\Http\Controllers\BuilderController::class, 'save']);
                Route::post('/publish/{slug?}', [\App\Http\Controllers\BuilderController::class, 'publish']);
                Route::post('/unpublish/{slug}', [\App\Http\Controllers\BuilderController::class, 'unpublish']);
                Route::delete('/{slug}', [\App\Http\Controllers\BuilderController::class, 'destroy']);
            });

            Route::get('/navigation-menus', [\App\Http\Controllers\Api\NavigationMenuController::class, 'index']);
            Route::post('/navigation-menus', [\App\Http\Controllers\Api\NavigationMenuController::class, 'store']);
            Route::match(['put', 'patch'], '/navigation-menus/{id}', [\App\Http\Controllers\Api\NavigationMenuController::class, 'update']);
            Route::delete('/navigation-menus/{id}', [\App\Http\Controllers\Api\NavigationMenuController::class, 'destroy']);

            Route::prefix('website-themes')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\PublicThemeController::class, 'index']);
                Route::get('/{id}', [\App\Http\Controllers\Api\PublicThemeController::class, 'show']);
                Route::post('/{id}/purchase', [\App\Http\Controllers\Api\PublicThemeController::class, 'purchase']);
            });

            Route::get('/notifications', [NotificationController::class, 'index']);
            Route::post('/notifications/settings', [NotificationController::class, 'updateSettings']);
            Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
            Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

            Route::get('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'index']);
            Route::post('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
            Route::post('/profile/password', [\App\Http\Controllers\Api\ProfileController::class, 'updatePassword']);
            Route::post('/profile/2fa', [\App\Http\Controllers\Api\ProfileController::class, 'update2faMethod']);

            Route::patch('/staff/{id}/2fa', [StaffController::class, 'toggle2FA']);

            Route::post('/logout', [AuthController::class, 'logout']);

        }); // end auth:sanctum

    }); // end tenant-api prefix

    // Serve React SPA Dashboard & Builder on tenant subdomains
    Route::get('/dashboard/{any?}', function () {
        return Response::make(file_get_contents(public_path('index.html')), 200, [
            'Content-Type' => 'text/html',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    })->where('any', '.*');

    Route::get('/builder/{any?}', function () {
        return Response::make(file_get_contents(public_path('index.html')), 200, [
            'Content-Type' => 'text/html',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    })->where('any', '.*');

    // Public website root
    Route::get('/', function () {
        $page = \App\Models\BuilderPage::where('slug', 'home')->first();
        if ($page && $page->is_published) {
            return renderPublicPage($page);
        }
        return response(
            "<div style='font-family: sans-serif; text-align: center; margin-top: 20%; color: #555;'>
                <h2 style='font-size: 28px; color: #111;'>" . (tenant('name') ?? 'This Restaurant') . "</h2>
                <p>Website is currently under construction. Check back soon!</p>
            </div>"
        )->header('Cache-Control', 'no-cache, no-store, must-revalidate')
         ->header('Pragma', 'no-cache')
         ->header('Expires', '0');
    });

    // Multi-page: serve any published page by slug
    Route::get('/{slug}', function ($slug) {
        $page = \App\Models\BuilderPage::where('slug', $slug)->where('is_published', true)->first();
        if (!$page) {
            abort(404, 'Page not found');
        }
        return renderPublicPage($page);
    })->where('slug', '[a-z0-9\-]+');

