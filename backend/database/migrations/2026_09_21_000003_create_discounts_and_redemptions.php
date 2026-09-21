<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->string('description')->nullable();
            $table->string('type', 16)->default('percentage'); // percentage | fixed
            $table->decimal('value', 10, 2);                     // percent value or fixed amount
            $table->string('currency_code', 3)->nullable();      // required when type = fixed
            $table->decimal('min_subtotal', 10, 2)->nullable();
            $table->decimal('max_discount', 10, 2)->nullable();
            $table->json('restrict_to')->nullable();             // {"scopes": ["subscription","theme","addon"], "plan_slugs": [...], "addon_ids": [...], "template_ids": [...]}
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('usage_count')->default(0);
            $table->unsignedInteger('per_customer_limit')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_recurring')->default(false);
            $table->unsignedInteger('maximum_recurring_intervals')->nullable();
            $table->string('paddle_id', 40)->nullable();
            $table->string('stripe_coupon_id', 60)->nullable();
            $table->timestamps();
            $table->index(['is_active', 'expires_at']);
        });

        Schema::connection('platform')->create('discount_redemptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('discount_id');
            $table->string('tenant_id');
            $table->string('scope', 32)->nullable();             // subscription | theme | addon
            $table->string('gateway', 32)->nullable();
            $table->string('transaction_id', 80)->nullable();
            $table->decimal('amount_off', 10, 2)->nullable();
            $table->timestamps();
            $table->index('discount_id');
            $table->index(['tenant_id', 'discount_id']);
            $table->unique(['discount_id', 'transaction_id'], 'disc_redemption_txn_unique');
        });
    }

    public function down(): void
    {
        Schema::connection('platform')->dropIfExists('discount_redemptions');
        Schema::connection('platform')->dropIfExists('discounts');
    }
};