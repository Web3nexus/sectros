<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->create('webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('webhook_endpoint_id')->nullable();
            $table->string('event_type');
            $table->longText('payload')->nullable();
            $table->integer('response_code')->nullable();
            $table->text('response_body')->nullable();
            $table->string('status')->default('pending')->index();
            $table->text('error_message')->nullable();
            $table->integer('duration_ms')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index('tenant_id', 'wh_events_tenant_id_idx');
            $table->index('event_type', 'wh_events_event_type_idx');
            $table->index('status', 'wh_events_status_idx');
            $table->index('created_at', 'wh_events_created_at_idx');
            $table->index(['tenant_id', 'status', 'created_at'], 'wh_events_tenant_status_created_idx');
            $table->index(['tenant_id', 'event_type'], 'wh_events_tenant_event_type_idx');
            $table->foreign('webhook_endpoint_id')
                  ->references('id')->on('webhook_endpoints')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::connection('platform')->dropIfExists('webhook_events');
    }
};
