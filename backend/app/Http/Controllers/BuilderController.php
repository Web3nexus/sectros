<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BuilderPage;
use App\Models\TenantSetting;

class BuilderController extends Controller
{
    // List all pages
    public function index()
    {
        return response()->json(
            BuilderPage::orderBy('created_at', 'asc')->paginate(50)
        );
    }

    // Load a specific page by slug
    public function load($slug = 'home')
    {
        $page = BuilderPage::where('slug', $slug)->first();
        
        if (!$page) {
            return response()->json([
                'sections_json' => null, 
                'theme_json' => null,
                'message' => 'Page not found'
            ], 404);
        }

        return response()->json([
            'sections_json'     => $page->sections_json,
            'theme_json'        => $page->theme_json,
            'grapes_json_state' => $page->grapes_json_state, // Keep for legacy if needed
            'title'             => $page->title,
            'is_published'      => $page->is_published,
        ]);
    }

    // Create or Update a page
    public function save(Request $request, $slug = 'home')
    {
        $slug = $slug ?: 'home';

        $existing = BuilderPage::where('slug', $slug)->first();
        if ($existing && $existing->slug !== $request->input('slug', $slug)) {
            return response()->json(['message' => 'A page with this slug already exists.'], 409);
        }

        $newSlug = $request->input('slug', $slug);
        if ($newSlug !== $slug) {
            $slugConflict = BuilderPage::where('slug', $newSlug)->first();
            if ($slugConflict) {
                return response()->json(['message' => 'A page with this slug already exists.'], 409);
            }
        }

        $page = BuilderPage::updateOrCreate(
            ['slug' => $slug],
            [
                'title'             => $request->input('title', ucfirst($slug)),
                'sections_json'     => $request->input('sections_json'),
                'theme_json'        => $request->input('theme_json'),
                'html_content'      => $request->input('html_content'),
                'css_content'       => $request->input('css_content'),
            ]
        );

        return response()->json(['message' => 'Saved successfully', 'page' => $page]);
    }

    // Publish a specific page
    public function publish($slug = 'home')
    {
        $page = BuilderPage::where('slug', $slug)->first();
        
        if ($page) {
            // HYDRATION: Replace placeholders with real brand data
            $settings = $this->cacheTenantSettings();
            
            // Fallbacks
            $brand = [
                '{{restaurant_name}}'    => $settings['business_name'] ?? tenant('business_name') ?? 'The Sectros Grill',
                '[[BUSINESS_PHONE]]'     => $settings['business_phone'] ?? tenant('phone') ?? '+1 (555) 000-0000',
                '[[BUSINESS_ADDRESS]]'   => $settings['business_address'] ?? tenant('address') ?? '123 Gourmet Way, Silicon Valley',
                '{{establishment_year}}' => $settings['establishment_year'] ?? date('Y'),
                '{{social_instagram}}'   => $settings['social_instagram'] ?? '',
                '{{social_facebook}}'    => $settings['social_facebook'] ?? '',
                '{{social_twitter}}'     => $settings['social_twitter'] ?? '',
                '{{social_youtube}}'     => $settings['social_youtube'] ?? '',
                '{{social_tiktok}}'      => $settings['social_tiktok'] ?? '',
            ];

            $html = $page->html_content;
            $css  = $page->css_content;

            foreach ($brand as $placeholder => $value) {
                $html = str_replace($placeholder, $value, $html);
                $css  = str_replace($placeholder, $value, $css);
            }

            $page->update([
                'is_published' => true,
                'html_content' => $html,
                'css_content'  => $css,
            ]);

            return response()->json(['message' => 'Published with Identity Sync successfully']);
        }

        return response()->json(['message' => 'Page not found'], 404);
    }

    // Unpublish a specific page (take offline)
    public function unpublish($slug)
    {
        $page = BuilderPage::where('slug', $slug)->first();

        if ($page) {
            $page->update(['is_published' => false]);
            return response()->json(['message' => 'Page taken offline']);
        }

        return response()->json(['message' => 'Page not found'], 404);
    }

    // Permanently delete a page
    public function destroy($slug)
    {
        $page = BuilderPage::where('slug', $slug)->first();

        if ($page) {
            $page->delete();
            return response()->json(['message' => 'Page deleted']);
        }

        return response()->json(['message' => 'Page not found'], 404);
    }
}
