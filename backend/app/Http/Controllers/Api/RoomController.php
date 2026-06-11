<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantRoom;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index()
    {
        return response()->json(TenantRoom::orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image_url' => 'nullable|string|max:2048',
            'amenities' => 'nullable|array',
            'capacity' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $room = TenantRoom::create($validated);
        return response()->json($room, 201);
    }

    public function show($id)
    {
        return response()->json(TenantRoom::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $room = TenantRoom::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'image_url' => 'nullable|string|max:2048',
            'amenities' => 'nullable|array',
            'capacity' => 'integer|min:1',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $room->update($validated);
        return response()->json($room);
    }

    public function destroy($id)
    {
        $room = TenantRoom::findOrFail($id);
        $room->delete();
        return response()->json(['message' => 'Room deleted']);
    }
}
