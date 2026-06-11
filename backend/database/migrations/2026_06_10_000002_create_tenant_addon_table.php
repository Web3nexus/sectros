<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mysql')->create('tenant_addon', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('addon_id')->constrained('addons')->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->enum('status', ['active', 'inactive', 'cancelled'])->default('active');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['tenant_id', 'addon_id']);
        });
    }

    public function down(): void
    {
        Schema::connection('mysql')->dropIfExists('tenant_addon');
    }
};
