<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WebsiteTemplate;

class SaaSThemeAdminController extends Controller
{
    /**
     * List all templates managed by the SaaS platform.
     */
    public function index()
    {
        return response()->json(WebsiteTemplate::orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a new template in the central store.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'slug' => 'required|string|unique:website_templates,slug',
            'category' => 'nullable|string',
            'html_content' => 'required|string',
            'css_content' => 'nullable|string',
            'preview_image_url' => 'nullable|string',
            'sections_json' => 'nullable|array',
            'theme_json' => 'nullable|array',
            'is_free' => 'boolean',
            'price' => 'required|numeric|min:0',
            'required_plan_id' => 'nullable|exists:subscription_plans,id',
            'is_active' => 'boolean',
        ]);

        $template = WebsiteTemplate::create($data);
        return response()->json($template, 201);
    }

    /**
     * Update an existing template.
     */
    public function update(Request $request, $id)
    {
        $template = WebsiteTemplate::findOrFail($id);
        
        $data = $request->validate([
            'name' => 'string',
            'slug' => 'string|unique:website_templates,slug,' . $id,
            'category' => 'nullable|string',
            'html_content' => 'string',
            'css_content' => 'nullable|string',
            'preview_image_url' => 'nullable|string',
            'sections_json' => 'nullable|array',
            'theme_json' => 'nullable|array',
            'is_free' => 'boolean',
            'price' => 'numeric|min:0',
            'required_plan_id' => 'nullable|exists:subscription_plans,id',
            'is_active' => 'boolean',
        ]);

        $template->update($data);
        return response()->json($template);
    }

    /**
     * Get details for a single template.
     */
    public function show($id)
    {
        return response()->json(WebsiteTemplate::findOrFail($id));
    }

    /**
     * Delete a template.
     */
    public function destroy($id)
    {
        WebsiteTemplate::destroy($id);
        return response()->json(['message' => 'Theme deleted successfully']);
    }
}
