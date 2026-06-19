<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->string('registrar', 50)->nullable()->after('ssl_status');
            $table->string('registrar_domain_id', 100)->nullable()->after('registrar');
            $table->decimal('purchase_price', 8, 2)->nullable()->after('registrar_domain_id');
            $table->decimal('renewal_price', 8, 2)->nullable()->after('purchase_price');
            $table->timestamp('registered_at')->nullable()->after('renewal_price');
            $table->timestamp('expires_at')->nullable()->after('registered_at');
            $table->boolean('auto_renew')->default(false)->after('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->dropColumn(['registrar', 'registrar_domain_id', 'purchase_price', 'renewal_price', 'registered_at', 'expires_at', 'auto_renew']);
        });
    }
};
