<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->create('voice_agent_plans', function (Blueprint $table) {
            $table->id();
            $table->string('plan_name');
            $table->text('plan_description')->nullable();
            $table->decimal('monthly_price', 10, 2)->default(0);
            $table->decimal('yearly_price', 10, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->integer('trial_days')->default(7);
            $table->integer('included_minutes_monthly')->default(0);
            $table->integer('included_minutes_yearly')->nullable();
            $table->decimal('extra_minute_rate', 10, 4)->default(0);
            $table->integer('max_call_duration_minutes')->nullable();
            $table->integer('max_calls_per_month')->nullable();
            $table->json('features')->nullable();
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->string('provider_price_id_monthly')->nullable();
            $table->string('provider_price_id_yearly')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('platform')->dropIfExists('voice_agent_plans');
    }
};
