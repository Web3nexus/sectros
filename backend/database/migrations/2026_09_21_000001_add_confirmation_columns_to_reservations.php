<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add guest-confirmation columns so manual and website bookings can be
     * confirmed either by the guest (email link / code) or by restaurant
     * attendance (code) before the reservation becomes "confirmed".
     */
    public function up(): void
    {
        Schema::connection('tenant')->table('reservations', function (Blueprint $table) {
            $table->string('confirmation_code')->nullable()->after('special_requests');
            $table->string('confirmation_token')->nullable()->after('confirmation_code');
            $table->string('confirmed_by')->nullable()->after('confirmation_token');
            $table->timestamp('confirmed_at')->nullable()->after('confirmed_by');
            $table->unique(['tenant_id', 'confirmation_token'], 'reservations_confirmation_token_unique');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('reservations', function (Blueprint $table) {
            $table->dropUnique('reservations_confirmation_token_unique');
            $table->dropColumn(['confirmation_code', 'confirmation_token', 'confirmed_by', 'confirmed_at']);
        });
    }
};