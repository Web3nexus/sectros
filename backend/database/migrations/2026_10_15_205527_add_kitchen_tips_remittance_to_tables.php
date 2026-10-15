<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('tenant')->table('orders', function (Blueprint $table) {
            if (!Schema::connection('tenant')->hasColumn('orders', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('payment_status');
            }
            if (!Schema::connection('tenant')->hasColumn('orders', 'tip_amount')) {
                $table->decimal('tip_amount', 10, 2)->default(0)->after('total_amount');
            }
            if (!Schema::connection('tenant')->hasColumn('orders', 'served_at')) {
                $table->dateTime('served_at')->nullable()->after('kitchen_status');
            }
            if (!Schema::connection('tenant')->hasColumn('orders', 'cash_remitted')) {
                $table->boolean('cash_remitted')->default(false)->after('payment_method');
            }
            if (!Schema::connection('tenant')->hasColumn('orders', 'cash_remitted_at')) {
                $table->dateTime('cash_remitted_at')->nullable()->after('cash_remitted');
            }
            if (!Schema::connection('tenant')->hasColumn('orders', 'cash_remitted_by')) {
                $table->unsignedBigInteger('cash_remitted_by')->nullable()->after('cash_remitted_at');
            }
            if (!Schema::connection('tenant')->hasColumn('orders', 'table_code')) {
                $table->string('table_code')->nullable()->after('restaurant_table_id');
            }
        });

        Schema::connection('tenant')->table('tip_records', function (Blueprint $table) {
            if (!Schema::connection('tenant')->hasColumn('tip_records', 'order_id')) {
                $table->unsignedBigInteger('order_id')->nullable()->after('shift_id');
            }
        });

        Schema::connection('tenant')->table('tenant_reviews', function (Blueprint $table) {
            if (!Schema::connection('tenant')->hasColumn('tenant_reviews', 'internal_comment')) {
                $table->text('internal_comment')->nullable()->after('text');
            }
            if (!Schema::connection('tenant')->hasColumn('tenant_reviews', 'reservation_id')) {
                $table->unsignedBigInteger('reservation_id')->nullable()->after('internal_comment');
            }
            if (!Schema::connection('tenant')->hasColumn('tenant_reviews', 'order_id')) {
                $table->unsignedBigInteger('order_id')->nullable()->after('reservation_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('tenant')->table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'tip_amount',
                'served_at',
                'cash_remitted',
                'cash_remitted_at',
                'cash_remitted_by',
                'table_code',
            ]);
        });

        Schema::connection('tenant')->table('tip_records', function (Blueprint $table) {
            $table->dropColumn(['order_id']);
        });

        Schema::connection('tenant')->table('tenant_reviews', function (Blueprint $table) {
            $table->dropColumn([
                'internal_comment',
                'reservation_id',
                'order_id',
            ]);
        });
    }
};
