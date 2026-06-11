<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dateTime('end_time')->nullable()->after('reservation_time');
            $table->integer('duration_minutes')->nullable()->after('end_time');
            
            // Resource Mapping (Generalizing beyond just restaurant tables)
            $table->string('resource_type')->default('table')->after('restaurant_table_id');
            $table->unsignedBigInteger('resource_id')->nullable()->after('resource_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['end_time', 'duration_minutes', 'resource_type', 'resource_id']);
        });
    }
};
