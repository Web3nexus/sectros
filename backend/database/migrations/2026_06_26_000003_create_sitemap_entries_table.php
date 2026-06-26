<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->create('sitemap_entries', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->nullable();
            $table->string('path');
            $table->string('priority', 4)->default('0.5');
            $table->string('changefreq', 20)->default('weekly');
            $table->boolean('is_active')->default(true);
            $table->timestamp('lastmod')->nullable();
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('is_active');
            $table->index(['tenant_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::connection('platform')->dropIfExists('sitemap_entries');
    }
};
