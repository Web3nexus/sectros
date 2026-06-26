<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::connection('platform')->hasTable('voice_agent_phone_numbers')) {
            Schema::connection('platform')->create('voice_agent_phone_numbers', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id')->nullable()->index();
                $table->string('provider')->default('elevenlabs');
                $table->string('phone_number')->unique();
                $table->string('phone_number_source')->default('platform_owned');
                $table->string('external_phone_number_id')->nullable();
                $table->string('external_agent_id')->nullable();
                $table->string('status')->default('available');
                $table->timestamp('assigned_at')->nullable();
                $table->timestamp('released_at')->nullable();
                $table->timestamps();
                $table->index(['status', 'provider']);
            });
        }

        if (!Schema::connection('platform')->hasColumn('voice_agent_settings', 'agent_token')) {
            Schema::connection('platform')->table('voice_agent_settings', function (Blueprint $table) {
                $table->string('agent_token', 64)->nullable()->unique()->after('system_prompt');
                $table->unsignedBigInteger('assigned_phone_number_id')->nullable()->after('agent_token');
                $table->integer('max_party_size')->nullable()->after('assigned_phone_number_id');
                $table->integer('reservation_duration_minutes')->nullable()->after('max_party_size');
                $table->integer('advance_booking_days')->nullable()->after('reservation_duration_minutes');
                $table->string('off_hours_behavior')->default('take_message')->after('advance_booking_days');
            });
        }

        if (!Schema::connection('platform')->hasColumn('voice_agent_calls', 'reservation_id')) {
            Schema::connection('platform')->table('voice_agent_calls', function (Blueprint $table) {
                $table->unsignedBigInteger('reservation_id')->nullable()->after('outcome');
                $table->unsignedBigInteger('assigned_phone_number_id')->nullable()->after('reservation_id');
            });
        }
    }

    public function down(): void
    {
        Schema::connection('platform')->table('voice_agent_calls', function (Blueprint $table) {
            $table->dropColumn(['reservation_id', 'assigned_phone_number_id']);
        });

        Schema::connection('platform')->table('voice_agent_settings', function (Blueprint $table) {
            $table->dropColumn([
                'agent_token', 'assigned_phone_number_id', 'max_party_size',
                'reservation_duration_minutes', 'advance_booking_days', 'off_hours_behavior',
            ]);
        });

        Schema::connection('platform')->dropIfExists('voice_agent_phone_numbers');
    }
};
