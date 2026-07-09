<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('external_id')->nullable();
            $table->string('channel_type'); // facebook, instagram, whatsapp
            $table->string('avatar_url')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('external_id');
            $table->index(['tenant_id', 'channel_type']);
            $table->unique(['tenant_id', 'external_id', 'channel_type'], 'ct_tenant_ext_type_unique');
        });

        Schema::connection('tenant')->create('conversations', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('channel_id');
            $table->string('contact_id');
            $table->string('external_conversation_id')->nullable();
            $table->string('channel_type'); // facebook, instagram, whatsapp
            $table->string('status')->default('active'); // active, archived, closed
            $table->string('assigned_to')->nullable();
            $table->boolean('ai_active')->default(true);
            $table->boolean('human_taken_over')->default(false);
            $table->timestamp('last_message_at')->nullable();
            $table->integer('unread_count')->default(0);
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('channel_id');
            $table->index('contact_id');
            $table->index('status');
            $table->unique(['tenant_id', 'external_conversation_id'], 'cv_tenant_ext_unique');
        });

        Schema::connection('tenant')->create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('conversation_id');
            $table->string('contact_id');
            $table->string('channel_id');
            $table->string('channel_type'); // facebook, instagram, whatsapp
            $table->string('integration_mode'); // partner, direct, bsp
            $table->string('provider_name');
            $table->string('external_message_id')->nullable();
            $table->string('sender_id');
            $table->string('recipient_id');
            $table->string('direction'); // incoming, outgoing
            $table->string('message_type')->default('text'); // text, image, audio, video, document, sticker, location, button, template
            $table->text('text')->nullable();
            $table->string('media_url')->nullable();
            $table->string('media_mime_type')->nullable();
            $table->json('metadata')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamp('external_timestamp')->nullable();
            $table->boolean('is_ai_generated')->default(false);
            $table->boolean('is_ai_reviewed')->default(false);
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('conversation_id');
            $table->index('contact_id');
            $table->index('channel_id');
            $table->index('direction');
            $table->index('external_message_id');
        });

        Schema::connection('tenant')->create('message_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('message_id');
            $table->string('status'); // sent, delivered, read, failed, pending
            $table->text('error_message')->nullable();
            $table->json('provider_response')->nullable();
            $table->timestamp('status_changed_at');
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('message_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('message_statuses');
        Schema::connection('tenant')->dropIfExists('messages');
        Schema::connection('tenant')->dropIfExists('conversations');
        Schema::connection('tenant')->dropIfExists('contacts');
    }
};
