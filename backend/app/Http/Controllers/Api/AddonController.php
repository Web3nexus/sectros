<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Addon;
use App\Models\TenantAddon;
use App\Models\Tenant;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddonController extends Controller
{
    public function index()
    {
        $addons = Addon::where('is_active', true)->paginate(50);
        $tenant = tenant();

        $activeAddonIds = [];
        if ($tenant) {
            $activeAddonIds = TenantAddon::where('tenant_id', $tenant->id)
                ->where('status', 'active')
                ->pluck('addon_id')
                ->toArray();
        }

        $addons->getCollection()->transform(function ($addon) use ($activeAddonIds) {
            $data = $addon->toArray();
            $data['is_purchased'] = in_array($addon->id, $activeAddonIds);
            $data['features'] = $addon->features ?? [];
            return $data;
        });

        return response()->json($addons);
    }

    public function active()
    {
        $tenant = tenant();
        if (!$tenant) {
            return response()->json([]);
        }

        $tenantAddons = TenantAddon::with('addon')
            ->where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->paginate(50);

        return response()->json($tenantAddons);
    }

    public function purchase(Request $request, $addonId)
    {
        $tenant = tenant();
        if (!$tenant) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $addon = Addon::where('id', $addonId)->where('is_active', true)->firstOrFail();

        $request->validate(['quantity' => 'integer|min:1']);
        $quantity = max(1, (int) $request->input('quantity', 1));

        return DB::transaction(function () use ($tenant, $addon, $quantity, $request) {
            $existing = TenantAddon::where('tenant_id', $tenant->id)
                ->where('addon_id', $addon->id)
                ->lockForUpdate()
                ->first();

            if ($existing && $existing->status === 'active') {
                return response()->json(['message' => 'This add-on is already active.'], 409);
            }

            $total = 0;
            if ($addon->billing_type === 'usage' && $addon->unit_price) {
                $total = $addon->unit_price * $quantity;
            } elseif ($addon->price) {
                $total = $addon->price;
            }

            if ($total <= 0) {
                $tenantAddon = TenantAddon::updateOrCreate(
                    ['tenant_id' => $tenant->id, 'addon_id' => $addon->id],
                    [
                        'quantity' => $quantity,
                        'status' => 'active',
                        'started_at' => now(),
                    ]
                );
                $this->applyAddonFeatures($tenant, $addon, true);
                return response()->json(['message' => 'Add-on activated.', 'data' => $tenantAddon]);
            }

            $paymentService = new PaymentService();
            $country = $request->input('country', 'US');

            $discount = null;
            if ($request->filled('discount_code')) {
                $resolved = app(\App\Services\DiscountService::class)->resolve(
                    $request->input('discount_code'),
                    'addon',
                    (float) $total,
                    \App\Models\SaaSSetting::where('key', 'default_currency')->value('value') ?? 'USD',
                    $tenant,
                    ['addon_id' => (string) $addon->id]
                );
                $discount = $resolved['discount'];
            }

            try {
                $result = $paymentService->initializeAddonPurchase($tenant, $addon, $quantity, $total, $country, $discount);
            } catch (\App\Exceptions\DiscountException $e) {
                return response()->json(['message' => $e->getMessage()], 422);
            }

            if ($discount) {
                $result['discount'] = [
                    'code' => $discount->code,
                    'discount_amount' => $resolved['discount_amount'] ?? 0,
                    'final_amount' => $resolved['final_amount'] ?? 0,
                ];
            }
            return response()->json($result);
        });
    }

    public function cancel($addonId)
    {
        $tenant = tenant();
        if (!$tenant) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $tenantAddon = TenantAddon::where('tenant_id', $tenant->id)
            ->where('addon_id', $addonId)
            ->where('status', 'active')
            ->firstOrFail();

        $tenantAddon->update([
            'status' => 'cancelled',
            'expires_at' => now(),
        ]);

        $addon = Addon::find($addonId);
        if ($addon) {
            $this->applyAddonFeatures($tenant, $addon, false);
        }

        return response()->json(['message' => 'Add-on cancelled.']);
    }

    private function applyAddonFeatures(Tenant $tenant, Addon $addon, bool $enable)
    {
        $features = $addon->features ?? [];
        if (empty($features)) return;

        $current = $tenant->features ?? [];
        $changed = false;

        foreach ($features as $feature) {
            if ($enable && !in_array($feature, $current)) {
                $current[] = $feature;
                $changed = true;
            } elseif (!$enable) {
                $current = array_values(array_filter($current, fn($f) => $f !== $feature));
                $changed = true;
            }
        }

        if ($changed) {
            $tenant->features = $current;
            $tenant->save();
        }
    }
}
