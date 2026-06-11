<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SocialiteController extends Controller
{
    const META_API_VERSION = 'v22.0';

    /**
     * Apply global SaaS settings to Socialite config at runtime.
     */
    private function applySaaSSettings()
    {
        $settings = \App\Models\SaaSSetting::all()->pluck('value', 'key');
        
        if (!empty($settings['facebook_client_id'])) {
            config(['services.facebook.client_id' => $settings['facebook_client_id']]);
        }
        if (!empty($settings['facebook_client_secret'])) {
            config(['services.facebook.client_secret' => $settings['facebook_client_secret']]);
        }
        
        $centralDomain = $settings['central_domain'] ?? 'sectros.com';
        $protocol = 'https';
        config(['services.facebook.redirect' => "{$protocol}://{$centralDomain}/central-api/auth/facebook/callback"]);
    }

    /**
     * Redirect to Meta for Authentication.
     */
    public function redirectToFacebook(Request $request)
    {
        $this->applySaaSSettings();
        
        $tenantId = $request->query('tenant_id');
        $state = $tenantId . '|' . Str::random(32);
        
        session(['meta_oauth_state' => $state]);

        return Socialite::driver('facebook')
            ->setScopes([
                'public_profile',
                'pages_manage_metadata',
                'pages_messaging',
                'instagram_manage_messages',
                'instagram_basic',
                'whatsapp_business_management',
                'whatsapp_business_messaging'
            ])
            ->with(['state' => $state])
            ->stateless()
            ->redirect();
    }

    /**
     * Handle the callback from Meta.
     */
    public function handleFacebookCallback(Request $request)
    {
        $this->applySaaSSettings();
        $settings = \App\Models\SaaSSetting::all()->pluck('value', 'key');
        
        $state = $request->query('state');
        if (!$state) {
            Log::error('Meta OAuth: Missing state parameter');
            return redirect()->away('https://' . ($settings['central_domain'] ?? 'sectros.com') . '/dashboard/settings?oauth=error');
        }

        $parts = explode('|', $state);
        $tenantId = $parts[0] ?? null;
        $tenant = $tenantId ? \App\Models\Tenant::find($tenantId) : null;

        try {
            $user = Socialite::driver('facebook')->stateless()->user();
            $token = $user->token;

            // Exchange for a Long-Lived Token (60 days)
            $response = Http::get('https://graph.facebook.com/' . self::META_API_VERSION . '/oauth/access_token', [
                'grant_type' => 'fb_exchange_token',
                'client_id' => config('services.facebook.client_id'),
                'client_secret' => config('services.facebook.client_secret'),
                'fb_exchange_token' => $token,
            ]);

            $longLivedToken = $response->json()['access_token'] ?? $token;

            // Fetch User's Pages
            $pagesResponse = Http::get('https://graph.facebook.com/' . self::META_API_VERSION . '/me/accounts', [
                'access_token' => $longLivedToken,
            ]);
            
            $pages = $pagesResponse->json()['data'] ?? [];
            $firstPage = $pages[0] ?? null;

            $targetDomain = $settings['central_domain'] ?? 'sectros.com';
            if ($tenant && $firstPage) {
                $tenant->facebook_page_id = $firstPage['id'];
                $tenant->facebook_page_token = encrypt($firstPage['access_token']);
                $tenant->meta_user_token = encrypt($longLivedToken);
                $tenant->save();
                
                $targetDomain = $tenant->domains->first()?->domain ?? "{$tenantId}.{$targetDomain}";
            }

            $redirectUrl = "https://{$targetDomain}/dashboard/settings?oauth=success";
            return redirect($redirectUrl);

        } catch (\Exception $e) {
            Log::error('Meta OAuth Callback Failed', ['error' => $e->getMessage(), 'tenant_id' => $tenantId]);
            
            $centralDomain = $settings['central_domain'] ?? 'sectros.com';
            $targetDomain = $tenant ? ($tenant->domains->first()?->domain ?? "{$tenantId}.{$centralDomain}") : $centralDomain;
            
            $errorUrl = "https://{$targetDomain}/dashboard/settings?oauth=error";
            return redirect($errorUrl);
        }
    }
}
