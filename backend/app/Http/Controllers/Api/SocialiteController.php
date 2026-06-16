<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConnectedAccount;
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
     * Stores all connected pages and Instagram accounts in connected_accounts table.
     */
    public function handleFacebookCallback(Request $request)
    {
        $this->applySaaSSettings();
        $settings = \App\Models\SaaSSetting::all()->pluck('value', 'key');
        
        $state = $request->query('state');
        if (!$state) {
            Log::error('Meta OAuth: Missing state parameter');
            return redirect()->away('https://' . ($settings['central_domain'] ?? 'sectros.com') . '/dashboard/automation?oauth=error');
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

            // Delete old connected accounts for this tenant (full re-sync)
            \DB::transaction(function () use ($tenantId, $user, $longLivedToken, $pages, &$targetDomain, $settings) {
                ConnectedAccount::forTenant($tenantId)
                    ->whereIn('channel', ['facebook', 'instagram'])
                    ->delete();

                foreach ($pages as $page) {
                    // Store Facebook Page connection
                    $fbAccount = ConnectedAccount::create([
                        'tenant_id' => $tenantId,
                        'provider' => 'meta',
                        'channel' => 'facebook',
                        'meta_user_id' => $user->id,
                        'page_id' => $page['id'],
                        'page_name' => $page['name'],
                        'status' => 'active',
                    ]);
                    $fbAccount->access_token = $page['access_token'];
                    $fbAccount->save();

                    // Subscribe page to webhook for Messenger
                    $subscribeResponse = Http::post('https://graph.facebook.com/' . self::META_API_VERSION . '/' . $page['id'] . '/subscribed_apps', [
                        'access_token' => $page['access_token'],
                        'subscribed_fields' => 'messages,messaging_postbacks,message_deliveries,message_reads',
                    ]);
                    if ($subscribeResponse->successful()) {
                        $fbAccount->webhook_subscribed = true;
                        $fbAccount->webhook_subscribed_at = now();
                        $fbAccount->save();
                    } else {
                        Log::warning('Failed to subscribe page to webhook', [
                            'page_id' => $page['id'],
                            'status' => $subscribeResponse->status(),
                            'response' => $subscribeResponse->json(),
                        ]);
                    }

                    // Check for linked Instagram Business Account
                    try {
                        $igResponse = Http::get('https://graph.facebook.com/' . self::META_API_VERSION . '/' . $page['id'], [
                            'access_token' => $page['access_token'],
                            'fields' => 'instagram_business_account{id,username}',
                        ]);

                        $igAccount = $igResponse->json()['instagram_business_account'] ?? null;
                        if ($igAccount && !empty($igAccount['id'])) {
                            $igConnection = ConnectedAccount::create([
                                'tenant_id' => $tenantId,
                                'provider' => 'meta',
                                'channel' => 'instagram',
                                'meta_user_id' => $user->id,
                                'page_id' => $page['id'],
                                'page_name' => $page['name'],
                                'instagram_business_account_id' => $igAccount['id'],
                                'instagram_username' => $igAccount['username'] ?? null,
                                'status' => 'active',
                            ]);
                            $igConnection->access_token = $page['access_token'];
                            $igConnection->save();

                            Log::info('Instagram Business Account connected', [
                                'tenant_id' => $tenantId,
                                'page_id' => $page['id'],
                                'ig_id' => $igAccount['id'],
                            ]);
                        }
                    } catch (\Exception $e) {
                        Log::warning('Instagram account lookup failed for page', [
                            'page_id' => $page['id'],
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                // Store meta_user token (long-lived) for token refresh later
                $metaUserRecord = ConnectedAccount::updateOrCreate(
                    [
                        'tenant_id' => $tenantId,
                        'provider' => 'meta',
                        'channel' => 'meta_user',
                    ],
                    [
                        'meta_user_id' => $user->id,
                        'status' => 'active',
                    ]
                );
                $metaUserRecord->access_token = $longLivedToken;
                $metaUserRecord->save();
            });

            $targetDomain = $settings['central_domain'] ?? 'sectros.com';
            if ($tenant) {
                $targetDomain = $tenant->domains->first()?->domain ?? "{$tenantId}.{$targetDomain}";
            }

            $redirectUrl = "https://{$targetDomain}/dashboard/automation?oauth=success";
            return redirect($redirectUrl);

        } catch (\Exception $e) {
            Log::error('Meta OAuth Callback Failed', ['error' => $e->getMessage(), 'tenant_id' => $tenantId]);
            
            $centralDomain = $settings['central_domain'] ?? 'sectros.com';
            $targetDomain = $tenant ? ($tenant->domains->first()?->domain ?? "{$tenantId}.{$centralDomain}") : $centralDomain;
            
            $errorUrl = "https://{$targetDomain}/dashboard/automation?oauth=error";
            return redirect($errorUrl);
        }
    }
}
