<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->create('webhook_endpoints', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('url', 1024);
            $table->string('secret', 128);
            $table->json('events');
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamp('last_success_at')->nullable();
            $table->timestamp('last_failure_at')->nullable();
            $table->integer('failure_count')->default(0);
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('is_active');
            $table->index(['tenant_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::connection('platform')->dropIfExists('webhook_endpoints');
    }
};
