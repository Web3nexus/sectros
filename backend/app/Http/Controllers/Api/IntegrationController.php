<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class IntegrationController extends Controller
{
    public function index()
    {
        return response()->json(ApiKey::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scopes' => 'nullable|array',
            'expires_at' => 'nullable|date'
        ]);

        $key = 'rv_' . Str::random(32);
        $secret = Str::random(64);

        $apiKey = ApiKey::create([
            'name' => $validated['name'],
            'key' => $key,
            'secret' => Hash::make($secret),
            'scopes' => $validated['scopes'] ?? ['*'],
            'expires_at' => $validated['expires_at'],
            'is_active' => true
        ]);

        return response()->json([
            'message' => 'API Key created successfully. Please save the secret as it will not be shown again.',
            'api_key' => $apiKey,
            'plain_secret' => $secret
        ], 201);
    }

    public function update(Request $request, ApiKey $apiKey)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'scopes' => 'nullable|array'
        ]);

        $apiKey->update($validated);
        return response()->json($apiKey);
    }

    public function destroy(ApiKey $apiKey)
    {
        $apiKey->delete();
        return response()->json(null, 204);
    }
}
