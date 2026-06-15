<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->create('tenant_whatsapp_connections', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('meta_business_id')->nullable();
            $table->string('waba_id');
            $table->string('phone_number_id');
            $table->string('display_phone_number')->nullable();
            $table->text('access_token_encrypted');
            $table->timestamp('token_expires_at')->nullable();
            $table->string('status')->default('pending');
            $table->string('webhook_subscription_id')->nullable();
            $table->timestamp('webhook_subscribed_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique('phone_number_id');
            $table->index('tenant_id');
            $table->index('waba_id');
        });
    }

    public function down(): void
    {
        Schema::connection('platform')->dropIfExists('tenant_whatsapp_connections');
    }
};
