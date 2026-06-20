<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantService;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return response()->json(
            TenantService::orderBy('sort_order')->paginate(50)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'nullable|integer|min:1',
            'image_url' => 'nullable|string|max:2048',
            'category' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $service = TenantService::create($validated);
        return response()->json($service, 201);
    }

    public function show($id)
    {
        return response()->json(TenantService::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $service = TenantService::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'duration_minutes' => 'nullable|integer|min:1',
            'image_url' => 'nullable|string|max:2048',
            'category' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $service->update($validated);
        return response()->json($service);
    }

    public function destroy($id)
    {
        $service = TenantService::findOrFail($id);
        $service->delete();
        return response()->json(['message' => 'Service deleted']);
    }
}
