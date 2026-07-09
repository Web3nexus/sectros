<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->create('channels', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('integration_mode'); // partner, direct, bsp
            $table->string('channel_type'); // facebook, instagram, whatsapp
            $table->string('provider_name'); // meta, 360dialog, twilio, bird, custom
            $table->string('external_account_id')->nullable();
            $table->string('page_id')->nullable();
            $table->string('page_name')->nullable();
            $table->string('instagram_account_id')->nullable();
            $table->string('instagram_username')->nullable();
            $table->string('phone_number_id')->nullable();
            $table->string('display_phone_number')->nullable();
            $table->string('waba_id')->nullable();
            $table->text('access_token_encrypted')->nullable();
            $table->text('refresh_token_encrypted')->nullable();
            $table->timestamp('token_expires_at')->nullable();
            $table->text('scopes')->nullable();
            $table->string('webhook_status')->default('unsubscribed');
            $table->timestamp('webhook_subscribed_at')->nullable();
            $table->string('webhook_subscription_id')->nullable();
            $table->string('connection_status')->default('disconnected'); // connected, disconnected, expired, error
            $table->text('last_error')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index('tenant_id');
            $table->index('channel_type');
            $table->index('integration_mode');
            $table->index('connection_status');
            $table->unique(['tenant_id', 'channel_type', 'external_account_id'], 'ch_tenant_channel_ext_unique');
        });
    }

    public function down(): void
    {
        Schema::connection('platform')->dropIfExists('channels');
    }
};
