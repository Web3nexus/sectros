<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voice_agent_settings', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->unique();
            $table->foreignId('provider_id')->nullable()->constrained('voice_providers');
            $table->string('provider_agent_id')->nullable();
            $table->string('business_name')->nullable();
            $table->string('business_type')->nullable();
            $table->string('business_phone_number')->nullable();
            $table->string('assigned_voice_phone_number')->nullable();
            $table->string('escalation_phone_number')->nullable();
            $table->string('language')->default('en');
            $table->string('voice_style')->default('friendly_receptionist');
            $table->json('opening_hours')->nullable();
            $table->boolean('booking_enabled')->default(false);
            $table->json('booking_rules')->nullable();
            $table->text('fallback_message')->nullable();
            $table->text('system_prompt')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voice_agent_settings');
    }
};
