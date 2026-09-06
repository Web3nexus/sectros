<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyCash;
use App\Models\Order;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DailyCashController extends Controller
{
    /**
     * Get monthly Kassenbuch records & missing days analysis.
     */
    public function index(Request $request): JsonResponse
    {
        $month = $request->query('month', Carbon::now()->format('Y-m'));
        $startDate = Carbon::parse($month . '-01')->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        if ($endDate->isFuture()) {
            $endDate = Carbon::now()->endOfDay();
        }

        $records = DailyCash::whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->orderBy('date', 'desc')
            ->get();

        // Calculate missing days
        $recordedDates = $records->pluck('date')->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))->toArray();
        $missingDays = [];
        $current = $startDate->copy();
        while ($current->lte($endDate)) {
            $formatted = $current->format('Y-m-d');
            if (!in_array($formatted, $recordedDates)) {
                $missingDays[] = $formatted;
            }
            $current->addDay();
        }

        $totalCash = $records->sum('cash_sales');
        $totalCard = $records->sum('card_sales');
        $totalVat7 = $records->sum('vat_7_amount');
        $totalVat19 = $records->sum('vat_19_amount');
        $totalTips = $records->sum('tips_surplus');

        return response()->json([
            'records' => $records,
            'summary' => [
                'total_cash' => round($totalCash, 2),
                'total_card' => round($totalCard, 2),
                'total_sales' => round($totalCash + $totalCard, 2),
                'total_vat_7' => round($totalVat7, 2),
                'total_vat_19' => round($totalVat19, 2),
                'total_tips' => round($totalTips, 2),
                'days_recorded' => count($recordedDates),
                'missing_days_count' => count($missingDays),
            ],
            'missing_days' => $missingDays,
        ]);
    }

    /**
     * Create or update a Daily Cash Closing (Z-Bon).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'opening_float' => 'required|numeric|min:0',
            'cash_sales' => 'required|numeric|min:0',
            'card_sales' => 'required|numeric|min:0',
            'counted_cash' => 'required|numeric|min:0',
            'vat_7_amount' => 'nullable|numeric|min:0',
            'vat_19_amount' => 'nullable|numeric|min:0',
            'tips_surplus' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:draft,closed,verified',
        ]);

        $totalSales = $validated['cash_sales'] + $validated['card_sales'];

        // Auto calculate VAT splits if omitted (default ~70% 19% VAT, 30% 7% VAT standard estimation)
        $vat7 = $validated['vat_7_amount'] ?? round($totalSales * 0.3 * (7 / 107), 2);
        $vat19 = $validated['vat_19_amount'] ?? round($totalSales * 0.7 * (19 / 119), 2);

        $record = DailyCash::updateOrCreate(
            ['date' => $validated['date']],
            [
                'opening_float' => $validated['opening_float'],
                'cash_sales' => $validated['cash_sales'],
                'card_sales' => $validated['card_sales'],
                'counted_cash' => $validated['counted_cash'],
                'total_sales' => round($totalSales, 2),
                'vat_7_amount' => $vat7,
                'vat_19_amount' => $vat19,
                'tips_surplus' => $validated['tips_surplus'] ?? 0,
                'notes' => $validated['notes'] ?? null,
                'status' => $validated['status'] ?? 'closed',
                'verified_by' => $request->user()?->id,
            ]
        );

        return response()->json([
            'message' => 'Daily Z-Bon closing saved successfully.',
            'record' => $record,
        ], 201);
    }

    /**
     * Auto-aggregate today's live orders to populate Z-Bon draft.
     */
    public function draftToday(Request $request): JsonResponse
    {
        $date = $request->query('date', Carbon::today()->format('Y-m-d'));
        $dayStart = Carbon::parse($date)->startOfDay();
        $dayEnd = Carbon::parse($date)->endOfDay();

        $orders = Order::whereBetween('created_at', [$dayStart, $dayEnd])
            ->where('payment_status', 'paid')
            ->get();

        $cashSales = (float) $orders->where('payment_method', 'cash')->sum('total_amount');
        $cardSales = (float) $orders->where('payment_method', 'card')->sum('total_amount');
        
        // If payment_method isn't explicitly split, provide total
        if ($cashSales == 0 && $cardSales == 0) {
            $total = (float) $orders->sum('total_amount');
            $cardSales = round($total * 0.65, 2);
            $cashSales = round($total * 0.35, 2);
        }

        $totalSales = $cashSales + $cardSales;
        $vat7 = round($totalSales * 0.3 * (7 / 107), 2);
        $vat19 = round($totalSales * 0.7 * (19 / 119), 2);

        // Previous closing float
        $previousClosing = DailyCash::where('date', '<', $date)
            ->orderBy('date', 'desc')
            ->first();
        $openingFloat = $previousClosing ? $previousClosing->opening_float : 200.00;

        return response()->json([
            'date' => $date,
            'opening_float' => $openingFloat,
            'cash_sales' => $cashSales,
            'card_sales' => $cardSales,
            'total_sales' => $totalSales,
            'vat_7_amount' => $vat7,
            'vat_19_amount' => $vat19,
            'expected_cash_in_drawer' => round($openingFloat + $cashSales, 2),
            'order_count' => $orders->count(),
        ]);
    }
}

