<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->table('orders', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('total_amount');
            $table->string('dining_mode')->nullable()->after('customer_name');
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('orders', function (Blueprint $table) {
            $table->dropColumn(['customer_name', 'dining_mode']);
        });
    }
};
