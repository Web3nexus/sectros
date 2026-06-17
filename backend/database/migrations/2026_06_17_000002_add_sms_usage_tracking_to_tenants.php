<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->integer('sms_credits_used')->default(0)->after('ai_credits_reset_at');
            $table->integer('sms_credits_topup')->default(0)->after('sms_credits_used');
            $table->timestamp('sms_credits_reset_at')->nullable()->after('sms_credits_topup');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['sms_credits_used', 'sms_credits_topup', 'sms_credits_reset_at']);
        });
    }
};
