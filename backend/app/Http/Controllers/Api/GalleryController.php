<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantGallery;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function index()
    {
        return response()->json(
            TenantGallery::orderBy('sort_order')->paginate(50)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image_url' => 'required|string|max:2048',
            'caption' => 'nullable|string|max:255',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $gallery = TenantGallery::create($validated);
        return response()->json($gallery, 201);
    }

    public function show($id)
    {
        return response()->json(TenantGallery::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $gallery = TenantGallery::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image_url' => 'string|max:2048',
            'caption' => 'nullable|string|max:255',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $gallery->update($validated);
        return response()->json($gallery);
    }

    public function destroy($id)
    {
        $gallery = TenantGallery::findOrFail($id);
        $gallery->delete();
        return response()->json(['message' => 'Gallery image deleted']);
    }
}
