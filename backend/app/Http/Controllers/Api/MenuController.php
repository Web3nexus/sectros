<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Display a listing of the menu categories with their items.
     */
    public function index()
    {
        return response()->json(
            MenuCategory::with('items.addons')->orderBy('sort_order')->get()
        );
    }

    public function items()
    {
        return response()->json(
            MenuItem::with('category')->orderBy('name')->paginate(50)
        );
    }

    public function addons()
    {
        return response()->json(
            \App\Models\MenuItemAddon::orderBy('name')->paginate(50)
        );
    }

    /**
     * Store a newly created category.
     */
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'integer',
        ]);

        $category = MenuCategory::create($validated);
        return response()->json($category, 201);
    }

    /**
     * Store a newly created menu item.
     */
    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'menu_category_id' => 'required|exists:menu_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image_url' => 'nullable|string|max:2048',
            'is_available' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $item = MenuItem::create($validated);
        return response()->json($item, 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = MenuCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string|max:2048',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    public function destroyCategory($id)
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($id) {
            $category = MenuCategory::findOrFail($id);
            $category->items()->delete();
            $category->delete();
            return response()->json(['message' => 'Category deleted']);
        });
    }

    public function updateItem(Request $request, $id)
    {
        $item = MenuItem::findOrFail($id);

        $validated = $request->validate([
            'menu_category_id' => 'exists:menu_categories,id',
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'image_url' => 'nullable|string|max:2048',
            'is_available' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $item->update($validated);
        return response()->json($item);
    }

    public function destroyItem($id)
    {
        $item = MenuItem::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Item deleted']);
    }
}
