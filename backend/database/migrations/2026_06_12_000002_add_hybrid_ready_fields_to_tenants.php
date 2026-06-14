<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('platform')->table('tenants', function (Blueprint $table) {
            if (!Schema::connection('platform')->hasColumn('tenants', 'db_mode')) {
                $table->string('db_mode')->default('shared')->after('business_type');
                $table->string('db_connection_name')->nullable()->after('db_mode');
                $table->string('db_host')->nullable()->after('db_connection_name');
                $table->string('db_port')->nullable()->after('db_host');
                $table->string('db_name')->nullable()->after('db_port');
                $table->string('db_username')->nullable()->after('db_name');
                $table->text('db_password_encrypted')->nullable()->after('db_username');
                $table->string('shard_key')->nullable()->after('db_password_encrypted');
                $table->timestamp('migrated_at')->nullable()->after('shard_key');
            }
        });

        Schema::connection('platform')->table('users', function (Blueprint $table) {
            if (!Schema::connection('platform')->hasColumn('users', 'legacy_tenant_database')) {
                $table->string('legacy_tenant_database')->nullable()->after('tenant_id');
                $table->unsignedBigInteger('legacy_id')->nullable()->after('legacy_tenant_database');
            }
        });
    }

    public function down(): void
    {
        Schema::connection('platform')->table('tenants', function (Blueprint $table) {
            $columns = ['db_mode', 'db_connection_name', 'db_host', 'db_port', 'db_name', 'db_username', 'db_password_encrypted', 'shard_key', 'migrated_at'];
            foreach ($columns as $col) {
                if (Schema::connection('platform')->hasColumn('tenants', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        Schema::connection('platform')->table('users', function (Blueprint $table) {
            $columns = ['legacy_tenant_database', 'legacy_id'];
            foreach ($columns as $col) {
                if (Schema::connection('platform')->hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
