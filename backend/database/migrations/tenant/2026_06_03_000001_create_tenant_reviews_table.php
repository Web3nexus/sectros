<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('customer_avatar')->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->text('text');
            $table->string('location')->nullable();
            $table->boolean('is_published')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_reviews');
    }
};
