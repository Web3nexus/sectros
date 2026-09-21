<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Models\DiscountRedemption;
use App\Services\DiscountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class DiscountController extends Controller
{
    private function redeemableDiscounts()
    {
        return Discount::withCount('redemptions')
            ->orderByDesc('updated_at')
            ->paginate(50)
            ->through(function ($discount) {
                return $this->serialize($discount);
            });
    }

    private function serialize(Discount $discount): array
    {
        return array_merge($discount->toArray(), [
            'redemptions_count' => $discount->redemptions_count ?? $discount->redemptions()->count(),
            'usable' => $discount->isUsableNow(),
            'display' => $discount->display(),
            'scopes' => $discount->scopes(),
            'plan_slugs' => $discount->planSlugs(),
            'addon_ids' => $discount->addonIds(),
            'template_ids' => $discount->templateIds(),
        ]);
    }

    public function index()
    {
        return response()->json($this->redeemableDiscounts());
    }

    public function store(Request $request, DiscountService $discountService)
    {
        $data = $this->validateDiscount($request);
        $data['code'] = strtoupper(trim($data['code']));

        if (Discount::where('code', $data['code'])->exists()) {
            return response()->json(['message' => 'A discount with this code already exists.'], 422);
        }

        $discount = DB::connection('platform')->transaction(function () use ($data) {
            return Discount::create($data);
        });

        $syncErrors = [];
        foreach (['paddle', 'stripe'] as $gateway) {
            try {
                if ($gateway === 'paddle') {
                    $discountService->syncToPaddle($discount);
                } else {
                    $discountService->syncToStripe($discount);
                }
            } catch (\Throwable $e) {
                Log::warning("Discount {$discount->code} {$gateway} sync failed: " . $e->getMessage());
                $syncErrors[$gateway] = $e->getMessage();
            }
        }

        return response()->json([
            'status' => 'created',
            'data' => $this->serialize($discount),
            'sync_errors' => $syncErrors,
        ], 201);
    }

    public function update(Request $request, $id, DiscountService $discountService)
    {
        $discount = Discount::findOrFail($id);
        $data = $this->validateDiscount($request, $discount);

        if (isset($data['code'])) {
            $data['code'] = strtoupper(trim($data['code']));
            $duplicate = Discount::where('code', $data['code'])->where('id', '!=', $discount->id)->exists();
            if ($duplicate) {
                return response()->json(['message' => 'A discount with this code already exists.'], 422);
            }
        }

        DB::connection('platform')->transaction(function () use ($discount, $data) {
            $discount->update($data);
        });

        $syncErrors = [];
        foreach (['paddle', 'stripe'] as $gateway) {
            try {
                if ($gateway === 'paddle') {
                    $discountService->syncToPaddle($discount);
                } else {
                    $discountService->syncToStripe($discount);
                }
            } catch (\Throwable $e) {
                Log::warning("Discount {$discount->code} {$gateway} sync failed: " . $e->getMessage());
                $syncErrors[$gateway] = $e->getMessage();
            }
        }

        return response()->json([
            'status' => 'updated',
            'data' => $this->serialize($discount),
            'sync_errors' => $syncErrors,
        ]);
    }

    public function sync(Request $request, $id, DiscountService $discountService)
    {
        $discount = Discount::findOrFail($id);
        $gateway = $request->input('gateway', 'paddle');

        try {
            $result = $gateway === 'paddle'
                ? $discountService->syncToPaddle($discount)
                : $discountService->syncToStripe($discount);

            return response()->json([
                'status' => 'synced',
                'gateway' => $gateway,
                'gateway_id' => $result,
                'data' => $this->serialize($discount),
                'message' => "Successfully synced to {$gateway}.",
            ]);
        } catch (\Throwable $e) {
            return response()->json(['message' => "Sync failed: " . $e->getMessage()], 400);
        }
    }

    public function destroy($id, DiscountService $discountService)
    {
        $discount = Discount::findOrFail($id);

        try {
            $discountService->archiveOnPaddle($discount);
        } catch (\Throwable $e) {
            Log::warning("Paddle archive failed for {$discount->code}: " . $e->getMessage());
        }

        try {
            $discountService->archiveOnStripe($discount);
        } catch (\Throwable $e) {
            Log::warning("Stripe archive failed for {$discount->code}: " . $e->getMessage());
        }

        DiscountRedemption::where('discount_id', $discount->id)->delete();
        $discount->delete();

        return response()->json(['status' => 'deleted']);
    }

    public function redemptions($id)
    {
        $discount = Discount::findOrFail($id);

        $redemptions = DiscountRedemption::where('discount_id', $discount->id)
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json($redemptions);
    }

    private function validateDiscount(Request $request, ?Discount $existing = null): array
    {
        $data = $request->validate([
            'code' => 'required|string|max:32|regex:/^[a-zA-Z0-9]+$/',
            'description' => 'nullable|string|max:500',
            'type' => 'required|in:percentage,fixed',
            'value' => ['required', 'numeric', 'min:0.01', $request->input('type') === 'percentage' ? 'max:100' : 'max:100000'],
            'currency_code' => 'nullable|string|max:3',
            'min_subtotal' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'restrict_to' => 'nullable|array',
            'restrict_to.scopes' => 'nullable|array',
            'restrict_to.scopes.*' => 'string|in:subscription,addon,theme',
            'restrict_to.plan_slugs' => 'nullable|array',
            'restrict_to.plan_slugs.*' => 'string|max:100',
            'restrict_to.addon_ids' => 'nullable|array',
            'restrict_to.addon_ids.*' => 'numeric',
            'restrict_to.template_ids' => 'nullable|array',
            'restrict_to.template_ids.*' => 'numeric',
            'usage_limit' => 'nullable|integer|min:1',
            'per_customer_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'sometimes|boolean',
            'is_recurring' => 'sometimes|boolean',
            'maximum_recurring_intervals' => 'nullable|integer|min:1',
        ]);

        $type = $data['type'] ?? ($existing?->type);
        if ($type === 'fixed' && empty($data['currency_code'])) {
            throw ValidationException::withMessages(['currency_code' => 'Currency code is required for fixed-amount discounts.']);
        }

        if (isset($data['restrict_to'])) {
            $data['restrict_to'] = array_filter($data['restrict_to']);
        }

        if ($existing) {
            return $data;
        }

        return array_merge([
            'is_active' => true,
            'is_recurring' => false,
            'restrict_to' => null,
            'usage_count' => 0,
        ], $data);
    }
}