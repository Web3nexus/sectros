<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function hasColumn(string $table, string $column): bool
    {
        return Schema::connection('tenant')->hasColumn($table, $column);
    }

    private function hasIndex(string $table, string $index): bool
    {
        return Schema::connection('tenant')->hasIndex($table, $index);
    }

    public function up(): void
    {
        Schema::connection('tenant')->table('permissions', function (Blueprint $table) {
            if (!$this->hasColumn('permissions', 'tenant_id')) {
                $table->string('tenant_id')->default('')->after('id');
                $table->index('tenant_id');
            }
            if ($this->hasIndex('permissions', 'permissions_name_guard_name_unique')) {
                $table->dropUnique('permissions_name_guard_name_unique');
            }
        });

        Schema::connection('tenant')->table('roles', function (Blueprint $table) {
            if (!$this->hasColumn('roles', 'tenant_id')) {
                $table->string('tenant_id')->default('')->after('id');
                $table->index('tenant_id');
            }
            if ($this->hasIndex('roles', 'roles_name_guard_name_unique')) {
                $table->dropUnique('roles_name_guard_name_unique');
            }
        });

        Schema::connection('tenant')->table('model_has_permissions', function (Blueprint $table) {
            if (!$this->hasColumn('model_has_permissions', 'tenant_id')) {
                $table->dropForeign('model_has_permissions_permission_id_foreign');
                $table->dropPrimary('model_has_permissions_permission_model_type_primary');
                $table->string('tenant_id')->default('')->after('permission_id');
                $table->index('tenant_id');
                $table->primary(['tenant_id', 'permission_id', 'model_id', 'model_type'], 'model_has_permissions_permission_model_type_primary');
                $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete();
            } else {
                $this->recreatePrimaryAndForeign('model_has_permissions', 'permission_id', 'permissions',
                    'model_has_permissions_permission_model_type_primary', 'model_has_permissions_permission_id_foreign');
            }
        });

        Schema::connection('tenant')->table('model_has_roles', function (Blueprint $table) {
            if (!$this->hasColumn('model_has_roles', 'tenant_id')) {
                $table->dropForeign('model_has_roles_role_id_foreign');
                $table->dropPrimary('model_has_roles_role_model_type_primary');
                $table->string('tenant_id')->default('')->after('role_id');
                $table->index('tenant_id');
                $table->primary(['tenant_id', 'role_id', 'model_id', 'model_type'], 'model_has_roles_role_model_type_primary');
                $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
            }
        });

        Schema::connection('tenant')->table('role_has_permissions', function (Blueprint $table) {
            if (!$this->hasColumn('role_has_permissions', 'tenant_id')) {
                $table->dropForeign('role_has_permissions_permission_id_foreign');
                $table->dropForeign('role_has_permissions_role_id_foreign');
                $table->dropPrimary('role_has_permissions_permission_id_role_id_primary');
                $table->string('tenant_id')->default('')->after('role_id');
                $table->index('tenant_id');
                $table->primary(['tenant_id', 'permission_id', 'role_id'], 'role_has_permissions_permission_id_role_id_primary');
                $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete();
                $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
            }
        });
    }

    private function recreatePrimaryAndForeign(string $table, string $fkCol, string $refTable, string $pkName, string $fkName): void
    {
        $conn = Schema::connection('tenant')->getConnection();
        $pks = $conn->select("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'",
            [$conn->getDatabaseName(), $table]);
        if (empty($pks)) {
            $conn->update("UPDATE `{$table}` SET `tenant_id` = '' WHERE `tenant_id` IS NULL");
            $conn->statement("ALTER TABLE `{$table}` ADD PRIMARY KEY (`tenant_id`, `{$fkCol}`, `model_id`, `model_type`)");
        }
        $fks = $conn->select("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?",
            [$conn->getDatabaseName(), $table, $fkName]);
        if (empty($fks)) {
            $conn->statement("ALTER TABLE `{$table}` ADD CONSTRAINT `{$fkName}` FOREIGN KEY (`{$fkCol}`) REFERENCES `{$refTable}`(`id`) ON DELETE CASCADE");
        }
    }

    public function down(): void
    {
        Schema::connection('tenant')->table('model_has_permissions', function (Blueprint $table) {
            if ($this->hasColumn('model_has_permissions', 'tenant_id')) {
                $conn = Schema::connection('tenant')->getConnection();
                $pks = $conn->select("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'",
                    [$conn->getDatabaseName(), 'model_has_permissions']);
                if (!empty($pks)) {
                    $table->dropPrimary('model_has_permissions_permission_model_type_primary');
                }
                $table->dropForeign('model_has_permissions_permission_id_foreign');
                $table->dropIndex(['tenant_id']);
                $table->dropColumn('tenant_id');
                $table->primary(['permission_id', 'model_id', 'model_type'], 'model_has_permissions_permission_model_type_primary');
                $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete();
            }
        });

        Schema::connection('tenant')->table('model_has_roles', function (Blueprint $table) {
            if ($this->hasColumn('model_has_roles', 'tenant_id')) {
                $table->dropForeign('model_has_roles_role_id_foreign');
                $table->dropPrimary('model_has_roles_role_model_type_primary');
                $table->dropIndex(['tenant_id']);
                $table->dropColumn('tenant_id');
                $table->primary(['role_id', 'model_id', 'model_type'], 'model_has_roles_role_model_type_primary');
                $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
            }
        });

        Schema::connection('tenant')->table('role_has_permissions', function (Blueprint $table) {
            if ($this->hasColumn('role_has_permissions', 'tenant_id')) {
                $table->dropForeign('role_has_permissions_permission_id_foreign');
                $table->dropForeign('role_has_permissions_role_id_foreign');
                $table->dropPrimary('role_has_permissions_permission_id_role_id_primary');
                $table->dropIndex(['tenant_id']);
                $table->dropColumn('tenant_id');
                $table->primary(['permission_id', 'role_id'], 'role_has_permissions_permission_id_role_id_primary');
                $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete();
                $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
            }
        });

        Schema::connection('tenant')->table('permissions', function (Blueprint $table) {
            if ($this->hasColumn('permissions', 'tenant_id')) {
                $table->dropIndex(['tenant_id']);
                $table->dropColumn('tenant_id');
                $table->unique(['name', 'guard_name']);
            }
        });

        Schema::connection('tenant')->table('roles', function (Blueprint $table) {
            if ($this->hasColumn('roles', 'tenant_id')) {
                $table->dropIndex(['tenant_id']);
                $table->dropColumn('tenant_id');
                $table->unique(['name', 'guard_name']);
            }
        });
    }
};
