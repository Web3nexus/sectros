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
        Schema::create('directory_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('directory_listings', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->nullable()->index(); // Link to existing tenant if on platform
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('business_type')->index(); // restaurant, salon, hotel, etc.
            $table->foreignId('category_id')->constrained('directory_categories')->cascadeOnDelete();
            
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            
            $table->string('logo')->nullable();
            $table->string('cover_image')->nullable();
            
            $table->json('opening_hours')->nullable();
            $table->json('services')->nullable(); // Quick list of services/menu items for display
            
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->integer('review_count')->default(0);
            
            $table->decimal('price_range', 2, 1)->default(1); // 1 to 4 ($ to $$$$)
            
            $table->timestamps();
        });

        Schema::create('directory_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained('directory_listings')->cascadeOnDelete();
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->integer('rating');
            $table->text('comment')->nullable();
            $table->boolean('is_verified_customer')->default(false);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('directory_reviews');
        Schema::dropIfExists('directory_listings');
        Schema::dropIfExists('directory_categories');
    }
};
