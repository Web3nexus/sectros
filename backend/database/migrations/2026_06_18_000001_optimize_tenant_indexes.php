<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected array $createdIndexes = [];

    public function getConnection(): ?string
    {
        return 'tenant';
    }

    public function up(): void
    {
        $this->fixUsersEmailUnique();

        $tables = [
            'menu_categories', 'menu_items', 'menu_item_addons',
            'restaurant_tables', 'staff_profiles', 'orders', 'order_items',
            'reservations', 'expenses', 'expense_receipts',
            'tenant_settings', 'notifications', 'ai_interactions',
            'tenant_knowledge', 'builder_pages', 'navigation_menus',
            'waitlists', 'blacklist', 'special_service_hours',
            'api_keys', 'franchises', 'branches',
            'tenant_reviews', 'tenant_galleries', 'tenant_rooms',
            'tenant_services', 'tenant_blog_posts', 'tenant_team_members',
            'tenant_inventory_items', 'shifts', 'attendance_logs',
            'payroll_records', 'settlement_records', 'staff_messages',
        ];

        foreach ($tables as $table) {
            if (!Schema::hasTable($table)) continue;
            if (!Schema::hasColumn($table, 'tenant_id')) continue;

            $this->addCompositeIndexIfNotExists($table, ['tenant_id', 'id']);

            if (!Schema::hasColumn($table, 'updated_at')) continue;
            $this->addCompositeIndexIfNotExists($table, ['tenant_id', 'updated_at']);
        }
    }

    public function down(): void
    {
        $indexes = Schema::getIndexes('users');
        $hasComposite = false;
        foreach ($indexes as $idx) {
            $cols = $idx['columns'] ?? [];
            if (in_array('tenant_id', $cols) && in_array('email', $cols) && ($idx['unique'] ?? false)) {
                $hasComposite = true;
                break;
            }
        }

        if ($hasComposite) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropUnique('users_tenant_id_email_unique');
            });
        }

        $hasGlobal = false;
        foreach ($indexes as $idx) {
            $cols = $idx['columns'] ?? [];
            if (in_array('email', $cols) && !in_array('tenant_id', $cols) && ($idx['unique'] ?? false)) {
                $hasGlobal = true;
                break;
            }
        }

        if (!$hasGlobal) {
            Schema::table('users', function (Blueprint $table) {
                $table->unique('email');
            });
        }

        foreach ($this->createdIndexes as $indexName) {
            $parts = explode('_tenant_id_', $indexName);
            $table = $parts[0] ?? '';
            if ($table && Schema::hasTable($table)) {
                try {
                    Schema::table($table, function (Blueprint $t) use ($indexName) {
                        $t->dropIndex($indexName);
                    });
                } catch (\Exception $e) {
                    Log::warning('Could not drop index during rollback', [
                        'index' => $indexName,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }
    }

    protected function fixUsersEmailUnique(): void
    {
        if (!Schema::hasTable('users')) return;

        $indexes = Schema::getIndexes('users');

        $hasGlobalEmailUnique = false;
        foreach ($indexes as $idx) {
            $cols = $idx['columns'] ?? [];
            if (in_array('email', $cols) && !in_array('tenant_id', $cols) && ($idx['unique'] ?? false)) {
                $hasGlobalEmailUnique = true;
                break;
            }
        }

        if ($hasGlobalEmailUnique) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropUnique(['email']);
            });
        }

        $hasCompositeUnique = false;
        foreach ($indexes as $idx) {
            $cols = $idx['columns'] ?? [];
            if (in_array('tenant_id', $cols) && in_array('email', $cols) && ($idx['unique'] ?? false)) {
                $hasCompositeUnique = true;
                break;
            }
        }

        if (!$hasCompositeUnique) {
            Schema::table('users', function (Blueprint $table) {
                $table->unique(['tenant_id', 'email'], 'users_tenant_id_email_unique');
            });
        }
    }

    protected function addCompositeIndexIfNotExists(string $table, array $columns): void
    {
        $indexName = $table . '_' . implode('_', $columns) . '_index';

        $existingIndexes = Schema::getIndexes($table);
        foreach ($existingIndexes as $idx) {
            $existingCols = $idx['columns'] ?? [];
            sort($existingCols);
            $sortedCols = $columns;
            sort($sortedCols);
            if ($existingCols === $sortedCols) {
                return;
            }
        }

        try {
            Schema::table($table, function (Blueprint $t) use ($columns, $indexName) {
                $t->index($columns, $indexName);
            });
            $this->createdIndexes[] = $indexName;
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                Log::warning('Failed to add composite index', [
                    'table' => $table,
                    'columns' => $columns,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
};
