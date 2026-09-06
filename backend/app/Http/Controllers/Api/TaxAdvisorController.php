<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaxAdvisor;
use App\Models\TaxAdvisorAccess;
use App\Models\AdvisorBill;
use App\Models\DailyCash;
use App\Models\Expense;
use App\Models\Order;
use App\Models\Payslip;
use App\Models\SickNote;
use App\Models\AttendanceLog;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TaxAdvisorController extends Controller
{
    /**
     * Authenticate a tax advisor.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $advisor = TaxAdvisor::where('email', $validated['email'])->first();

        if (!$advisor || !Hash::check($validated['password'], $advisor->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        $token = $advisor->createToken('tax-advisor-token')->plainTextToken;

        return response()->json([
            'advisor' => $advisor,
            'token' => $token,
            'message' => 'Welcome to the Tax Advisor Portal.',
        ]);
    }

    /**
     * Register a new tax consultant account.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:tax_advisors,email',
            'password' => 'required|string|min:8',
            'company_name' => 'required|string|max:255',
            'phone' => 'nullable|string',
        ]);

        $advisor = TaxAdvisor::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'company_name' => $validated['company_name'],
            'phone' => $validated['phone'] ?? null,
        ]);

        $token = $advisor->createToken('tax-advisor-token')->plainTextToken;

        return response()->json([
            'advisor' => $advisor,
            'token' => $token,
            'message' => 'Tax advisor account created successfully.',
        ], 201);
    }

    /**
     * List all client restaurants assigned to this tax advisor.
     */
    public function clients(Request $request): JsonResponse
    {
        $advisor = $request->user();
        if (!$advisor) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $accesses = TaxAdvisorAccess::where('tax_advisor_id', $advisor->id)
            ->where('status', 'active')
            ->get();

        $tenantIds = $accesses->pluck('tenant_id')->toArray();
        $tenants = Tenant::whereIn('id', $tenantIds)->get();

        // If no linked tenants yet, allow demo/first tenant for onboarding
        if ($tenants->isEmpty()) {
            $defaultTenant = Tenant::first();
            if ($defaultTenant) {
                TaxAdvisorAccess::create([
                    'tax_advisor_id' => $advisor->id,
                    'tenant_id' => $defaultTenant->id,
                    'status' => 'active',
                    'permissions' => ['cash_book', 'payroll', 'receipts', 'datev_export'],
                ]);
                $tenants = collect([$defaultTenant]);
            }
        }

        return response()->json([
            'clients' => $tenants->map(fn($t) => [
                'id' => $t->id,
                'business_name' => $t->business_name ?? $t->id,
                'owner_email' => $t->owner_email,
                'status' => $t->status,
                'country' => $t->data['country'] ?? 'DE',
            ]),
        ]);
    }

    /**
     * Get financial data for a specific client tenant (Kassenbuch, Z-Bons, VAT summary, sick notes, payslips).
     */
    public function clientData(Request $request, string $tenantId): JsonResponse
    {
        $month = $request->query('month', Carbon::now()->format('Y-m'));
        $startDate = Carbon::parse($month . '-01')->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $dailyCashes = DailyCash::allTenants()
            ->where('tenant_id', $tenantId)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->orderBy('date', 'desc')
            ->get();

        $expenses = Expense::allTenants()
            ->where('tenant_id', $tenantId)
            ->whereBetween('expense_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->orderBy('expense_date', 'desc')
            ->get();

        $sickNotes = SickNote::allTenants()
            ->where('tenant_id', $tenantId)
            ->whereBetween('start_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->with('staffProfile')
            ->get();

        $payslips = Payslip::allTenants()
            ->where('tenant_id', $tenantId)
            ->where('period_month', $month)
            ->with('staffProfile')
            ->get();

        $totalCash = $dailyCashes->sum('cash_sales');
        $totalCard = $dailyCashes->sum('card_sales');
        $totalGross = $totalCash + $totalCard;
        $totalVat7 = $dailyCashes->sum('vat_7_amount');
        $totalVat19 = $dailyCashes->sum('vat_19_amount');
        $totalExpenses = $expenses->sum('amount');

        return response()->json([
            'tenant_id' => $tenantId,
            'month' => $month,
            'summary' => [
                'gross_revenue' => round($totalGross, 2),
                'cash_sales' => round($totalCash, 2),
                'card_sales' => round($totalCard, 2),
                'total_vat_7' => round($totalVat7, 2),
                'total_vat_19' => round($totalVat19, 2),
                'total_expenses' => round($totalExpenses, 2),
                'z_bon_count' => $dailyCashes->count(),
                'expense_receipts_count' => $expenses->count(),
            ],
            'daily_cashes' => $dailyCashes,
            'expenses' => $expenses,
            'sick_notes' => $sickNotes,
            'payslips' => $payslips,
        ]);
    }

    /**
     * Export certified DATEV CSV / Standard CSV.
     */
    public function exportDatev(Request $request, string $tenantId)
    {
        $month = $request->query('month', Carbon::now()->format('Y-m'));
        $startDate = Carbon::parse($month . '-01')->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $dailyCashes = DailyCash::allTenants()
            ->where('tenant_id', $tenantId)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->orderBy('date', 'asc')
            ->get();

        $filename = "DATEV_CashBook_{$tenantId}_{$month}.csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($dailyCashes, $month) {
            $handle = fopen('php://output', 'w');
            // DATEV Format Header
            fputs($handle, "\xEF\xBB\xBF"); // UTF-8 BOM
            fputcsv($handle, ['EXTF', '700', '21', 'Kassenbuch', '1', date('YmdHis'), '', '', '', '', '', '', '']);
            fputcsv($handle, ['Datum', 'Umsatz_Brutto', 'Soll_Haben', 'Konto', 'Gegenkonto', 'BU_Schluessel', 'Belegtext', 'MwSt_7', 'MwSt_19', 'Bar', 'Unbar']);

            foreach ($dailyCashes as $dc) {
                $dateFormatted = Carbon::parse($dc->date)->format('d.m.Y');
                fputcsv($handle, [
                    $dateFormatted,
                    number_format((float) $dc->total_sales, 2, ',', ''),
                    'H',
                    '1000', // Kasse
                    '8400', // Erloese 19%
                    '',
                    "Tagesabschluss Z-Bon {$dateFormatted}",
                    number_format((float) $dc->vat_7_amount, 2, ',', ''),
                    number_format((float) $dc->vat_19_amount, 2, ',', ''),
                    number_format((float) $dc->cash_sales, 2, ',', ''),
                    number_format((float) $dc->card_sales, 2, ',', ''),
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Upload tax consultant's own fee bill for the restaurant.
     */
    public function uploadBill(Request $request, string $tenantId): JsonResponse
    {
        $validated = $request->validate([
            'invoice_number' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'bill_date' => 'required|date',
            'notes' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $advisor = $request->user();
        $fileUrl = null;
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('advisor_bills', 'public');
            $fileUrl = '/storage/' . $path;
        }

        $bill = AdvisorBill::create([
            'tax_advisor_id' => $advisor?->id ?? 1,
            'tenant_id' => $tenantId,
            'invoice_number' => $validated['invoice_number'],
            'amount' => $validated['amount'],
            'bill_date' => $validated['bill_date'],
            'file_url' => $fileUrl,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Advisor bill uploaded successfully.',
            'bill' => $bill,
        ], 201);
    }
}

