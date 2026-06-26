<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voice_agent_calls', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('provider_id')->nullable()->constrained('voice_providers');
            $table->string('provider_call_id')->nullable()->index();
            $table->string('provider_agent_id')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_phone_number')->nullable();
            $table->string('call_direction')->default('inbound');
            $table->string('call_status')->default('in_progress');
            $table->integer('call_duration_seconds')->nullable();
            $table->timestamp('call_started_at')->nullable();
            $table->timestamp('call_ended_at')->nullable();
            $table->longText('transcript')->nullable();
            $table->text('summary')->nullable();
            $table->string('outcome')->nullable();
            $table->string('recording_url')->nullable();
            $table->json('raw_provider_payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voice_agent_calls');
    }
};
