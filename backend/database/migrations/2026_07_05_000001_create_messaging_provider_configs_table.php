<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->create('messaging_provider_configs', function (Blueprint $table) {
            $table->id();
            $table->string('provider_key')->unique();
            $table->string('provider_name');
            $table->string('provider_type'); // meta_direct, whatsapp_bsp
            $table->text('config_json')->nullable();
            $table->text('api_key_encrypted')->nullable();
            $table->text('api_secret_encrypted')->nullable();
            $table->text('webhook_secret_encrypted')->nullable();
            $table->text('webhook_verify_token_encrypted')->nullable();
            $table->boolean('is_active')->default(false);
            $table->boolean('is_default')->default(false);
            $table->string('status')->default('disconnected');
            $table->timestamp('last_tested_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('platform')->dropIfExists('messaging_provider_configs');
    }
};
