<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::connection('platform')->hasColumn('voice_agent_settings', 'voice_id')) {
            Schema::connection('platform')->table('voice_agent_settings', function (Blueprint $table) {
                $table->string('voice_id', 100)->nullable()->after('voice_style');
            });
        }

        if (!Schema::connection('platform')->hasColumn('voice_agent_knowledge_base', 'tenant_id')) {
            Schema::connection('platform')->table('voice_agent_knowledge_base', function (Blueprint $table) {
                $table->index(['tenant_id', 'category']);
                $table->index(['tenant_id', 'is_active']);
            });
        }
    }

    public function down(): void
    {
        Schema::connection('platform')->table('voice_agent_settings', function (Blueprint $table) {
            $table->dropColumn('voice_id');
        });
    }
};
