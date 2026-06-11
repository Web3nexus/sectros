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
        Schema::create('website_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category')->default('General');
            $table->longText('html_content');
            $table->longText('css_content')->nullable();
            $table->string('preview_image_url')->nullable();
            
            // Access & Pricing
            $table->boolean('is_free')->default(true);
            $table->decimal('price', 8, 2)->default(0.00);
            $table->unsignedBigInteger('required_plan_id')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('website_templates');
    }
};
