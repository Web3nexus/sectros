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
        Schema::table('website_templates', function (Blueprint $table) {
            $table->longText('sections_json')->nullable()->after('css_content');
            $table->longText('theme_json')->nullable()->after('sections_json');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('website_templates', function (Blueprint $table) {
            $table->dropColumn(['sections_json', 'theme_json']);
        });
    }
};
