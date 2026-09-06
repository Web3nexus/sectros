<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductCatalog;
use App\Models\SupplierInvoice;
use App\Models\SupplierInvoiceItem;
use App\Models\PriceHistory;
use App\Models\ProcurementList;
use App\Models\ProcurementItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProcurementController extends Controller
{
    /**
     * Get Product Catalog & Categories.
     */
    public function catalog(Request $request): JsonResponse
    {
        $category = $request->query('category');
        $query = ProductCatalog::query();

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        $products = $query->orderBy('name', 'asc')->get();
        $categories = ProductCatalog::select('category', DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->get();

        return response()->json([
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    /**
     * Add product to catalog.
     */
    public function storeProduct(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'unit' => 'required|string|max:20',
            'current_price' => 'required|numeric|min:0',
            'target_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:50',
            'supplier_name' => 'nullable|string|max:255',
        ]);

        $product = ProductCatalog::create($validated);

        // Record initial price history
        PriceHistory::create([
            'product_catalog_id' => $product->id,
            'supplier_name' => $product->supplier_name,
            'price' => $product->current_price,
            'recorded_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Product added to catalog.',
            'product' => $product,
        ], 201);
    }

    /**
     * Get Invoices & OCR data.
     */
    public function invoices(Request $request): JsonResponse
    {
        $invoices = SupplierInvoice::with('items')->orderBy('invoice_date', 'desc')->paginate(20);
        return response()->json($invoices);
    }

    /**
     * Simulate/Process Supplier Invoice OCR scan.
     */
    public function scanInvoice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier_name' => 'nullable|string',
            'invoice_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'items' => 'nullable|array',
        ]);

        $supplierName = $validated['supplier_name'] ?? 'Metro Cash & Carry';
        $invoiceNumber = 'INV-' . rand(100000, 999999);
        $fileUrl = null;

        if ($request->hasFile('invoice_file')) {
            $path = $request->file('invoice_file')->store('supplier_invoices', 'public');
            $fileUrl = '/storage/' . $path;
        }

        // Mock/OCR parsed line items
        $mockItems = $validated['items'] ?? [
            ['name' => 'Ribeye Beef Premium (kg)', 'quantity' => 12.5, 'unit_price' => 24.50, 'vat_rate' => 7],
            ['name' => 'Organic Fresh Milk 3.5% (l)', 'quantity' => 30, 'unit_price' => 1.45, 'vat_rate' => 7],
            ['name' => 'Extra Virgin Olive Oil 5L', 'quantity' => 4, 'unit_price' => 38.00, 'vat_rate' => 7],
            ['name' => 'San Pellegrino Sparkling 24x0.5L', 'quantity' => 5, 'unit_price' => 18.90, 'vat_rate' => 19],
        ];

        $totalNet = 0;
        $totalGross = 0;

        foreach ($mockItems as $item) {
            $net = round($item['quantity'] * $item['unit_price'], 2);
            $gross = round($net * (1 + ($item['vat_rate'] / 100)), 2);
            $totalNet += $net;
            $totalGross += $gross;
        }

        $invoice = SupplierInvoice::create([
            'supplier_name' => $supplierName,
            'invoice_number' => $invoiceNumber,
            'invoice_date' => Carbon::today(),
            'total_net' => $totalNet,
            'total_gross' => $totalGross,
            'tax_rate' => 7,
            'file_url' => $fileUrl,
            'status' => 'verified',
            'raw_ocr_data' => ['scanned_items_count' => count($mockItems)],
        ]);

        foreach ($mockItems as $item) {
            $cat = ProductCatalog::where('name', 'like', '%' . explode(' ', $item['name'])[0] . '%')->first();
            $lineItem = SupplierInvoiceItem::create([
                'supplier_invoice_id' => $invoice->id,
                'product_catalog_id' => $cat?->id,
                'item_name' => $item['name'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total_price' => round($item['quantity'] * $item['unit_price'], 2),
                'vat_rate' => $item['vat_rate'],
            ]);

            // If catalog item exists, update current price & log history
            if ($cat) {
                $cat->update(['current_price' => $item['unit_price'], 'supplier_name' => $supplierName]);
                PriceHistory::create([
                    'product_catalog_id' => $cat->id,
                    'supplier_name' => $supplierName,
                    'price' => $item['unit_price'],
                    'recorded_at' => Carbon::now(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Supplier invoice scanned & verified with ' . count($mockItems) . ' line items.',
            'invoice' => $invoice->load('items'),
        ], 201);
    }

    /**
     * Shopping / Replenishment lists.
     */
    public function shoppingLists(): JsonResponse
    {
        $lists = ProcurementList::with('items')->orderBy('created_at', 'desc')->get();
        return response()->json(['lists' => $lists]);
    }

    /**
     * Create shopping list.
     */
    public function createShoppingList(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'required|string|in:Kitchen,Bar,Service,Cleaning',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit' => 'nullable|string',
            'items.*.estimated_price' => 'nullable|numeric',
        ]);

        $total = 0;
        foreach ($validated['items'] as $item) {
            $total += ($item['quantity'] * ($item['estimated_price'] ?? 0));
        }

        $list = ProcurementList::create([
            'title' => $validated['title'],
            'department' => $validated['department'],
            'status' => 'pending',
            'total_estimated_cost' => round($total, 2),
        ]);

        foreach ($validated['items'] as $item) {
            ProcurementItem::create([
                'procurement_list_id' => $list->id,
                'item_name' => $item['item_name'],
                'quantity' => $item['quantity'],
                'unit' => $item['unit'] ?? 'pcs',
                'estimated_price' => $item['estimated_price'] ?? 0,
                'status' => 'pending',
            ]);
        }

        return response()->json([
            'message' => 'Procurement list created.',
            'list' => $list->load('items'),
        ], 201);
    }
}

