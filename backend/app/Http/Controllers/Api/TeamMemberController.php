<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantTeamMember;
use Illuminate\Http\Request;

class TeamMemberController extends Controller
{
    public function index()
    {
        return response()->json(
            TenantTeamMember::orderBy('sort_order')->paginate(50)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'image_url' => 'nullable|string|max:2048',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $member = TenantTeamMember::create($validated);
        return response()->json($member, 201);
    }

    public function show($id)
    {
        return response()->json(TenantTeamMember::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $member = TenantTeamMember::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'role' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'image_url' => 'nullable|string|max:2048',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $member->update($validated);
        return response()->json($member);
    }

    public function destroy($id)
    {
        $member = TenantTeamMember::findOrFail($id);
        $member->delete();
        return response()->json(['message' => 'Team member deleted']);
    }
}
