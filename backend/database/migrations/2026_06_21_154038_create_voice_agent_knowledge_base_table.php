<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voice_agent_knowledge_base', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('title');
            $table->text('content')->nullable();
            $table->string('category')->default('other');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voice_agent_knowledge_base');
    }
};
