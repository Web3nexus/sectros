<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a per-item "available for kiosk/online ordering" flag so the general
     * menu can include items that are not offered on the self-service kiosk.
     */
    public function up(): void
    {
        Schema::connection('tenant')->table('menu_items', function (Blueprint $table) {
            $table->boolean('is_kiosk_available')->default(true)->after('is_available');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('menu_items', function (Blueprint $table) {
            $table->dropColumn('is_kiosk_available');
        });
    }
};