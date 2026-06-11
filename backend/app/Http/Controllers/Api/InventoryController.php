<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        return response()->json(InventoryItem::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255',
            'unit' => 'nullable|string|max:50',
            'stock_qty' => 'numeric|min:0',
            'min_stock_level' => 'numeric|min:0',
            'cost_per_unit' => 'numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'image_url' => 'nullable|string|max:2048',
            'is_active' => 'boolean',
        ]);

        $item = InventoryItem::create($validated);
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(InventoryItem::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255',
            'unit' => 'nullable|string|max:50',
            'stock_qty' => 'numeric|min:0',
            'min_stock_level' => 'numeric|min:0',
            'cost_per_unit' => 'numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'image_url' => 'nullable|string|max:2048',
            'is_active' => 'boolean',
        ]);

        $item->update($validated);
        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = InventoryItem::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Inventory item deleted']);
    }

    public function adjustStock(Request $request, $id)
    {
        $validated = $request->validate([
            'adjustment' => 'required|numeric',
            'reason' => 'nullable|string',
        ]);

        $item = InventoryItem::findOrFail($id);
        $newQty = $item->stock_qty + $validated['adjustment'];
        $item->update(['stock_qty' => max(0, $newQty)]);

        return response()->json($item);
    }
}
