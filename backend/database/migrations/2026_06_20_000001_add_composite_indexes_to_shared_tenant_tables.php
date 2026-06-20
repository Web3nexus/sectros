<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'menu_categories' => [
                ['tenant_id', 'id'],
            ],
            'restaurant_tables' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'branch_id'],
            ],
            'branches' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'franchise_id'],
            ],
            'franchises' => [
                ['tenant_id', 'id'],
            ],
            'tenant_settings' => [
                ['tenant_id', 'id'],
            ],
            'tenant_notifications' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'reference_id'],
            ],
            'ai_interactions' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'platform_account_id'],
            ],
            'tenant_knowledge' => [
                ['tenant_id', 'id'],
            ],
            'builder_pages' => [
                ['tenant_id', 'id'],
            ],
            'navigation_menus' => [
                ['tenant_id', 'id'],
            ],
            'expenses' => [
                ['tenant_id', 'id'],
            ],
            'waitlists' => [
                ['tenant_id', 'id'],
            ],
            'blacklist' => [
                ['tenant_id', 'id'],
            ],
            'special_service_hours' => [
                ['tenant_id', 'id'],
            ],
            'api_keys' => [
                ['tenant_id', 'id'],
            ],
            'tenant_reviews' => [
                ['tenant_id', 'id'],
            ],
            'tenant_galleries' => [
                ['tenant_id', 'id'],
            ],
            'tenant_rooms' => [
                ['tenant_id', 'id'],
            ],
            'tenant_services' => [
                ['tenant_id', 'id'],
            ],
            'tenant_blog_posts' => [
                ['tenant_id', 'id'],
            ],
            'tenant_team_members' => [
                ['tenant_id', 'id'],
            ],
            'tenant_inventory_items' => [
                ['tenant_id', 'id'],
            ],
            'staff_profiles' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'user_id'],
                ['tenant_id', 'branch_id'],
            ],
            'menu_items' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'menu_category_id'],
            ],
            'menu_item_addons' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'menu_item_id'],
            ],
            'orders' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'restaurant_table_id'],
                ['tenant_id', 'staff_profile_id'],
                ['tenant_id', 'branch_id'],
            ],
            'order_items' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'order_id'],
                ['tenant_id', 'menu_item_id'],
            ],
            'reservations' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'restaurant_table_id'],
                ['tenant_id', 'resource_id'],
                ['tenant_id', 'branch_id'],
            ],
            'expense_receipts' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'expense_id'],
            ],
            'shifts' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'staff_profile_id'],
            ],
            'attendance_logs' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'staff_profile_id'],
                ['tenant_id', 'shift_id'],
            ],
            'payroll_records' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'staff_profile_id'],
            ],
            'settlement_records' => [
                ['tenant_id', 'id'],
                ['tenant_id', 'staff_profile_id'],
            ],
        ];

        foreach ($tables as $tableName => $indexes) {
            if (!Schema::connection('tenant')->hasTable($tableName)) {
                continue;
            }

            foreach ($indexes as $columns) {
                $indexName = $tableName . '_' . implode('_', $columns) . '_composite';
                try {
                    Schema::connection('tenant')->table($tableName, function (Blueprint $table) use ($columns, $indexName) {
                        $table->index($columns, $indexName);
                    });
                } catch (\Exception $e) {
                    // Index may already exist
                }
            }
        }
    }

    public function down(): void
    {
        $tables = [
            'menu_categories' => [['tenant_id', 'id']],
            'restaurant_tables' => [['tenant_id', 'id'], ['tenant_id', 'branch_id']],
            'branches' => [['tenant_id', 'id'], ['tenant_id', 'franchise_id']],
            'franchises' => [['tenant_id', 'id']],
            'tenant_settings' => [['tenant_id', 'id']],
            'tenant_notifications' => [['tenant_id', 'id'], ['tenant_id', 'reference_id']],
            'ai_interactions' => [['tenant_id', 'id'], ['tenant_id', 'platform_account_id']],
            'tenant_knowledge' => [['tenant_id', 'id']],
            'builder_pages' => [['tenant_id', 'id']],
            'navigation_menus' => [['tenant_id', 'id']],
            'expenses' => [['tenant_id', 'id']],
            'waitlists' => [['tenant_id', 'id']],
            'blacklist' => [['tenant_id', 'id']],
            'special_service_hours' => [['tenant_id', 'id']],
            'api_keys' => [['tenant_id', 'id']],
            'tenant_reviews' => [['tenant_id', 'id']],
            'tenant_galleries' => [['tenant_id', 'id']],
            'tenant_rooms' => [['tenant_id', 'id']],
            'tenant_services' => [['tenant_id', 'id']],
            'tenant_blog_posts' => [['tenant_id', 'id']],
            'tenant_team_members' => [['tenant_id', 'id']],
            'tenant_inventory_items' => [['tenant_id', 'id']],
            'staff_profiles' => [['tenant_id', 'id'], ['tenant_id', 'user_id'], ['tenant_id', 'branch_id']],
            'menu_items' => [['tenant_id', 'id'], ['tenant_id', 'menu_category_id']],
            'menu_item_addons' => [['tenant_id', 'id'], ['tenant_id', 'menu_item_id']],
            'orders' => [['tenant_id', 'id'], ['tenant_id', 'restaurant_table_id'], ['tenant_id', 'staff_profile_id'], ['tenant_id', 'branch_id']],
            'order_items' => [['tenant_id', 'id'], ['tenant_id', 'order_id'], ['tenant_id', 'menu_item_id']],
            'reservations' => [['tenant_id', 'id'], ['tenant_id', 'restaurant_table_id'], ['tenant_id', 'resource_id'], ['tenant_id', 'branch_id']],
            'expense_receipts' => [['tenant_id', 'id'], ['tenant_id', 'expense_id']],
            'shifts' => [['tenant_id', 'id'], ['tenant_id', 'staff_profile_id']],
            'attendance_logs' => [['tenant_id', 'id'], ['tenant_id', 'staff_profile_id'], ['tenant_id', 'shift_id']],
            'payroll_records' => [['tenant_id', 'id'], ['tenant_id', 'staff_profile_id']],
            'settlement_records' => [['tenant_id', 'id'], ['tenant_id', 'staff_profile_id']],
        ];

        foreach ($tables as $tableName => $indexes) {
            if (!Schema::connection('tenant')->hasTable($tableName)) {
                continue;
            }

            foreach ($indexes as $columns) {
                $indexName = $tableName . '_' . implode('_', $columns) . '_composite';
                try {
                    Schema::connection('tenant')->table($tableName, function (Blueprint $table) use ($indexName) {
                        $table->dropIndex($indexName);
                    });
                } catch (\Exception $e) {
                    // Index may not exist
                }
            }
        }
    }
};
