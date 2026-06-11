<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settlement_records', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->decimal('opening_balance', 10, 2);
            $table->decimal('closing_balance', 10, 2)->nullable();
            $table->decimal('cash_collected', 10, 2)->default(0);
            $table->decimal('card_collected', 10, 2)->default(0);
            $table->decimal('tips_collected', 10, 2)->default(0);
            $table->decimal('expenses_total', 10, 2)->default(0);
            $table->decimal('net_total', 10, 2)->nullable();
            $table->decimal('discrepancy', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('staff_profile_id')->constrained('staff_profiles'); // Responsible person
            $table->timestamps();
        });

        Schema::create('expense_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_id')->nullable()->constrained('expenses')->nullOnDelete();
            $table->string('file_path');
            $table->json('ai_extracted_data')->nullable();
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->boolean('is_reviewed')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expense_receipts');
        Schema::dropIfExists('settlement_records');
    }
};
