<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voice_agent_usage', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('billing_month', 7);
            $table->integer('included_minutes')->default(0);
            $table->integer('used_minutes')->default(0);
            $table->integer('remaining_minutes')->default(0);
            $table->integer('extra_minutes')->default(0);
            $table->decimal('extra_minute_rate', 10, 4)->default(0);
            $table->decimal('estimated_extra_charge', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['tenant_id', 'billing_month']);
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voice_agent_usage');
    }
};
