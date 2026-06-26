<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->create('voice_providers', function (Blueprint $table) {
            $table->id();
            $table->string('provider_name');
            $table->string('provider_key')->unique();
            $table->text('api_key_encrypted')->nullable();
            $table->text('webhook_secret_encrypted')->nullable();
            $table->boolean('is_active')->default(false)->index();
            $table->boolean('is_default')->default(false)->index();
            $table->string('status')->default('disconnected');
            $table->timestamp('last_tested_at')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'is_default']);
        });
    }

    public function down(): void
    {
        Schema::connection('platform')->dropIfExists('voice_providers');
    }
};
