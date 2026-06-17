<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->dropIfExists('connected_accounts');

        Schema::connection('platform')->create('connected_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
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

            $table->unique(['tenant_id', 'page_id'], 'ca_tenant_page_unique');
            $table->unique(['tenant_id', 'instagram_business_account_id'], 'ca_tenant_ig_unique');
            $table->index('channel', 'ca_channel_idx');
        });

        try {
            Schema::connection('platform')->table('connected_accounts', function (Blueprint $table) {
                $table->foreign('tenant_id', 'ca_tenant_fk')
                    ->references('id')->on('tenants')
                    ->onDelete('cascade');
            });
        } catch (\Exception $e) {
            Log::warning('Could not add FK on connected_accounts.tenant_id: ' . $e->getMessage());
        }
    }

    public function down(): void
    {
        Schema::connection('platform')->dropIfExists('connected_accounts');
    }
};
