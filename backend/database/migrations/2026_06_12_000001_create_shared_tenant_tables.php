<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Tables with no FK dependencies ──────────────────────────────
        Schema::connection('tenant')->create('menu_categories', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'is_active']);
        });

        Schema::connection('tenant')->create('restaurant_tables', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('table_number');
            $table->integer('capacity')->default(2);
            $table->string('status')->default('available');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'branch_id']);
        });

        Schema::connection('tenant')->create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_main')->default(false);
            $table->json('settings')->nullable();
            $table->unsignedBigInteger('franchise_id')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
        });

        Schema::connection('tenant')->create('franchises', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->string('owner_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('tenant_id');
        });

        Schema::connection('tenant')->create('tenant_settings', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('key');
            $table->text('value')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
            $table->unique(['tenant_id', 'key']);
        });

        Schema::connection('tenant')->create('tenant_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->string('icon')->default('bell');
            $table->string('status')->default('unread');
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'status', 'created_at']);
        });

        Schema::connection('tenant')->create('ai_interactions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('platform')->default('Web');
            $table->string('platform_account_id')->nullable();
            $table->string('sender')->nullable();
            $table->text('content');
            $table->text('reply')->nullable();
            $table->string('status')->default('received');
            $table->string('sentiment')->default('neutral');
            $table->boolean('is_reservation')->default(false);
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'created_at']);
        });

        Schema::connection('tenant')->create('tenant_knowledge', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('title');
            $table->text('content')->nullable();
            $table->string('type')->default('document');
            $table->string('file_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('tenant_id');
        });

        Schema::connection('tenant')->create('builder_pages', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('title')->nullable();
            $table->string('slug')->nullable();
            $table->longText('html_content')->nullable();
            $table->longText('css_content')->nullable();
            $table->json('grapes_json_state')->nullable();
            $table->json('sections_json')->nullable();
            $table->json('theme_json')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'slug']);
        });

        Schema::connection('tenant')->create('navigation_menus', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->json('links');
            $table->timestamps();
            $table->index('tenant_id');
        });

        Schema::connection('tenant')->create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->date('expense_date');
            $table->string('category')->nullable();
            $table->string('receipt_url')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'expense_date']);
        });

        Schema::connection('tenant')->create('waitlists', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->integer('party_size');
            $table->integer('estimated_wait_minutes')->default(0);
            $table->string('status')->default('waiting');
            $table->timestamp('notified_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'status']);
        });

        Schema::connection('tenant')->create('blacklist', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('customer_name')->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'email']);
            $table->index(['tenant_id', 'phone']);
        });

        Schema::connection('tenant')->create('special_service_hours', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->date('event_date');
            $table->string('name')->nullable();
            $table->time('open_time')->nullable();
            $table->time('close_time')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'event_date']);
        });

        Schema::connection('tenant')->create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->string('key');
            $table->string('secret');
            $table->json('scopes')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('tenant_id');
            $table->unique(['tenant_id', 'key']);
        });

        Schema::connection('tenant')->create('tenant_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('customer_name');
            $table->string('customer_avatar')->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->text('text');
            $table->string('location')->nullable();
            $table->boolean('is_published')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index('tenant_id');
        });

        Schema::connection('tenant')->create('tenant_galleries', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('title')->nullable();
            $table->string('image_url');
            $table->string('caption')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('tenant_id');
        });

        Schema::connection('tenant')->create('tenant_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('image_url')->nullable();
            $table->json('amenities')->nullable();
            $table->unsignedSmallInteger('capacity')->default(1);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index('tenant_id');
        });

        Schema::connection('tenant')->create('tenant_services', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->unsignedSmallInteger('duration_minutes')->nullable();
            $table->string('image_url')->nullable();
            $table->string('category')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'category']);
        });

        Schema::connection('tenant')->create('tenant_blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('title');
            $table->string('slug')->nullable();
            $table->longText('content')->nullable();
            $table->text('excerpt')->nullable();
            $table->string('image_url')->nullable();
            $table->string('author')->nullable();
            $table->string('category')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            $table->index('tenant_id');
            $table->unique(['tenant_id', 'slug']);
        });

        Schema::connection('tenant')->create('tenant_team_members', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->string('role')->nullable();
            $table->text('bio')->nullable();
            $table->string('image_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('tenant_id');
        });

        Schema::connection('tenant')->create('tenant_inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('sku')->nullable();
            $table->string('unit')->nullable();
            $table->decimal('stock_qty', 10, 2)->default(0);
            $table->decimal('min_stock_level', 10, 2)->default(0);
            $table->decimal('cost_per_unit', 10, 2)->default(0);
            $table->string('supplier')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('tenant_id');
        });

        // ── 2. Tables with FK to users (must exist from platform) ──────────
        Schema::connection('tenant')->create('staff_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('role')->default('waiter');
            $table->string('pin', 6)->nullable();
            $table->decimal('hourly_rate', 8, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('avatar_url')->nullable();
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'branch_id']);
            $table->index('user_id');
        });

        // ── 3. Tables with FK to menu_categories ───────────────────────────
        Schema::connection('tenant')->create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('menu_category_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('image_url')->nullable();
            $table->boolean('is_available')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'menu_category_id']);
            $table->index('menu_category_id');
        });

        Schema::connection('tenant')->create('menu_item_addons', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('menu_item_id');
            $table->string('name');
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_required')->default(false);
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'menu_item_id']);
            $table->index('menu_item_id');
        });

        // ── 4. Tables with FK to orders, staff_profiles, restaurant_tables ─
        Schema::connection('tenant')->create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('restaurant_table_id')->nullable();
            $table->unsignedBigInteger('staff_profile_id')->nullable();
            $table->decimal('total_amount', 10, 2);
            $table->string('status')->default('pending');
            $table->string('kitchen_status')->nullable();
            $table->string('payment_status')->default('unpaid');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'created_at']);
            $table->index(['tenant_id', 'branch_id']);
            $table->index('restaurant_table_id');
            $table->index('staff_profile_id');
        });

        Schema::connection('tenant')->create('order_items', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('menu_item_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->json('addons')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'order_id']);
            $table->index('order_id');
        });

        Schema::connection('tenant')->create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->dateTime('reservation_time');
            $table->dateTime('end_time')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->integer('party_size');
            $table->string('source')->nullable()->default('website');
            $table->decimal('deposit_amount', 10, 2)->default(0);
            $table->unsignedBigInteger('restaurant_table_id')->nullable();
            $table->string('resource_type')->default('table');
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->string('status')->default('pending');
            $table->string('payment_status')->default('unpaid');
            $table->string('stripe_payment_id')->nullable();
            $table->string('payment_method')->nullable();
            $table->text('special_requests')->nullable();
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'reservation_time']);
            $table->index(['tenant_id', 'branch_id']);
            $table->index('restaurant_table_id');
        });

        Schema::connection('tenant')->create('expense_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('expense_id')->nullable();
            $table->string('file_path');
            $table->json('ai_extracted_data')->nullable();
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->boolean('is_reviewed')->default(false);
            $table->timestamps();
            $table->index('tenant_id');
            $table->index('expense_id');
        });

        Schema::connection('tenant')->create('staff_messages', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('sender_id')->nullable();
            $table->unsignedBigInteger('staff_profile_id')->nullable();
            $table->boolean('to_all')->default(false);
            $table->string('subject')->nullable();
            $table->text('body')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'staff_profile_id']);
        });

        // ── 5. Tables with FK to staff_profiles ────────────────────────────
        Schema::connection('tenant')->create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('staff_profile_id');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('status')->default('scheduled');
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'staff_profile_id']);
            $table->index('staff_profile_id');
        });

        Schema::connection('tenant')->create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('staff_profile_id');
            $table->unsignedBigInteger('shift_id')->nullable();
            $table->timestamp('check_in')->nullable();
            $table->timestamp('check_out')->nullable();
            $table->timestamp('break_start')->nullable();
            $table->timestamp('break_end')->nullable();
            $table->decimal('total_hours', 8, 2)->default(0);
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'staff_profile_id']);
            $table->index('staff_profile_id');
            $table->index('shift_id');
        });

        Schema::connection('tenant')->create('payroll_records', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('staff_profile_id');
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('base_salary', 10, 2);
            $table->decimal('overtime_pay', 10, 2)->default(0);
            $table->decimal('tips_share', 10, 2)->default(0);
            $table->decimal('total_payout', 10, 2);
            $table->string('status')->default('pending');
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'staff_profile_id']);
            $table->index('staff_profile_id');
        });

        Schema::connection('tenant')->create('settlement_records', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->date('date');
            $table->decimal('opening_balance', 10, 2);
            $table->decimal('closing_balance', 10, 2)->nullable();
            $table->decimal('cash_collected', 10, 2)->default(0);
            $table->decimal('card_collected', 10, 2)->default(0);
            $table->decimal('tips_collected', 10, 2)->default(0);
            $table->decimal('expenses_total', 10, 2)->default(0);
            $table->decimal('net_total', 10, 2)->nullable();
            $table->decimal('discrepancy', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('staff_profile_id');
            $table->timestamps();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'date']);
            $table->index('staff_profile_id');
        });

        // ── Note: Spatie permission tables (permissions, roles, etc.)
        // already exist from the platform migration and are NOT re-created here.
        // A separate migration adds tenant_id to these existing tables.
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('settlement_records');
        Schema::connection('tenant')->dropIfExists('payroll_records');
        Schema::connection('tenant')->dropIfExists('attendance_logs');
        Schema::connection('tenant')->dropIfExists('shifts');
        Schema::connection('tenant')->dropIfExists('staff_messages');
        Schema::connection('tenant')->dropIfExists('expense_receipts');
        Schema::connection('tenant')->dropIfExists('reservations');
        Schema::connection('tenant')->dropIfExists('order_items');
        Schema::connection('tenant')->dropIfExists('orders');
        Schema::connection('tenant')->dropIfExists('menu_item_addons');
        Schema::connection('tenant')->dropIfExists('menu_items');
        Schema::connection('tenant')->dropIfExists('staff_profiles');
        Schema::connection('tenant')->dropIfExists('tenant_inventory_items');
        Schema::connection('tenant')->dropIfExists('tenant_team_members');
        Schema::connection('tenant')->dropIfExists('tenant_blog_posts');
        Schema::connection('tenant')->dropIfExists('tenant_services');
        Schema::connection('tenant')->dropIfExists('tenant_rooms');
        Schema::connection('tenant')->dropIfExists('tenant_galleries');
        Schema::connection('tenant')->dropIfExists('tenant_reviews');
        Schema::connection('tenant')->dropIfExists('api_keys');
        Schema::connection('tenant')->dropIfExists('special_service_hours');
        Schema::connection('tenant')->dropIfExists('blacklist');
        Schema::connection('tenant')->dropIfExists('waitlists');
        Schema::connection('tenant')->dropIfExists('navigation_menus');
        Schema::connection('tenant')->dropIfExists('builder_pages');
        Schema::connection('tenant')->dropIfExists('tenant_knowledge');
        Schema::connection('tenant')->dropIfExists('ai_interactions');
        Schema::connection('tenant')->dropIfExists('tenant_notifications');
        Schema::connection('tenant')->dropIfExists('tenant_settings');
        Schema::connection('tenant')->dropIfExists('expenses');
        Schema::connection('tenant')->dropIfExists('franchises');
        Schema::connection('tenant')->dropIfExists('branches');
        Schema::connection('tenant')->dropIfExists('restaurant_tables');
        Schema::connection('tenant')->dropIfExists('menu_categories');
    }
};
