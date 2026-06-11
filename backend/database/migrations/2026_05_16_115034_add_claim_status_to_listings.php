<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('directory_listings', function (Blueprint $table) {
            $table->string('claim_status')->default('unclaimed'); // unclaimed, pending, claimed
            $table->string('claim_token')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('directory_listings', function (Blueprint $table) {
            $table->dropColumn(['claim_status', 'claim_token']);
        });
    }
};
