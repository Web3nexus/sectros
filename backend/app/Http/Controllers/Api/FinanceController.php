<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Expense;
use App\Models\SettlementRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinanceController extends Controller
{
    private function dateFromPeriod(?string $period): ?Carbon
    {
        $now = Carbon::now();
        return match ($period) {
            'today' => $now->copy()->startOfDay(),
            'week' => $now->copy()->startOfWeek(),
            'month' => $now->copy()->startOfMonth(),
            'year' => $now->copy()->startOfYear(),
            default => null,
        };
    }

    private function sanitizeCsvField($value)
    {
        if (empty($value)) return $value;
        $dangerous = ['=', '+', '-', '@', "\t", "\r"];
        if (in_array(substr((string) $value, 0, 1), $dangerous)) {
            return "'" . $value;
        }
        return $value;
    }

    public function overview(Request $request)
    {
        $period = $request->query('period', 'all');
        $dateFrom = $this->dateFromPeriod($period);

        $revenueQuery = Order::query();
        $expenseQuery = Expense::query();
        $catQuery = Expense::query();

        if ($dateFrom) {
            $revenueQuery->where('created_at', '>=', $dateFrom);
            $expenseQuery->where('expense_date', '>=', $dateFrom);
            $catQuery->where('expense_date', '>=', $dateFrom);
        }

        $totalRevenue = (float) $revenueQuery->sum('total_amount');
        $orderCount = $revenueQuery->count();
        $totalExpenses = (float) $expenseQuery->sum('amount');
        $netProfit = $totalRevenue - $totalExpenses;

        $latestSettlement = SettlementRecord::orderBy('date', 'desc')->first();

        $categoryBreakdown = $catQuery
            ->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->get();

        return response()->json([
            'balance' => $latestSettlement ? (float) $latestSettlement->closing_balance : 0,
            'total_revenue' => $totalRevenue,
            'total_expenses' => $totalExpenses,
            'net_profit' => $netProfit,
            'order_count' => $orderCount,
            'aov' => $orderCount > 0 ? round($totalRevenue / $orderCount, 2) : 0,
            'profit_margin' => $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100, 1) : 0,
            'category_breakdown' => $categoryBreakdown,
            'latest_settlement' => $latestSettlement,
        ]);
    }

    public function transactions(Request $request)
    {
        $page = (int) $request->query('page', 1);
        $perPage = 20;
        $dateFrom = $this->dateFromPeriod($request->query('period'));
        $dateFromInput = $request->query('from');
        $dateTo = $request->query('to');

        $ordersQuery = Order::select(
            'id',
            'total_amount as amount',
            'created_at',
            'customer_name',
            'status',
            'payment_status',
            'branch_id'
        );
        if ($dateFrom) $ordersQuery->where('created_at', '>=', $dateFrom);
        if ($dateFromInput) $ordersQuery->where('created_at', '>=', $dateFromInput);
        if ($dateTo) $ordersQuery->where('created_at', '<=', $dateTo);

        $orders = $ordersQuery->get()->map(fn ($o) => [
            'id' => 'ORD-' . $o->id,
            'type' => 'income',
            'description' => 'Order #' . $o->id . ($o->customer_name ? " - {$o->customer_name}" : ''),
            'amount' => (float) $o->amount,
            'date' => $o->created_at,
            'category' => 'Order',
            'status' => $o->payment_status,
        ]);

        $expensesQuery = Expense::select(
            'id',
            'amount',
            'expense_date as created_at',
            'description',
            'category'
        );
        if ($dateFrom) $expensesQuery->where('expense_date', '>=', $dateFrom);
        if ($dateFromInput) $expensesQuery->where('expense_date', '>=', $dateFromInput);
        if ($dateTo) $expensesQuery->where('expense_date', '<=', $dateTo);

        $expenses = $expensesQuery->get()->map(fn ($e) => [
            'id' => 'EXP-' . $e->id,
            'type' => 'expense',
            'description' => $e->description,
            'amount' => (float) $e->amount,
            'date' => $e->created_at,
            'category' => $e->category ?? 'Other',
            'status' => 'paid',
        ]);

        $all = $orders->merge($expenses)->sortByDesc('date')->values();

        $total = $all->count();
        $totalPages = max(1, (int) ceil($total / $perPage));
        $offset = ($page - 1) * $perPage;
        $items = $all->slice($offset, $perPage)->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $page,
                'last_page' => $totalPages,
                'per_page' => $perPage,
                'total' => $total,
            ],
        ]);
    }

    public function revenueTrend(Request $request)
    {
        $days = min((int) $request->query('days', 30), 365);
        $start = Carbon::now()->subDays($days - 1)->startOfDay();

        $dailyRevenue = Order::where('created_at', '>=', $start)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $trend = collect();
        for ($i = 0; $i < $days; $i++) {
            $date = $start->copy()->addDays($i)->format('Y-m-d');
            $dayData = $dailyRevenue->get($date);
            $trend->push([
                'date' => $date,
                'revenue' => (float) ($dayData->revenue ?? 0),
                'orders' => (int) ($dayData->orders ?? 0),
            ]);
        }

        $totalRevenue = $trend->sum('revenue');
        $totalOrders = $trend->sum('orders');
        $avgDaily = $days > 0 ? round($totalRevenue / $days, 2) : 0;

        return response()->json([
            'trend' => $trend,
            'total_revenue' => round($totalRevenue, 2),
            'total_orders' => $totalOrders,
            'avg_daily_revenue' => $avgDaily,
            'days' => $days,
        ]);
    }

    public function settlements(Request $request)
    {
        $perPage = min((int) $request->query('per_page', 20), 100);
        $dateFrom = $this->dateFromPeriod($request->query('period'));

        $query = SettlementRecord::with('staff');
        if ($dateFrom) $query->where('date', '>=', $dateFrom);

        return response()->json(
            $query->orderBy('date', 'desc')->paginate($perPage)
        );
    }

    public function export(Request $request)
    {
        $type = $request->query('type', 'transactions');
        $dateFrom = $request->query('from');
        $dateTo = $request->query('to');
        $now = Carbon::now()->format('Y-m-d_His');
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$type}_{$now}.csv\"",
        ];

        $callback = function () use ($type, $dateFrom, $dateTo) {
            $handle = fopen('php://output', 'w');

            if ($type === 'transactions') {
                fputcsv($handle, ['ID', 'Type', 'Description', 'Amount', 'Date', 'Category', 'Status']);

                $ordersQuery = Order::select('id', 'total_amount', 'created_at', 'customer_name', 'status', 'payment_status');
                if ($dateFrom) $ordersQuery->where('created_at', '>=', $dateFrom);
                if ($dateTo) $ordersQuery->where('created_at', '<=', $dateTo);
                $ordersQuery->each(function ($o) use ($handle) {
                    fputcsv($handle, [
                        'ORD-' . $o->id, 'Income',
                        $this->sanitizeCsvField('Order #' . $o->id . ($o->customer_name ? " - {$o->customer_name}" : '')),
                        $o->total_amount, $o->created_at, 'Order', $o->payment_status,
                    ]);
                });

                $expensesQuery = Expense::select('id', 'amount', 'expense_date', 'description', 'category');
                if ($dateFrom) $expensesQuery->where('expense_date', '>=', $dateFrom);
                if ($dateTo) $expensesQuery->where('expense_date', '<=', $dateTo);
                $expensesQuery->each(function ($e) use ($handle) {
                    fputcsv($handle, [
                        'EXP-' . $e->id, 'Expense',
                        $this->sanitizeCsvField($e->description), $e->amount, $e->expense_date, $e->category ?? 'Other', 'paid',
                    ]);
                });
            } elseif ($type === 'settlements') {
                fputcsv($handle, ['Date', 'Opening Balance', 'Cash Collected', 'Card Collected', 'Tips', 'Expenses', 'Closing Balance', 'Net Total', 'Discrepancy', 'Notes']);

                $settlementsQuery = SettlementRecord::orderBy('date', 'desc');
                if ($dateFrom) $settlementsQuery->where('date', '>=', $dateFrom);
                if ($dateTo) $settlementsQuery->where('date', '<=', $dateTo);
                $settlementsQuery->each(function ($s) use ($handle) {
                    fputcsv($handle, [
                        $s->date, $s->opening_balance, $s->cash_collected, $s->card_collected,
                        $s->tips_collected, $s->expenses_total, $s->closing_balance,
                        $s->net_total, $s->discrepancy, $this->sanitizeCsvField($s->notes),
                    ]);
                });
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
