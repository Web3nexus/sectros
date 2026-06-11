<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('builder_pages', function (Blueprint $table) {
            $table->json('sections_json')->nullable()->after('grapes_json_state');
            $table->json('theme_json')->nullable()->after('sections_json');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('builder_pages', function (Blueprint $table) {
            $table->dropColumn(['sections_json', 'theme_json']);
        });
    }
};
