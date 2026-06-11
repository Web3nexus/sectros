<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('franchises', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('owner_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('branches', function (Blueprint $table) {
            $table->unsignedBigInteger('franchise_id')->nullable()->after('id');
            $table->foreign('franchise_id')->references('id')->on('franchises')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropForeign(['franchise_id']);
            $table->dropColumn('franchise_id');
        });
        Schema::dropIfExists('franchises');
    }
};
