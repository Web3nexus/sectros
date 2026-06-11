<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Addon;
use App\Models\Tenant;
use App\Models\TenantAddon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaaSAddonController extends Controller
{
    public function index()
    {
        return response()->json(Addon::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:addons,slug',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'price' => 'nullable|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'unit_label' => 'nullable|string|max:100',
            'billing_type' => 'required|in:one-time,recurring,usage',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if (($validated['is_active'] ?? true) && empty($validated['price']) && empty($validated['unit_price'])) {
            return response()->json(['message' => 'Either price or unit_price must be set for active add-ons.'], 422);
        }

        $addon = Addon::create($validated);
        return response()->json($addon, 201);
    }

    public function update(Request $request, $id)
    {
        $addon = Addon::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:addons,slug,' . $id,
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'price' => 'nullable|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'unit_label' => 'nullable|string|max:100',
            'billing_type' => 'sometimes|in:one-time,recurring,usage',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $isActive = $validated['is_active'] ?? $addon->is_active;
        $price = $validated['price'] ?? $addon->price;
        $unitPrice = $validated['unit_price'] ?? $addon->unit_price;
        if ($isActive && empty($price) && empty($unitPrice)) {
            return response()->json(['message' => 'Either price or unit_price must be set for active add-ons.'], 422);
        }

        $addon->update($validated);
        return response()->json($addon);
    }

    public function destroy($id)
    {
        $addon = Addon::findOrFail($id);
        $addon->delete();
        return response()->json(['message' => 'Add-on deleted.']);
    }

    public function tenantAddons($tenantId)
    {
        $tenant = Tenant::findOrFail($tenantId);
        $addons = TenantAddon::with('addon')
            ->where('tenant_id', $tenant->id)
            ->get();
        return response()->json($addons);
    }

    public function assignAddon(Request $request, $tenantId)
    {
        $tenant = Tenant::findOrFail($tenantId);

        $validated = $request->validate([
            'addon_id' => 'required|exists:addons,id',
            'quantity' => 'integer|min:1',
            'status' => 'in:active,inactive',
        ]);

        $addon = Addon::findOrFail($validated['addon_id']);

        $tenantAddon = DB::transaction(function () use ($tenant, $addon, $validated) {
            $record = TenantAddon::updateOrCreate(
                ['tenant_id' => $tenant->id, 'addon_id' => $addon->id],
                [
                    'quantity' => $validated['quantity'] ?? 1,
                    'status' => $validated['status'] ?? 'active',
                    'started_at' => now(),
                ]
            );

            $features = $addon->features ?? [];
            $currentFeatures = $tenant->features ?? [];
            foreach ($features as $feature) {
                if (!in_array($feature, $currentFeatures)) {
                    $currentFeatures[] = $feature;
                }
            }
            $tenant->features = $currentFeatures;
            $tenant->save();

            return $record;
        });

        return response()->json($tenantAddon);
    }

    public function revokeAddon($tenantId, $addonId)
    {
        $tenant = Tenant::findOrFail($tenantId);

        $tenantAddon = TenantAddon::where('tenant_id', $tenant->id)
            ->where('addon_id', $addonId)
            ->firstOrFail();

        DB::transaction(function () use ($tenant, $tenantAddon, $addonId) {
            $addon = Addon::find($addonId);
            if ($addon) {
                $features = $addon->features ?? [];
                $currentFeatures = $tenant->features ?? [];
                $tenant->features = array_values(array_filter($currentFeatures, fn($f) => !in_array($f, $features)));
                $tenant->save();
            }

            $tenantAddon->delete();
        });

        return response()->json(['message' => 'Add-on revoked.']);
    }
}
