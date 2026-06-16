<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantSetting;
use Illuminate\Http\Request;

class BrandingController extends Controller
{
    public function index()
    {
        $settings = TenantSetting::all()->pluck('value', 'key')->toArray();
        
        // Fallback to the central tenant record if not customized locally
        if (!isset($settings['business_name'])) {
            $settings['business_name'] = tenant('business_name');
        }

        if (!isset($settings['business_phone'])) {
            $settings['business_phone'] = tenant('phone') ?? '+1 (555) 000-0000';
        }

        if (!isset($settings['business_address'])) {
            $settings['business_address'] = tenant('address') ?? '123 Gourmet Way, Silicon Valley';
        }

        if (!isset($settings['establishment_year'])) {
            $settings['establishment_year'] = date('Y');
        }

        if (!isset($settings['social_instagram'])) {
            $settings['social_instagram'] = '';
        }

        if (!isset($settings['social_facebook'])) {
            $settings['social_facebook'] = '';
        }

        if (!isset($settings['social_twitter'])) {
            $settings['social_twitter'] = '';
        }

        if (!isset($settings['social_youtube'])) {
            $settings['social_youtube'] = '';
        }

        if (!isset($settings['social_tiktok'])) {
            $settings['social_tiktok'] = '';
        }

        $settings['platform_site_domain'] = \App\Models\SaaSSetting::on('platform')->where('key', 'platform_site_domain')->value('value') ?? '';

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
 
        return response()->json(['status' => 'success', 'settings' => $settings]);
    }
}
