<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_messages', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('staff_profile_id')->nullable()->constrained('staff_profiles')->cascadeOnDelete();
            $table->boolean('to_all')->default(false);
            $table->string('subject');
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'staff_profile_id', 'read_at']);
            $table->index(['tenant_id', 'to_all', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_messages');
    }
};
