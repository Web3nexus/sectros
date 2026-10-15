<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\MenuItem;
use App\Models\StaffProfile;
use App\Models\StaffMessage;
use App\Models\TipRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\NotificationController;
use Carbon\Carbon;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with('items.menuItem', 'table', 'staff.user');

        if ($request->has('kitchen_status') && !empty($request->kitchen_status)) {
            $query->where('kitchen_status', $request->kitchen_status);
        }

        if ($request->has('payment_status') && !empty($request->payment_status)) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->has('staff_profile_id') && !empty($request->staff_profile_id)) {
            $query->where('staff_profile_id', $request->staff_profile_id);
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(50)
        );
    }

    /**
     * Store a new in-house or POS order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_table_id' => 'nullable|exists:restaurant_tables,id',
            'table_code' => 'nullable|string|max:50',
            'staff_profile_id' => 'nullable|exists:staff_profiles,id',
            'customer_name' => 'nullable|string|max:255',
            'dining_mode' => 'nullable|string|in:dine_in,takeout,delivery',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.addons' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Auto-resolve staff profile if caller is a waiter/staff and not provided
            $staffProfileId = $validated['staff_profile_id'] ?? null;
            if (!$staffProfileId && $request->user()) {
                $staff = StaffProfile::where('user_id', $request->user()->id)->first();
                if ($staff) {
                    $staffProfileId = $staff->id;
                }
            }

            $order = Order::create([
                'restaurant_table_id' => $validated['restaurant_table_id'] ?? null,
                'table_code' => $validated['table_code'] ?? null,
                'staff_profile_id' => $staffProfileId,
                'customer_name' => $validated['customer_name'] ?? null,
                'dining_mode' => $validated['dining_mode'] ?? 'dine_in',
                'total_amount' => 0,
                'status' => 'pending',
                'kitchen_status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            $total = 0;

            foreach ($validated['items'] as $itemData) {
                $menuItem = MenuItem::find($itemData['menu_item_id']);
                $subtotal = (float) $menuItem->price * (int) $itemData['quantity'];
                
                $order->items()->create([
                    'menu_item_id' => $itemData['menu_item_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $menuItem->price,
                    'subtotal' => $subtotal,
                    'addons' => $itemData['addons'] ?? null,
                ]);

                $total += $subtotal;
            }

            $order->update(['total_amount' => $total]);

            $tableIdentifier = $order->table_code ? "Table {$order->table_code}" : ($order->table ? "Table {$order->table->name}" : 'In-House');

            // Dispatch alert to Kitchen View & Chefs
            NotificationController::dispatch(
                'kitchen',
                "New Kitchen Order: {$tableIdentifier}",
                "Order #{$order->id} for {$tableIdentifier} with " . count($validated['items']) . " item(s) has been placed.",
                'utensils',
                $order->id
            );

            // Send New Order Email to owner if configured
            $template = \App\Models\EmailTemplate::where('slug', 'new_order')->first();
            if ($template) {
                $businessName = tenant('business_name') ?? 'Your Business';
                $ownerEmail = tenant('owner_email');
                if ($ownerEmail) {
                    try {
                        \Illuminate\Support\Facades\Mail::to($ownerEmail)->send(new \App\Mail\SystemMail($template->subject, $template->content, [
                            'order_number' => $order->id,
                            'total_amount' => number_format($total, 2),
                            'business_name' => $businessName,
                            'items_count' => count($validated['items']),
                            'source' => "In-House Order ({$tableIdentifier})"
                        ]));
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error("Failed to send order email: " . $e->getMessage());
                    }
                }
            }

            return response()->json($order->load('items.menuItem', 'staff.user', 'table'), 201);
        });
    }

    /**
     * Display a specific order.
     */
    public function show(Order $order)
    {
        return response()->json($order->load('items.menuItem', 'table', 'staff.user', 'tips'));
    }

    /**
     * Update order status, kitchen workflow, or payment.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:pending,processing,completed,cancelled',
            'kitchen_status' => 'nullable|in:pending,accepted,preparing,ready,picked_up,served',
            'payment_status' => 'nullable|in:unpaid,partially_paid,paid',
            'payment_method' => 'nullable|string|in:cash,card,online,other',
            'tip_amount' => 'nullable|numeric|min:0',
        ]);

        $previousKitchenStatus = $order->kitchen_status;
        $tableIdentifier = $order->table_code ? "Table {$order->table_code}" : ($order->table ? "Table {$order->table->name}" : "Order #{$order->id}");

        // Handle Kitchen Transitions
        if (isset($validated['kitchen_status'])) {
            $ks = $validated['kitchen_status'];

            if (in_array($ks, ['accepted', 'preparing'])) {
                $validated['status'] = 'processing';
            } elseif ($ks === 'ready') {
                $validated['status'] = 'processing';

                // Alert the waiter who took the order!
                if ($order->staff_profile_id) {
                    try {
                        StaffMessage::create([
                            'tenant_id' => tenant('id'),
                            'staff_profile_id' => $order->staff_profile_id,
                            'sender_id' => auth()->id(),
                            'to_all' => false,
                            'subject' => "Order #{$order->id} is READY for Pickup!",
                            'body' => "Kitchen has marked Order #{$order->id} for {$tableIdentifier} as READY. Please pick it up from the kitchen and serve the guest.",
                        ]);
                    } catch (\Throwable $e) {}
                }

                // In-app alert for ready order
                NotificationController::dispatch(
                    'order',
                    "Order Ready: {$tableIdentifier}",
                    "Order #{$order->id} is ready for pickup and serving.",
                    'bell',
                    $order->id
                );

            } elseif ($ks === 'served') {
                $validated['served_at'] = Carbon::now();
                if ($order->payment_status === 'paid' || (isset($validated['payment_status']) && $validated['payment_status'] === 'paid')) {
                    $validated['status'] = 'completed';
                }
            }
        }

        // Handle Payment Collection
        if (isset($validated['payment_status']) && $validated['payment_status'] === 'paid') {
            $method = $validated['payment_method'] ?? $order->payment_method ?? 'cash';
            $validated['payment_method'] = $method;

            if ($method === 'cash') {
                $validated['cash_remitted'] = false;
            }

            if (($order->kitchen_status === 'served') || (isset($validated['kitchen_status']) && $validated['kitchen_status'] === 'served')) {
                $validated['status'] = 'completed';
            }

            // Tip Handling
            $tipAmount = isset($validated['tip_amount']) ? (float) $validated['tip_amount'] : 0.0;
            if ($tipAmount > 0) {
                $validated['tip_amount'] = $tipAmount;

                // Create tip record for the assigned staff profile
                if ($order->staff_profile_id) {
                    TipRecord::create([
                        'tenant_id' => tenant('id'),
                        'staff_profile_id' => $order->staff_profile_id,
                        'order_id' => $order->id,
                        'date' => Carbon::now()->toDateString(),
                        'amount' => $tipAmount,
                        'payout_status' => 'pending',
                        'payout_method' => $method,
                        'notes' => "Tip collected via {$method} for {$tableIdentifier}",
                    ]);

                    // Send notification to waiter of tip earned
                    try {
                        StaffMessage::create([
                            'tenant_id' => tenant('id'),
                            'staff_profile_id' => $order->staff_profile_id,
                            'sender_id' => auth()->id(),
                            'to_all' => false,
                            'subject' => "New Tip Received: $" . number_format($tipAmount, 2),
                            'body' => "You earned a tip of $" . number_format($tipAmount, 2) . " on {$tableIdentifier} (Order #{$order->id}).",
                        ]);
                    } catch (\Throwable $e) {}
                }
            }
        }

        $order->update($validated);

        // Notify on order completion
        if (isset($validated['status']) && $validated['status'] === 'completed') {
            NotificationController::dispatch(
                'order',
                'Order Completed',
                "Order #{$order->id} ({$tableIdentifier}) has been fully completed and paid.",
                'check-circle',
                $order->id
            );
        }

        return response()->json($order->fresh(['items.menuItem', 'table', 'staff.user', 'tips']));
    }

    /**
     * Mark cash collected for this order as remitted to the owner.
     */
    public function remitCash(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        if ($order->payment_method !== 'cash') {
            return response()->json(['error' => 'This order was not paid in cash.'], 422);
        }

        $order->update([
            'cash_remitted' => true,
            'cash_remitted_at' => Carbon::now(),
            'cash_remitted_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Cash for Order #{$order->id} marked as remitted.",
            'order' => $order,
        ]);
    }

    /**
     * Bulk remit all pending cash orders.
     */
    public function remitAllCash(Request $request)
    {
        $validated = $request->validate([
            'staff_profile_id' => 'nullable|exists:staff_profiles,id',
        ]);

        $query = Order::where('payment_method', 'cash')
            ->where('payment_status', 'paid')
            ->where('cash_remitted', false);

        if (!empty($validated['staff_profile_id'])) {
            $query->where('staff_profile_id', $validated['staff_profile_id']);
        }

        $count = $query->count();
        $totalAmount = (float) $query->sum('total_amount');

        $query->update([
            'cash_remitted' => true,
            'cash_remitted_at' => Carbon::now(),
            'cash_remitted_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Remitted {$count} cash order(s) totaling $" . number_format($totalAmount, 2),
            'count' => $count,
            'total_amount' => $totalAmount,
        ]);
    }

    /**
     * Summary of unremitted cash orders across staff.
     */
    public function unremittedCash(Request $request)
    {
        $orders = Order::where('payment_method', 'cash')
            ->where('payment_status', 'paid')
            ->where('cash_remitted', false)
            ->with('staff.user')
            ->orderBy('created_at', 'desc')
            ->get();

        $totalUnremitted = (float) $orders->sum('total_amount');

        $staffSummaries = $orders->groupBy('staff_profile_id')->map(function ($group, $staffId) {
            $first = $group->first();
            $staffName = $first?->staff?->user?->name ?? ($first?->staff?->name ?? 'Unassigned');
            return [
                'staff_profile_id' => $staffId,
                'staff_name' => $staffName,
                'count' => $group->count(),
                'total_amount' => (float) $group->sum('total_amount'),
            ];
        })->values();

        return response()->json([
            'total_unremitted' => $totalUnremitted,
            'orders_count' => $orders->count(),
            'orders' => $orders,
            'staff_breakdown' => $staffSummaries,
        ]);
    }

    /**
     * Public show endpoint for customers scanning the QR code on the table.
     */
    public function publicShow(Request $request, $id)
    {
        $order = Order::with('items.menuItem', 'table')->findOrFail($id);
        $tenant = tenant();

        return response()->json([
            'order' => [
                'id' => $order->id,
                'table_code' => $order->table_code ?? ($order->table ? $order->table->name : null),
                'dining_mode' => $order->dining_mode,
                'status' => $order->status,
                'kitchen_status' => $order->kitchen_status,
                'payment_status' => $order->payment_status,
                'total_amount' => (float) $order->total_amount,
                'tip_amount' => (float) $order->tip_amount,
                'items' => $order->items->map(function ($it) {
                    return [
                        'name' => $it->menuItem ? $it->menuItem->name : 'Item',
                        'quantity' => $it->quantity,
                        'unit_price' => (float) $it->unit_price,
                        'subtotal' => (float) $it->subtotal,
                        'addons' => $it->addons,
                    ];
                }),
            ],
            'business' => [
                'name' => $tenant->business_name ?? ($tenant->name ?? 'Sectros Restaurant'),
                'currency' => $tenant->currency ?? '$',
            ],
        ]);
    }

    /**
     * Public pay endpoint when a customer pays via their mobile phone.
     */
    public function publicPay(Request $request, $id)
    {
        $validated = $request->validate([
            'tip_amount' => 'nullable|numeric|min:0',
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'payment_method' => 'nullable|string|in:card,apple_pay,google_pay,online',
        ]);

        $order = Order::findOrFail($id);

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'This order has already been paid.'], 400);
        }

        $tipAmount = isset($validated['tip_amount']) ? (float) $validated['tip_amount'] : 0.0;
        $method = $validated['payment_method'] ?? 'card';

        $order->update([
            'payment_status' => 'paid',
            'payment_method' => $method,
            'tip_amount' => $tipAmount,
            'customer_name' => $validated['customer_name'] ?? $order->customer_name,
            'status' => ($order->kitchen_status === 'served') ? 'completed' : $order->status,
        ]);

        // Record Tip for staff waiter
        if ($tipAmount > 0 && $order->staff_profile_id) {
            TipRecord::create([
                'tenant_id' => tenant('id'),
                'staff_profile_id' => $order->staff_profile_id,
                'order_id' => $order->id,
                'date' => Carbon::now()->toDateString(),
                'amount' => $tipAmount,
                'payout_status' => 'pending',
                'payout_method' => $method,
                'notes' => "Mobile QR payment tip on Order #{$order->id}",
            ]);

            // Notify staff of tip
            try {
                StaffMessage::create([
                    'tenant_id' => tenant('id'),
                    'staff_profile_id' => $order->staff_profile_id,
                    'sender_id' => null,
                    'to_all' => false,
                    'subject' => "New Tip Received: $" . number_format($tipAmount, 2),
                    'body' => "Guest paid via Mobile QR code on Order #{$order->id} and left a tip of $" . number_format($tipAmount, 2) . "!",
                ]);
            } catch (\Throwable $e) {}
        }

        // Notify management
        NotificationController::dispatch(
            'order',
            "Order #{$order->id} Paid via Mobile",
            "Payment received for Order #{$order->id}: $" . number_format((float) $order->total_amount, 2) . " (Tip: $" . number_format($tipAmount, 2) . ")",
            'credit-card',
            $order->id
        );

        // Send Review Request email or SMS if customer provided contact
        $customerEmail = $validated['customer_email'] ?? null;
        $customerPhone = $validated['customer_phone'] ?? null;
        $customerName = $validated['customer_name'] ?? 'Valued Guest';

        if ($customerEmail || $customerPhone) {
            $tenant = tenant();
            $appUrl = config('app.url', 'https://sectros.com');
            $scheme = parse_url((string) $appUrl, PHP_URL_SCHEME) ?: 'https';
            $centralHost = trim((string) (parse_url((string) $appUrl, PHP_URL_HOST) ?: ''), '.');
            $domain = $tenant ? $tenant->publicWebsiteDomain() : null;
            $domain ??= $tenant ? ($tenant->id . '.' . $centralHost) : $centralHost;

            $reviewLink = $scheme . '://' . $domain . '/review?order=' . $order->id . '&tenant=' . ($tenant->id ?? $order->tenant_id);
            $businessName = tenant('business_name') ?? 'The Business';

            if ($customerEmail) {
                $template = \App\Models\EmailTemplate::where('slug', 'guest_review_request')->first();
                $subject = $template ? $template->subject : "How was your meal at {$businessName}?";
                $content = $template ? $template->content : "<p>Thank you for dining with us! <a href='{review_link}'>Leave a review</a></p>";

                try {
                    \Illuminate\Support\Facades\Mail::to($customerEmail)->send(
                        new \App\Mail\SystemMail($subject, $content, [
                            'customer_name' => $customerName,
                            'business_name' => $businessName,
                            'review_link'   => $reviewLink,
                        ])
                    );
                } catch (\Throwable $e) {}
            }

            if ($customerPhone) {
                try {
                    \App\Services\SMSService::send(
                        $customerPhone,
                        "Hi {$customerName}, thank you for dining at {$businessName}! We'd love your feedback: {$reviewLink}",
                        $order->tenant_id ?? tenant('id')
                    );
                } catch (\Throwable $e) {}
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment successful. Thank you!',
            'order' => $order->fresh(),
        ]);
    }
}
