<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NavigationMenu;
use Illuminate\Http\Request;

class NavigationMenuController extends Controller
{
    /**
     * Display a listing of the navigation menus.
     */
    public function index()
    {
        return response()->json(NavigationMenu::all());
    }

    /**
     * Store a newly created navigation menu.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'links' => 'required|array',
        ]);

        $menu = NavigationMenu::create($validated);
        return response()->json($menu, 201);
    }

    /**
     * Update the specified navigation menu.
     */
    public function update(Request $request, $id)
    {
        $menu = NavigationMenu::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'string|max:255',
            'links' => 'array',
        ]);

        $menu->update($validated);
        return response()->json($menu);
    }

    /**
     * Remove the specified navigation menu.
     */
    public function destroy($id)
    {
        $menu = NavigationMenu::findOrFail($id);
        $menu->delete();
        return response()->json(['message' => 'Menu deleted successfully']);
    }
}
