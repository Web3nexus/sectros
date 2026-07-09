<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('ai_settings', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('channel_id')->nullable();
            $table->boolean('auto_reply_enabled')->default(false);
            $table->boolean('suggested_replies_enabled')->default(true);
            $table->string('ai_tone')->default('Professional');
            $table->text('custom_instructions')->nullable();
            $table->json('business_rules')->nullable();
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('channel_id');
        });

        Schema::connection('tenant')->create('ai_reply_logs', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('message_id')->nullable();
            $table->string('conversation_id');
            $table->string('channel_id');
            $table->string('action'); // suggested, auto_replied, reviewed, blocked, human_takeover
            $table->text('original_message')->nullable();
            $table->text('suggested_reply')->nullable();
            $table->text('final_reply')->nullable();
            $table->string('status')->default('pending'); // pending, accepted, rejected, sent, failed
            $table->json('ai_metadata')->nullable();
            $table->string('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('conversation_id');
            $table->index('action');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('ai_reply_logs');
        Schema::connection('tenant')->dropIfExists('ai_settings');
    }
};
