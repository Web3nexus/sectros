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
        if (!Schema::connection('platform')->hasTable('paddle_customers')) {
            Schema::connection('platform')->create('paddle_customers', function (Blueprint $table) {
                $table->string('id')->primary(); // Paddle customer ID (ctm_...)
                $table->string('tenant_id')->nullable()->index();
                $table->string('email')->index();
                $table->string('name')->nullable();
                $table->string('locale', 10)->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::connection('platform')->hasTable('paddle_subscriptions')) {
            Schema::connection('platform')->create('paddle_subscriptions', function (Blueprint $table) {
                $table->string('id')->primary(); // Paddle subscription ID (sub_...)
                $table->string('customer_id')->index();
                $table->string('tenant_id')->nullable()->index();
                $table->string('status', 50)->index(); // 'active', 'trialing', 'past_due', 'paused', 'canceled'
                $table->string('price_id')->nullable()->index();
                $table->string('product_id')->nullable()->index();
                $table->string('plan_slug', 100)->nullable()->index();
                $table->string('billing_interval', 20)->nullable();
                $table->string('scheduled_change_action', 50)->nullable(); // e.g. 'cancel'
                $table->timestamp('scheduled_change_at')->nullable();
                $table->timestamp('current_billing_period_starts_at')->nullable();
                $table->timestamp('current_billing_period_ends_at')->nullable();
                $table->timestamp('canceled_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('platform')->dropIfExists('paddle_subscriptions');
        Schema::connection('platform')->dropIfExists('paddle_customers');
    }
};

