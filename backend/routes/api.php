<?php
use Illuminate\Support\Facades\Route;

// Diagnostic Ping
Route::get('/ping', function() { return response()->json(['message' => 'pong', 'connection' => config('database.default')]); });

// Global Webhooks — throttled to prevent abuse; Meta retries with backoff
Route::middleware('throttle:60,1')->group(function () {
    Route::post('/social/webhook', [\App\Http\Controllers\Api\CentralWebhookController::class, 'handle']);
    Route::get('/social/webhook', [\App\Http\Controllers\Api\CentralWebhookController::class, 'verify']);
});

// Central Meta OAuth (Option B - Centralized Redirector)
Route::get('/auth/facebook', [\App\Http\Controllers\Api\SocialiteController::class, 'redirectToFacebook']);
Route::get('/auth/facebook/callback', [\App\Http\Controllers\Api\SocialiteController::class, 'handleFacebookCallback']);

// Direct Meta + BSP OAuth Callback (separate endpoint for direct mode)
Route::get('/auth/direct/callback', [\App\Http\Controllers\Api\WorkspaceChannelController::class, 'handleOAuthCallback']);

// WhatsApp Embedded Signup Callback (handles Meta OAuth redirect for per-tenant WhatsApp connection)
Route::get('/whatsapp/callback', [\App\Http\Controllers\Api\TenantWhatsAppController::class, 'handleCallback']);

// Meta App Review Required Pages
Route::get('/privacy', function() {
    return response('<html><head><title>Privacy Policy</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;color:#333}h1{color:#111}h2{color:#444}</style></head><body><h1>Privacy Policy</h1><p><em>Last updated: ' . date('F d, Y') . '</em></p><h2>Information We Collect</h2><p>We collect information you provide when connecting your WhatsApp Business Account, including your business name, phone number, and message content.</p><h2>How We Use Your Information</h2><p>We use this information to enable WhatsApp messaging features within our platform, including automated replies, reservation management, and customer communication.</p><h2>Data Sharing</h2><p>We do not sell your data. Message data is processed through Meta\'s WhatsApp Cloud API and stored securely for operational purposes.</p><h2>Contact</h2><p>For inquiries: privacy@sectros.com</p></body></html>')->header('Content-Type', 'text/html');
});

Route::get('/terms', function() {
    return response('<html><head><title>Terms of Service</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;color:#333}h1{color:#111}h2{color:#444}</style></head><body><h1>Terms of Service</h1><p><em>Last updated: ' . date('F d, Y') . '</em></p><h2>Acceptance</h2><p>By using Sectros and connecting your WhatsApp Business Account, you agree to these terms.</p><h2>WhatsApp Compliance</h2><p>You must comply with Meta\'s WhatsApp Business Solution Terms and applicable laws when using WhatsApp features through our platform.</p><h2>Service Availability</h2><p>We strive for high availability but do not guarantee uninterrupted WhatsApp messaging service.</p><h2>Limitation of Liability</h2><p>We are not liable for any damages arising from the use of WhatsApp integration features.</p></body></html>')->header('Content-Type', 'text/html');
});

Route::get('/data-deletion', function() {
    return response('<html><head><title>Data Deletion</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;color:#333}h1{color:#111}</style></head><body><h1>Data Deletion Request</h1><p>To request deletion of your WhatsApp connection data, please email privacy@sectros.com with the subject "Data Deletion Request" including your business name and WhatsApp phone number.</p><p>We will process your request within 30 days and confirm once your data has been deleted.</p></body></html>')->header('Content-Type', 'text/html');
});

// Payment Webhooks
Route::post('/webhooks/stripe', [\App\Http\Controllers\Api\PaymentWebhookController::class, 'handleStripe']);
Route::post('/webhooks/paystack', [\App\Http\Controllers\Api\PaymentWebhookController::class, 'handlePaystack']);
Route::post('/webhooks/flutterwave', [\App\Http\Controllers\Api\PaymentWebhookController::class, 'handleFlutterwave']);
Route::post('/webhooks/dodo', [\App\Http\Controllers\Api\PaymentWebhookController::class, 'handleDodo']);

// Direct Meta + BSP Webhooks
Route::middleware('throttle:60,1')->group(function () {
    Route::post('/social/direct/webhook', [\App\Http\Controllers\Api\DirectWebhookController::class, 'handle']);
    Route::get('/social/direct/webhook', [\App\Http\Controllers\Api\DirectWebhookController::class, 'verify']);
    Route::post('/social/bsp/{provider}/webhook', [\App\Http\Controllers\Api\DirectWebhookController::class, 'handleBspWebhook']);
});

// AI Voice Agent Webhooks
Route::middleware('throttle:60,1')->group(function () {
    Route::post('/webhooks/voice/{providerKey}', [\App\Http\Controllers\Api\VoiceAgentWebhookController::class, 'handle']);
});

// AI Voice Agent Tool Endpoints (called by ElevenLabs during calls — authenticated via agent_token)
Route::prefix('voice-agent/tools')->group(function () {
    Route::post('/check-availability', [\App\Http\Controllers\Api\VoiceAgentToolController::class, 'checkAvailability']);
    Route::post('/create-reservation', [\App\Http\Controllers\Api\VoiceAgentToolController::class, 'createReservation']);
    Route::post('/cancel-reservation', [\App\Http\Controllers\Api\VoiceAgentToolController::class, 'cancelReservation']);
    Route::post('/transfer-to-human', [\App\Http\Controllers\Api\VoiceAgentToolController::class, 'transferToHuman']);
});

Route::get('/debug-config', function() {
    if (!config('app.debug')) {
        return response()->json(['message' => 'Not available when APP_DEBUG is false'], 403);
    }
    return response()->json([
        'connections' => array_keys(config('database.connections')),
        'tenant_config_exists' => config()->has('database.connections.tenant'),
        'default_connection' => config('database.default'),
        'message' => 'If tenant is missing here, your server is strongly caching old code.'
    ]);
});

// Public Tenant Auth (Central Domain Login)
Route::middleware('throttle:login')->group(function () {
    Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('/login/verify-2fa', [\App\Http\Controllers\Api\AuthController::class, 'verify2FA']);
    Route::post('/auth/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('/auth/verify-email', [\App\Http\Controllers\Api\AuthController::class, 'verifyEmail']);
    Route::post('/forgot-password', [\App\Http\Controllers\Api\AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [\App\Http\Controllers\Api\AuthController::class, 'resetPassword']);
});
// Impersonation token login — not credential-based, generous limit
Route::post('/login/token', [\App\Http\Controllers\Api\AuthController::class, 'loginWithToken'])->middleware('throttle:login-token');

// Public CMS (Move here for global access)
Route::group(['prefix' => 'public'], function () {
    Route::get('/blogs', [\App\Http\Controllers\Api\PublicCMSController::class, 'getBlogs']);
    Route::get('/blogs/{slug}', [\App\Http\Controllers\Api\PublicCMSController::class, 'getBlog']);
    
    Route::get('/customer-stories', [\App\Http\Controllers\Api\PublicCMSController::class, 'getCustomerStories']);
    Route::get('/customer-stories/{slug}', [\App\Http\Controllers\Api\PublicCMSController::class, 'getCustomerStory']);

    Route::get('/docs', [\App\Http\Controllers\Api\PublicCMSController::class, 'getDocs']);
    Route::get('/help', [\App\Http\Controllers\Api\PublicCMSController::class, 'getHelp']);
    
    Route::get('/translations/{locale}', [\App\Http\Controllers\Api\SuperAdmin\TranslationController::class, 'fetch']);

    // Business Directory
    Route::get('/directory/categories', [\App\Http\Controllers\Api\DirectoryController::class, 'categories']);
    Route::get('/directory/listings', [\App\Http\Controllers\Api\DirectoryController::class, 'index']);
    Route::get('/directory/listings/{slug}', [\App\Http\Controllers\Api\DirectoryController::class, 'show']);
    Route::post('/directory/listings/{id}/claim', [\App\Http\Controllers\Api\DirectoryController::class, 'claim']);
    Route::post('/directory/listings/{id}/verify-claim', [\App\Http\Controllers\Api\DirectoryController::class, 'verifyClaim']);

    // Contact Leads
    Route::post('/contact-leads', [\App\Http\Controllers\Api\ContactLeadController::class, 'store'])->middleware('throttle:10,1');
});

// SEO Data Endpoints
Route::get('/seo-data', [\App\Http\Controllers\Api\SEOController::class, 'seoData']);
Route::get('/seo/schema', [\App\Http\Controllers\Api\SEOController::class, 'jsonLdSchema']);

// Voice Booking NLP Parser (public — distinct path from tenant-api to avoid collision)
Route::middleware('throttle:30,1')->prefix('public/voice-booking')->group(function () {
    Route::post('/parse', [\App\Http\Controllers\Api\VoiceBookingController::class, 'parseTranscript']);
    Route::post('/validate', [\App\Http\Controllers\Api\VoiceBookingController::class, 'parseAndValidate']);
});

// Kiosk Mode Public Endpoints
Route::middleware('throttle:60,1')->prefix('kiosk/{tenant}')->group(function () {
    Route::get('/menu', [\App\Http\Controllers\Api\KioskController::class, 'menu']);
    Route::get('/tables', [\App\Http\Controllers\Api\KioskController::class, 'tables']);
    Route::post('/order', [\App\Http\Controllers\Api\KioskController::class, 'placeOrder']);
});

// Webhook Test Endpoint (receives our outgoing webhooks for verification)
Route::post('/webhooks/test', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'received' => true,
        'event' => $request->header('X-Sectros-Event'),
        'signature' => $request->header('X-Sectros-Signature'),
        'timestamp' => $request->header('X-Sectros-Timestamp'),
        'body' => $request->all(),
    ]);
});

