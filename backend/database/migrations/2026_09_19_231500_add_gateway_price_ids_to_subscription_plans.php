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
        Schema::connection('platform')->table('subscription_plans', function (Blueprint $table) {
            if (!Schema::connection('platform')->hasColumn('subscription_plans', 'paddle_product_id')) {
                $table->string('paddle_product_id')->nullable()->after('voice_credits_limit');
            }
            if (!Schema::connection('platform')->hasColumn('subscription_plans', 'paddle_monthly_price_id')) {
                $table->string('paddle_monthly_price_id')->nullable()->after('paddle_product_id');
            }
            if (!Schema::connection('platform')->hasColumn('subscription_plans', 'paddle_yearly_price_id')) {
                $table->string('paddle_yearly_price_id')->nullable()->after('paddle_monthly_price_id');
            }
            if (!Schema::connection('platform')->hasColumn('subscription_plans', 'stripe_monthly_price_id')) {
                $table->string('stripe_monthly_price_id')->nullable()->after('paddle_yearly_price_id');
            }
            if (!Schema::connection('platform')->hasColumn('subscription_plans', 'stripe_yearly_price_id')) {
                $table->string('stripe_yearly_price_id')->nullable()->after('stripe_monthly_price_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('platform')->table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn([
                'paddle_product_id',
                'paddle_monthly_price_id',
                'paddle_yearly_price_id',
                'stripe_monthly_price_id',
                'stripe_yearly_price_id',
            ]);
        });
    }
};

