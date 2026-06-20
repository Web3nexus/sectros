<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantSetting;
use App\Models\SaaSSetting;
use Illuminate\Http\Request;

class BrandingController extends Controller
{
    public function index()
    {
        $settings = $this->cacheTenantSettings();

        $settings['business_name'] ??= tenant('business_name');
        $settings['business_phone'] ??= tenant('phone') ?? '+1 (555) 000-0000';
        $settings['business_address'] ??= tenant('address') ?? '123 Gourmet Way, Silicon Valley';
        $settings['establishment_year'] ??= date('Y');
        $settings['social_instagram'] ??= '';
        $settings['social_facebook'] ??= '';
        $settings['social_twitter'] ??= '';
        $settings['social_youtube'] ??= '';
        $settings['social_tiktok'] ??= '';

        $saaSSettings = $this->cacheSaaSSettings();
        $settings['platform_site_domain'] = $saaSSettings['platform_site_domain'] ?? '';

        $settings['business_type'] = tenant('business_type') ?? 'restaurant';

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $allowedKeys = [
            'business_name', 'business_address', 'business_phone', 'business_email',
            'primary_color', 'secondary_color', 'accent_color',
            'font_family', 'logo_url', 'favicon_url',
            'social_facebook', 'social_instagram', 'social_twitter', 'social_tiktok',
            'opening_hours', 'about_text', 'hero_title', 'hero_subtitle',
            'show_reservation_button', 'show_menu_button',
            'reservation_link', 'menu_link',
        ];

        $settings = $request->only($allowedKeys);

        $this->transaction(function () use ($settings) {
            foreach ($settings as $key => $value) {
                $storeValue = $value;
                if (is_array($value)) {
                    $storeValue = json_encode($value);
                } elseif (is_bool($value)) {
                    $storeValue = $value ? 'true' : 'false';
                }

                TenantSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $storeValue]
                );
            }
        });

        TenantSetting::forgetCache();

        return response()->json(['status' => 'success', 'settings' => $settings]);
    }
}
