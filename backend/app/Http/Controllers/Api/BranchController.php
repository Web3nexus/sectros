<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index()
    {
        return response()->json(
            Branch::orderBy('name')->paginate(50)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'is_main' => 'boolean'
        ]);

        $branch = $this->transaction(function () use ($validated) {
            if ($validated['is_main'] ?? false) {
                Branch::where('is_main', true)->update(['is_main' => false]);
            }

            return Branch::create($validated);
        });

        return response()->json($branch, 201);
    }

    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'is_main' => 'boolean',
            'is_active' => 'boolean'
        ]);

        $this->transaction(function () use ($branch, $validated) {
            if (($validated['is_main'] ?? false) && !$branch->is_main) {
                Branch::where('is_main', true)->update(['is_main' => false]);
            }

            $branch->update($validated);
        });
        return response()->json($branch);
    }

    public function destroy(Branch $branch)
    {
        if ($branch->is_main) {
            return response()->json(['error' => 'Cannot delete the main branch.'], 422);
        }
        $branch->delete();
        return response()->json(null, 204);
    }
}
