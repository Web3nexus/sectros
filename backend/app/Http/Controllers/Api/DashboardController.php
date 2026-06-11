<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\Expense;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function comparison()
    {
        try {
            $branches = Branch::where('is_active', true)->get();
            $comparison = $branches->map(function ($branch) {
                $today = Carbon::today();
                
                $revenue = Order::where('branch_id', $branch->id)->sum('total_amount');
                $reservations = Reservation::where('branch_id', $branch->id)
                    ->whereDate('reservation_time', $today)
                    ->count();
                $staffCount = StaffProfile::where('branch_id', $branch->id)->count();
                
                return [
                    'branch_id' => $branch->id,
                    'branch_name' => $branch->name,
                    'revenue' => (float) $revenue,
                    'active_reservations' => $reservations,
                    'staff_count' => $staffCount,
                    'occupancy' => $branch->tables()->count() > 0 ? round(($reservations / $branch->tables()->count()) * 100, 1) : 0
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
            
            // Resilience: Check for tables before querying
            $totalRevenue = 0;
            $orderCount = 0;
            $recentOrders = [];

            if (\Illuminate\Support\Facades\Schema::hasTable('orders')) {
                $query = Order::query();
                if ($branchId) $query->where('branch_id', $branchId);
                
                $totalRevenue = $query->sum('total_amount');
                $orderCount = $query->count();
                $recentOrders = $query->orderBy('created_at', 'desc')->limit(5)->get();
            }

            $aov = $orderCount > 0 ? $totalRevenue / $orderCount : 0;
            
            $activeReservations = 0;
            if (\Illuminate\Support\Facades\Schema::hasTable('reservations')) {
                $resQuery = Reservation::where('status', 'confirmed')
                    ->whereDate('reservation_time', $today);
                
                if ($branchId) $resQuery->where('branch_id', $branchId);
                
                $activeReservations = $resQuery->count();
            }
                
            $totalExpenses = 0;
            if (\Illuminate\Support\Facades\Schema::hasTable('expenses')) {
                // Expenses are currently global in this schema, but could be branch-specific
                $totalExpenses = Expense::sum('amount');
            }
            
            // Tables / Resources
            $tables = [];
            if (\Illuminate\Support\Facades\Schema::hasTable('restaurant_tables')) {
                $tableQuery = \App\Models\RestaurantTable::query();
                if ($branchId) $tableQuery->where('branch_id', $branchId);
                $tables = $tableQuery->get();
            }

            // Real Top Items
            $formattedTopItems = [];
            if (\Illuminate\Support\Facades\Schema::hasTable('order_items') && \Illuminate\Support\Facades\Schema::hasTable('menu_items')) {
                $topItemsQuery = OrderItem::query()
                    ->select('menu_item_id', \DB::raw('SUM(quantity) as total_qty'))
                    ->groupBy('menu_item_id');
                
                if ($branchId) {
                    $topItemsQuery->whereHas('order', function($q) use ($branchId) {
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
                        'color' => $colors[$index] ?? 'bg-blue-400'
                    ];
                });
            }
            
            // Waitlist
            $waitlistCount = 0;
            if (\Illuminate\Support\Facades\Schema::hasTable('waitlists')) {
                $waitlistCount = \App\Models\Waitlist::where('status', 'waiting')->count();
            }

            // Multi-day / Hotels
            $upcomingCheckouts = 0;
            if (\Illuminate\Support\Facades\Schema::hasTable('reservations')) {
                $upcomingCheckouts = Reservation::whereDate('end_time', $today)
                    ->where('status', 'confirmed')
                    ->count();
            }
            
            return response()->json([
                'metrics' => [
                    'total_revenue' => (float)$totalRevenue,
                    'aov' => (float)$aov,
                    'active_reservations' => (int)$activeReservations,
                    'waitlist_count' => (int)$waitlistCount,
                    'upcoming_checkouts' => (int)$upcomingCheckouts,
                    'total_expenses' => (float)$totalExpenses,
                    'net_profit' => (float)($totalRevenue - $totalExpenses)
                ],
                'recent_orders' => $recentOrders,
                'tables' => $tables,
                'top_items' => $formattedTopItems
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Dashboard Stats Error: ' . $e->getMessage());
            return response()->json([
                'metrics' => ['total_revenue' => 0, 'aov' => 0, 'active_reservations' => 0, 'total_expenses' => 0, 'net_profit' => 0],
                'recent_orders' => [],
                'tables' => [],
                'top_items' => []
            ]);
        }
    }
}
