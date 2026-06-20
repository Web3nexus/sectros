<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\Expense;
use App\Models\OrderItem;
use App\Models\Branch;
use App\Models\StaffProfile;
use App\Models\RestaurantTable;
use App\Models\Waitlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function comparison()
    {
        try {
            $branches = Branch::where('is_active', true)->withCount('tables')->get();

            $today = Carbon::today();

            $dailyReservations = Reservation::whereDate('reservation_time', $today)
                ->whereIn('branch_id', $branches->pluck('id'))
                ->selectRaw('branch_id, COUNT(*) as count')
                ->groupBy('branch_id')
                ->pluck('count', 'branch_id');

            $dailyRevenue = Order::whereDate('created_at', $today)
                ->whereIn('branch_id', $branches->pluck('id'))
                ->selectRaw('branch_id, SUM(total_amount) as revenue')
                ->groupBy('branch_id')
                ->pluck('revenue', 'branch_id');

            $staffCounts = StaffProfile::whereIn('branch_id', $branches->pluck('id'))
                ->selectRaw('branch_id, COUNT(*) as count')
                ->groupBy('branch_id')
                ->pluck('count', 'branch_id');

            $comparison = $branches->map(function ($branch) use ($dailyRevenue, $dailyReservations, $staffCounts) {
                $reservations = (int) ($dailyReservations[$branch->id] ?? 0);
                return [
                    'branch_id' => $branch->id,
                    'branch_name' => $branch->name,
                    'revenue' => (float) ($dailyRevenue[$branch->id] ?? 0),
                    'active_reservations' => $reservations,
                    'staff_count' => (int) ($staffCounts[$branch->id] ?? 0),
                    'occupancy' => $branch->tables_count > 0 ? round(($reservations / $branch->tables_count) * 100, 1) : 0,
                ];
            });

            return response()->json($comparison);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function stats(Request $request)
    {
        try {
            $today = Carbon::today();
            $branchId = $request->query('branch_id');

            $totalRevenue = 0;
            $orderCount = 0;
            $recentOrders = [];

            if (Schema::hasTable('orders')) {
                $query = Order::with('items.menuItem', 'table');
                if ($branchId) $query->where('branch_id', $branchId);

                $totalRevenue = (float) $query->sum('total_amount');
                $orderCount = $query->count();

                $recentOrders = (clone $query)->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get();
            }

            $aov = $orderCount > 0 ? $totalRevenue / $orderCount : 0;

            $activeReservations = 0;
            if (Schema::hasTable('reservations')) {
                $resQuery = Reservation::where('status', 'confirmed')
                    ->whereDate('reservation_time', $today);
                if ($branchId) $resQuery->where('branch_id', $branchId);
                $activeReservations = $resQuery->count();
            }

            $totalExpenses = 0;
            if (Schema::hasTable('expenses')) {
                $expenseQuery = Expense::query();
                if ($branchId) $expenseQuery->where('branch_id', $branchId);
                $totalExpenses = (float) $expenseQuery->sum('amount');
            }

            $tables = [];
            if (Schema::hasTable('restaurant_tables')) {
                $tableQuery = RestaurantTable::query();
                if ($branchId) $tableQuery->where('branch_id', $branchId);
                $tables = $tableQuery->get();
            }

            $formattedTopItems = [];
            if (Schema::hasTable('order_items') && Schema::hasTable('menu_items')) {
                $topItemsQuery = OrderItem::query()
                    ->select('menu_item_id', \DB::raw('SUM(quantity) as total_qty'))
                    ->groupBy('menu_item_id');

                if ($branchId) {
                    $topItemsQuery->whereHas('order', function ($q) use ($branchId) {
                        $q->where('branch_id', $branchId);
                    });
                }

                $topItems = $topItemsQuery->orderBy('total_qty', 'desc')
                    ->limit(4)
                    ->with('menuItem')
                    ->get();

                $maxQty = $topItems->max('total_qty') ?: 1;

                $formattedTopItems = $topItems->map(function ($item, $index) use ($maxQty) {
                    $colors = ['bg-blue-600', 'bg-blue-500', 'bg-emerald-500', 'bg-slate-300'];
                    return [
                        'name' => $item->menuItem->name ?? 'Unknown',
                        'progress' => round(($item->total_qty / $maxQty) * 100) . '%',
                        'color' => $colors[$index] ?? 'bg-blue-400',
                    ];
                });
            }

            $waitlistCount = 0;
            if (Schema::hasTable('waitlists')) {
                $waitlistQuery = Waitlist::where('status', 'waiting');
                if ($branchId) $waitlistQuery->where('branch_id', $branchId);
                $waitlistCount = $waitlistQuery->count();
            }

            $upcomingCheckouts = 0;
            if (Schema::hasTable('reservations')) {
                $checkoutQuery = Reservation::whereDate('end_time', $today)
                    ->where('status', 'confirmed');
                if ($branchId) $checkoutQuery->where('branch_id', $branchId);
                $upcomingCheckouts = $checkoutQuery->count();
            }

            return response()->json([
                'metrics' => [
                    'total_revenue' => $totalRevenue,
                    'aov' => $aov,
                    'active_reservations' => $activeReservations,
                    'waitlist_count' => $waitlistCount,
                    'upcoming_checkouts' => $upcomingCheckouts,
                    'total_expenses' => $totalExpenses,
                    'net_profit' => $totalRevenue - $totalExpenses,
                ],
                'recent_orders' => $recentOrders,
                'tables' => $tables,
                'top_items' => $formattedTopItems,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Dashboard Stats Error: ' . $e->getMessage());
            return response()->json([
                'metrics' => ['total_revenue' => 0, 'aov' => 0, 'active_reservations' => 0, 'total_expenses' => 0, 'net_profit' => 0],
                'recent_orders' => [],
                'tables' => [],
                'top_items' => [],
            ]);
        }
    }
}
