<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voice_agent_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->unique();
            $table->unsignedBigInteger('plan_id');
            $table->index('plan_id');
            $table->string('plan_name_snapshot')->nullable();
            $table->string('billing_interval')->default('monthly');
            $table->string('status')->default('trial');
            $table->timestamp('trial_started_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->integer('included_minutes_snapshot')->default(0);
            $table->decimal('extra_minute_rate_snapshot', 10, 4)->default(0);
            $table->string('provider_subscription_id')->nullable();
            $table->string('provider_customer_id')->nullable();
            $table->boolean('cancel_at_period_end')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voice_agent_subscriptions');
    }
};
