<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->table('tenants', function (Blueprint $table) {
            $table->integer('voice_credits_used')->default(0)->after('sms_credits_reset_at');
            $table->integer('voice_credits_topup')->default(0)->after('voice_credits_used');
            $table->timestamp('voice_credits_reset_at')->nullable()->after('voice_credits_topup');
        });

        Schema::connection('platform')->table('subscription_plans', function (Blueprint $table) {
            $table->integer('voice_credits_limit')->nullable()->after('sms_credits_limit');
        });
    }

    public function down(): void
    {
        Schema::connection('platform')->table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn('voice_credits_limit');
        });

        Schema::connection('platform')->table('tenants', function (Blueprint $table) {
            $table->dropColumn(['voice_credits_used', 'voice_credits_topup', 'voice_credits_reset_at']);
        });
    }
};
