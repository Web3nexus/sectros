<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\MenuItemAddon;
use App\Models\MenuCategory;
use App\Models\RestaurantTable;
use App\Models\Tenant;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KioskController extends Controller
{
    private function resolveTenant(string $tenantId): ?Tenant
    {
        $tenant = Tenant::find($tenantId);
        if (!$tenant || $tenant->status !== 'active') return null;
        $features = $tenant->features ?? [];
        if (!($features['kiosk_mode'] ?? false)) return null;
        return $tenant;
    }

    public function menu(string $tenantId): JsonResponse
    {
        $tenant = $this->resolveTenant($tenantId);
        if (!$tenant) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        $categories = MenuCategory::allTenants()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($cat) {
                $cat->items = $cat->items()
                    ->allTenants()
                    ->where('tenant_id', $cat->tenant_id)
                    ->where('is_available', true)
                    ->orderBy('sort_order')
                    ->with(['addons' => function ($q) {
                        $q->allTenants()->where('tenant_id', $cat->tenant_id);
                    }])
                    ->get();
                return $cat;
            });

        return response()->json([
            'business_name' => $tenant->business_name,
            'business_type' => $tenant->business_type,
            'categories' => $categories,
            'features' => $tenant->features ?? [],
        ]);
    }

    public function tables(string $tenantId): JsonResponse
    {
        $tenant = $this->resolveTenant($tenantId);
        if (!$tenant) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        $tables = RestaurantTable::allTenants()
            ->where('tenant_id', $tenantId)
            ->where('status', 'available')
            ->orderBy('table_number')
            ->get(['id', 'table_number', 'capacity']);

        return response()->json(['tables' => $tables]);
    }

    public function placeOrder(Request $request, string $tenantId): JsonResponse
    {
        $tenant = $this->resolveTenant($tenantId);
        if (!$tenant) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'dining_mode' => 'required|in:eat_in,take_out',
            'restaurant_table_id' => 'exclude_if:dining_mode,take_out|nullable|integer|exists:tenant.restaurant_tables,id',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|integer|exists:tenant.menu_items,id',
            'items.*.quantity' => 'required|integer|min:1|max:99',
            'items.*.addons' => 'nullable|array',
            'items.*.addons.*' => 'integer|exists:tenant.menu_item_addons,id',
        ]);

        $tableId = $validated['dining_mode'] === 'eat_in' ? ($validated['restaurant_table_id'] ?? null) : null;

        if ($validated['dining_mode'] === 'eat_in' && !$tableId) {
            return response()->json(['message' => 'Table selection is required for dine-in'], 422);
        }

        $totalAmount = 0;
        $itemPayloads = [];
        $addonModel = new MenuItemAddon;

        DB::connection('tenant')->beginTransaction();

        try {
            if ($tableId) {
                $locked = RestaurantTable::allTenants()
                    ->where('tenant_id', $tenantId)
                    ->where('id', $tableId)
                    ->lockForUpdate()
                    ->first();

                if (!$locked || $locked->status !== 'available') {
                    DB::connection('tenant')->rollBack();
                    return response()->json(['message' => 'Selected table is not available'], 409);
                }
            }

            foreach ($validated['items'] as $itemData) {
                $menuItem = MenuItem::allTenants()
                    ->where('tenant_id', $tenantId)
                    ->where('id', $itemData['menu_item_id'])
                    ->where('is_available', true)
                    ->first();

                if (!$menuItem) {
                    DB::connection('tenant')->rollBack();
                    return response()->json(['message' => 'An item in your order is no longer available'], 400);
                }

                $unitPrice = (float) $menuItem->price;
                $quantity = (int) $itemData['quantity'];

                $addonPrice = 0;
                if (!empty($itemData['addons'])) {
                    $validAddons = $addonModel::allTenants()
                        ->where('tenant_id', $tenantId)
                        ->where('menu_item_id', $menuItem->id)
                        ->whereIn('id', $itemData['addons'])
                        ->get();

                    if ($validAddons->count() !== count(array_unique($itemData['addons']))) {
                        DB::connection('tenant')->rollBack();
                        return response()->json(['message' => 'Invalid addon selected for item: ' . $menuItem->name], 400);
                    }

                    foreach ($validAddons as $addon) {
                        $addonPrice += (float) $addon->price;
                    }
                }

                $unitPriceWithAddons = round($unitPrice + $addonPrice, 2);
                $subtotal = round($unitPriceWithAddons * $quantity, 2);
                $totalAmount += $subtotal;

                $itemPayloads[] = [
                    'tenant_id' => $tenantId,
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPriceWithAddons,
                    'subtotal' => $subtotal,
                    'addons' => $itemData['addons'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            $order = Order::create([
                'tenant_id' => $tenantId,
                'restaurant_table_id' => $tableId,
                'customer_name' => $validated['customer_name'],
                'total_amount' => round($totalAmount, 2),
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'dining_mode' => $validated['dining_mode'],
            ]);

            foreach ($itemPayloads as $payload) {
                $payload['order_id'] = $order->id;
                OrderItem::create($payload);
            }

            if ($tableId) {
                RestaurantTable::allTenants()
                    ->where('tenant_id', $tenantId)
                    ->where('id', $tableId)
                    ->update(['status' => 'occupied']);
            }

            DB::connection('tenant')->commit();

            return response()->json([
                'success' => true,
                'order_id' => $order->id,
                'total_amount' => $order->total_amount,
                'message' => 'Order placed successfully',
            ], 201);

        } catch (\Exception $e) {
            DB::connection('tenant')->rollBack();
            Log::error('Kiosk order failed', ['tenant' => $tenantId, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to place order. Please try again.'], 500);
        }
    }
}
