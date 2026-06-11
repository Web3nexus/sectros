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
            $settings['social_instagram'] = 'https://instagram.com/sectros';
        }

        if (!isset($settings['social_facebook'])) {
            $settings['social_facebook'] = 'https://facebook.com/sectros';
        }

        if (!isset($settings['social_twitter'])) {
            $settings['social_twitter'] = 'https://twitter.com/sectros';
        }

        $settings['platform_site_domain'] = tenancy()->central(function() {
            return \App\Models\SaaSSetting::where('key', 'platform_site_domain')->value('value') ?? '';
        });

        $settings['business_type'] = tenant('business_type') ?? 'restaurant';
        
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $settings = $request->all();
        
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
