<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->string('type', 20)->default('subdomain')->after('domain');
            $table->boolean('is_verified')->default(false)->after('type');
            $table->timestamp('verified_at')->nullable()->after('is_verified');
            $table->string('verification_token', 64)->nullable()->after('verified_at');
            $table->string('ssl_status', 20)->default('none')->after('verification_token');
            $table->timestamp('last_checked_at')->nullable()->after('ssl_status');
        });
    }

    public function down(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->dropColumn(['type', 'is_verified', 'verified_at', 'verification_token', 'ssl_status', 'last_checked_at']);
        });
    }
};
