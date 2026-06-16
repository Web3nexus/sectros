<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->create('connected_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('provider')->default('meta');
            $table->string('channel');
            $table->string('meta_user_id')->nullable();
            $table->string('meta_business_id')->nullable();
            $table->string('page_id')->nullable();
            $table->string('page_name')->nullable();
            $table->string('instagram_business_account_id')->nullable();
            $table->string('instagram_username')->nullable();
            $table->text('access_token_encrypted')->nullable();
            $table->timestamp('token_expires_at')->nullable();
            $table->text('scopes')->nullable();
            $table->boolean('webhook_subscribed')->default(false);
            $table->timestamp('webhook_subscribed_at')->nullable();
            $table->string('status')->default('active');
            $table->text('last_error')->nullable();
            $table->timestamp('last_webhook_received_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['tenant_id', 'page_id']);
            $table->unique(['tenant_id', 'instagram_business_account_id']);
            $table->index('channel');
        });
    }

    public function down(): void
    {
        Schema::connection('platform')->dropIfExists('connected_accounts');
    }
};
