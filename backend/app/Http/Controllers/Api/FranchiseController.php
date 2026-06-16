<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Franchise;
use Illuminate\Http\Request;

class FranchiseController extends Controller
{
    public function index()
    {
        return response()->json(Franchise::withCount('branches')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:franchises,name',
            'owner_name' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'is_active' => 'nullable|boolean'
        ]);

        $franchise = Franchise::create($validated);
        return response()->json($franchise->loadCount('branches'), 201);
    }

    public function show(Franchise $franchise)
    {
        return response()->json($franchise->loadCount('branches'));
    }

    public function update(Request $request, Franchise $franchise)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:franchises,name,' . $franchise->id,
            'owner_name' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'is_active' => 'nullable|boolean'
        ]);

        $franchise->update($validated);
        return response()->json($franchise->loadCount('branches'));
    }

    public function destroy(Franchise $franchise)
    {
        if ($franchise->branches()->exists()) {
            return response()->json(['error' => 'Cannot delete franchise with active branches. Remove or reassign branches first.'], 422);
        }
        $franchise->delete();
        return response()->json(null, 204);
    }
}
