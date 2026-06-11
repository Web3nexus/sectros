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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('staff')->after('password');
            }
            if (!Schema::hasColumn('users', 'features')) {
                $table->json('features')->nullable()->after('role');
            }
            if (!Schema::hasColumn('users', 'tenant_id')) {
                $table->string('tenant_id')->nullable()->after('role');
            }
            if (!Schema::hasColumn('users', 'two_factor_method')) {
                $table->string('two_factor_method')->default('none')->after('tenant_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'features')) {
                $table->dropColumn('features');
            }
            // We usually don't drop 'role' if it was intended to be core
        });
    }
};
