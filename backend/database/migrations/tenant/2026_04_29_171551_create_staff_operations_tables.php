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
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_profile_id')->constrained('staff_profiles')->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['scheduled', 'checked_in', 'on_break', 'checked_out', 'missed'])->default('scheduled');
            $table->timestamps();
        });

        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_profile_id')->constrained('staff_profiles')->cascadeOnDelete();
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete();
            $table->timestamp('check_in')->nullable();
            $table->timestamp('check_out')->nullable();
            $table->timestamp('break_start')->nullable();
            $table->timestamp('break_end')->nullable();
            $table->decimal('total_hours', 8, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('payroll_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_profile_id')->constrained('staff_profiles')->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('base_salary', 10, 2);
            $table->decimal('overtime_pay', 10, 2)->default(0);
            $table->decimal('tips_share', 10, 2)->default(0);
            $table->decimal('total_payout', 10, 2);
            $table->enum('status', ['pending', 'paid'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_records');
        Schema::dropIfExists('attendance_logs');
        Schema::dropIfExists('shifts');
    }
};
