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
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->string('submitter_name', 255)->nullable()->after('category');
            $table->string('submitter_email', 255)->nullable()->after('submitter_name');
            $table->timestamp('dismissed_at')->nullable()->after('submitter_email');
        });
    }

    public function down(): void
    {
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropColumn(['submitter_name', 'submitter_email', 'dismissed_at']);
        });
    }
};
