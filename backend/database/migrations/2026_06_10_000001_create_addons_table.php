<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mysql')->create('addons', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('category')->default('feature');
            $table->decimal('price', 10, 2)->nullable()->comment('Fixed monthly/one-time price');
            $table->decimal('unit_price', 10, 4)->nullable()->comment('Per-unit price (e.g. per SMS, per staff)');
            $table->string('unit_label')->nullable()->comment('e.g. "per SMS", "/staff/mo", "/mo"');
            $table->enum('billing_type', ['one-time', 'recurring', 'usage'])->default('recurring');
            $table->json('features')->nullable()->comment('Feature keys this add-on enables');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('mysql')->dropIfExists('addons');
    }
};
