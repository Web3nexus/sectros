<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Daily Cash Closings / TSE Kassenbuch (Z-Bons)
        if (!Schema::hasTable('daily_cashes')) {
            Schema::create('daily_cashes', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->date('date');
                $table->decimal('opening_float', 10, 2)->default(0);
                $table->decimal('cash_sales', 10, 2)->default(0);
                $table->decimal('card_sales', 10, 2)->default(0);
                $table->decimal('counted_cash', 10, 2)->default(0);
                $table->decimal('total_sales', 10, 2)->default(0);
                $table->decimal('tips_surplus', 10, 2)->default(0);
                $table->decimal('vat_7_amount', 10, 2)->default(0);
                $table->decimal('vat_19_amount', 10, 2)->default(0);
                $table->text('notes')->nullable();
                $table->string('status')->default('closed'); // draft, closed, verified
                $table->unsignedBigInteger('verified_by')->nullable();
                $table->timestamps();

                $table->index(['tenant_id', 'date']);
            });
        }

        // 2. Tax Advisors (Tax Advisor Portal Users)
        if (!Schema::hasTable('tax_advisors')) {
            Schema::create('tax_advisors', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('password');
                $table->string('company_name')->nullable();
                $table->string('phone')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });
        }

        // 3. Tax Advisor Access Mapping
        if (!Schema::hasTable('tax_advisor_accesses')) {
            Schema::create('tax_advisor_accesses', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('tax_advisor_id');
                $table->string('tenant_id');
                $table->json('permissions')->nullable();
                $table->string('status')->default('active'); // active, revoked
                $table->timestamps();

                $table->index(['tax_advisor_id', 'tenant_id']);
            });
        }

        // 4. Tax Advisor Bills / Invoicing
        if (!Schema::hasTable('advisor_bills')) {
            Schema::create('advisor_bills', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('tax_advisor_id');
                $table->string('tenant_id');
                $table->string('invoice_number');
                $table->decimal('amount', 10, 2);
                $table->date('bill_date');
                $table->string('file_url')->nullable();
                $table->string('status')->default('pending'); // pending, approved, paid
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index(['tenant_id', 'bill_date']);
            });
        }

        // 5. Sick Notes (Krankmeldungen)
        if (!Schema::hasTable('sick_notes')) {
            Schema::create('sick_notes', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->unsignedBigInteger('staff_profile_id');
                $table->date('start_date');
                $table->date('end_date');
                $table->text('diagnosis_notes')->nullable();
                $table->string('certificate_file_url')->nullable();
                $table->string('status')->default('pending'); // pending, verified, rejected
                $table->unsignedBigInteger('reviewed_by')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamps();

                $table->index(['tenant_id', 'staff_profile_id']);
            });
        }

        // 6. Vacation Requests
        if (!Schema::hasTable('vacation_requests')) {
            Schema::create('vacation_requests', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->unsignedBigInteger('staff_profile_id');
                $table->date('start_date');
                $table->date('end_date');
                $table->text('reason')->nullable();
                $table->string('status')->default('pending'); // pending, approved, rejected
                $table->unsignedBigInteger('reviewed_by')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamps();

                $table->index(['tenant_id', 'staff_profile_id']);
            });
        }

        // 7. Payslips & Digital Signature Canvas
        if (!Schema::hasTable('payslips')) {
            Schema::create('payslips', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->unsignedBigInteger('staff_profile_id');
                $table->string('period_month'); // e.g. 2026-09
                $table->decimal('gross_amount', 10, 2)->default(0);
                $table->decimal('net_amount', 10, 2)->default(0);
                $table->decimal('deductions', 10, 2)->default(0);
                $table->decimal('hours_worked', 8, 2)->default(0);
                $table->string('file_url')->nullable();
                $table->longText('signature_data')->nullable();
                $table->timestamp('signed_at')->nullable();
                $table->string('status')->default('published'); // draft, published, signed
                $table->timestamps();

                $table->index(['tenant_id', 'staff_profile_id', 'period_month']);
            });
        }

        // 8. Tip Tracker & Distribution
        if (!Schema::hasTable('tip_records')) {
            Schema::create('tip_records', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->unsignedBigInteger('staff_profile_id');
                $table->unsignedBigInteger('shift_id')->nullable();
                $table->date('date');
                $table->decimal('amount', 10, 2)->default(0);
                $table->string('payout_status')->default('paid'); // pending, paid
                $table->string('payout_method')->default('cash'); // cash, bank
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index(['tenant_id', 'staff_profile_id', 'date']);
            });
        }

        // 9. Product Catalog
        if (!Schema::hasTable('product_catalogs')) {
            Schema::create('product_catalogs', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->string('category')->default('General'); // Meat, Produce, Dairy, Beverages, Cleaning, Bakery, etc.
                $table->string('name');
                $table->string('unit')->default('kg'); // kg, l, pcs, box, bottle
                $table->string('sku')->nullable();
                $table->string('supplier_name')->nullable();
                $table->decimal('current_price', 10, 2)->default(0);
                $table->decimal('target_price', 10, 2)->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index(['tenant_id', 'category']);
            });
        }

        // 10. Supplier Invoices & OCR
        if (!Schema::hasTable('supplier_invoices')) {
            Schema::create('supplier_invoices', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->string('supplier_name');
                $table->string('invoice_number')->nullable();
                $table->date('invoice_date');
                $table->decimal('total_net', 10, 2)->default(0);
                $table->decimal('total_gross', 10, 2)->default(0);
                $table->decimal('tax_rate', 5, 2)->default(19);
                $table->string('file_url')->nullable();
                $table->string('status')->default('verified'); // scanned, verified, paid
                $table->json('raw_ocr_data')->nullable();
                $table->timestamps();

                $table->index(['tenant_id', 'invoice_date']);
            });
        }

        // 11. Supplier Invoice Items
        if (!Schema::hasTable('supplier_invoice_items')) {
            Schema::create('supplier_invoice_items', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->unsignedBigInteger('supplier_invoice_id');
                $table->unsignedBigInteger('product_catalog_id')->nullable();
                $table->string('item_name');
                $table->decimal('quantity', 10, 2)->default(1);
                $table->decimal('unit_price', 10, 2)->default(0);
                $table->decimal('total_price', 10, 2)->default(0);
                $table->decimal('vat_rate', 5, 2)->default(19);
                $table->timestamps();

                $table->index(['tenant_id', 'supplier_invoice_id']);
            });
        }

        // 12. Price Histories
        if (!Schema::hasTable('price_histories')) {
            Schema::create('price_histories', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->unsignedBigInteger('product_catalog_id');
                $table->string('supplier_name')->nullable();
                $table->decimal('price', 10, 2);
                $table->timestamp('recorded_at');
                $table->timestamps();

                $table->index(['tenant_id', 'product_catalog_id']);
            });
        }

        // 13. Procurement Shopping Lists
        if (!Schema::hasTable('procurement_lists')) {
            Schema::create('procurement_lists', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->string('title');
                $table->string('department')->default('Kitchen');
                $table->string('status')->default('pending'); // pending, ordered, completed
                $table->decimal('total_estimated_cost', 10, 2)->default(0);
                $table->timestamps();

                $table->index(['tenant_id', 'status']);
            });
        }

        // 14. Procurement Items
        if (!Schema::hasTable('procurement_items')) {
            Schema::create('procurement_items', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->unsignedBigInteger('procurement_list_id');
                $table->unsignedBigInteger('product_catalog_id')->nullable();
                $table->string('item_name');
                $table->decimal('quantity', 10, 2)->default(1);
                $table->string('unit')->default('pcs');
                $table->decimal('estimated_price', 10, 2)->default(0);
                $table->string('status')->default('pending'); // pending, bought
                $table->timestamps();

                $table->index(['tenant_id', 'procurement_list_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('procurement_items');
        Schema::dropIfExists('procurement_lists');
        Schema::dropIfExists('price_histories');
        Schema::dropIfExists('supplier_invoice_items');
        Schema::dropIfExists('supplier_invoices');
        Schema::dropIfExists('product_catalogs');
        Schema::dropIfExists('tip_records');
        Schema::dropIfExists('payslips');
        Schema::dropIfExists('vacation_requests');
        Schema::dropIfExists('sick_notes');
        Schema::dropIfExists('advisor_bills');
        Schema::dropIfExists('tax_advisor_accesses');
        Schema::dropIfExists('tax_advisors');
        Schema::dropIfExists('daily_cashes');
    }
};

