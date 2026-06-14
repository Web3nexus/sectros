<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateTenantData extends Command
{
    protected $signature = 'tenants:migrate-data
                            {--tenant= : Migrate only a specific tenant ID}
                            {--dry-run : Count rows without inserting}
                            {--force : Skip confirmation prompt}';

    protected $description = 'Migrate data from per-tenant databases into shared tenant tables';

    protected array $tableConfig = [
        // Level 0: No FK dependencies
        'menu_categories'      => ['dest' => 'menu_categories',      'fks' => []],
        'franchises'           => ['dest' => 'franchises',           'fks' => []],
        'expenses'             => ['dest' => 'expenses',             'fks' => []],
        'tenant_settings'      => ['dest' => 'tenant_settings',      'fks' => []],
        'notifications'        => ['dest' => 'tenant_notifications',  'fks' => []],
        'ai_interactions'      => ['dest' => 'ai_interactions',      'fks' => []],
        'tenant_knowledge'     => ['dest' => 'tenant_knowledge',     'fks' => []],
        'builder_pages'        => ['dest' => 'builder_pages',        'fks' => []],
        'navigation_menus'     => ['dest' => 'navigation_menus',     'fks' => []],
        'waitlists'            => ['dest' => 'waitlists',            'fks' => []],
        'blacklist'            => ['dest' => 'blacklist',            'fks' => []],
        'special_service_hours'=> ['dest' => 'special_service_hours','fks' => []],
        'api_keys'             => ['dest' => 'api_keys',             'fks' => []],
        'tenant_reviews'       => ['dest' => 'tenant_reviews',       'fks' => []],
        'tenant_galleries'     => ['dest' => 'tenant_galleries',     'fks' => []],
        'tenant_rooms'         => ['dest' => 'tenant_rooms',         'fks' => []],
        'tenant_services'      => ['dest' => 'tenant_services',      'fks' => []],
        'tenant_blog_posts'    => ['dest' => 'tenant_blog_posts',    'fks' => []],
        'tenant_team_members'  => ['dest' => 'tenant_team_members',  'fks' => []],
        'permissions'          => ['dest' => 'permissions',          'fks' => []],
        'roles'                => ['dest' => 'roles',                'fks' => []],
        // Level 1: Depend on Level 0
        'branches'             => ['dest' => 'branches',             'fks' => ['franchise_id' => 'franchises']],
        'restaurant_tables'    => ['dest' => 'restaurant_tables',    'fks' => ['branch_id' => 'branches']],
        'staff_profiles'       => ['dest' => 'staff_profiles',       'fks' => ['branch_id' => 'branches']],
        'menu_items'           => ['dest' => 'menu_items',           'fks' => ['menu_category_id' => 'menu_categories']],
        'expense_receipts'     => ['dest' => 'expense_receipts',     'fks' => ['expense_id' => 'expenses']],
        'model_has_permissions'=> ['dest' => 'model_has_permissions','fks' => ['permission_id' => 'permissions']],
        'model_has_roles'      => ['dest' => 'model_has_roles',      'fks' => ['role_id' => 'roles']],
        'role_has_permissions' => ['dest' => 'role_has_permissions', 'fks' => ['permission_id' => 'permissions', 'role_id' => 'roles']],
        // Level 2: Depend on Level 1
        'menu_item_addons'     => ['dest' => 'menu_item_addons',     'fks' => ['menu_item_id' => 'menu_items']],
        'orders'               => ['dest' => 'orders',               'fks' => ['restaurant_table_id' => 'restaurant_tables', 'staff_profile_id' => 'staff_profiles', 'branch_id' => 'branches']],
        'reservations'         => ['dest' => 'reservations',         'fks' => ['restaurant_table_id' => 'restaurant_tables', 'branch_id' => 'branches']],
        'shifts'               => ['dest' => 'shifts',               'fks' => ['staff_profile_id' => 'staff_profiles']],
        // Level 3: Depend on Level 2
        'order_items'          => ['dest' => 'order_items',          'fks' => ['order_id' => 'orders', 'menu_item_id' => 'menu_items']],
        'attendance_logs'      => ['dest' => 'attendance_logs',      'fks' => ['staff_profile_id' => 'staff_profiles', 'shift_id' => 'shifts']],
        'payroll_records'      => ['dest' => 'payroll_records',      'fks' => ['staff_profile_id' => 'staff_profiles']],
        'settlement_records'   => ['dest' => 'settlement_records',   'fks' => ['staff_profile_id' => 'staff_profiles']],
    ];

    public function handle(): int
    {
        if (!$this->option('force')) {
            $this->warn('WARNING: This will migrate tenant data from per-tenant databases to shared tables.');
            $this->warn('Ensure you have a full database backup before proceeding.');
            if (!$this->confirm('Do you have a backup and wish to continue?')) {
                return Command::FAILURE;
            }
        }

        $tenants = $this->option('tenant')
            ? [Tenant::findOrFail($this->option('tenant'))]
            : Tenant::all();

        $this->info('Found ' . count($tenants) . ' tenants to process.');
        $totalRows = 0;

        foreach ($tenants as $tenant) {
            $this->newLine();
            $this->info("Processing tenant: {$tenant->id} ({$tenant->business_name})");

            try {
                $rows = $this->migrateTenant($tenant);
                $totalRows += $rows;
                $this->info("  ✓ Completed ({$rows} rows migrated)");
            } catch (\Exception $e) {
                $this->error("  ✗ Failed: " . $e->getMessage());
                if (!$this->option('force')) {
                    return Command::FAILURE;
                }
            }
        }

        $this->newLine();
        $this->info("Migration complete. Total rows: {$totalRows}");

        return Command::SUCCESS;
    }

    protected function migrateTenant(Tenant $tenant): int
    {
        $tenantId = $tenant->id;
        $sourceDb = 'tenant' . $tenantId;
        $dryRun = $this->option('dry-run');
        $total = 0;
        $idMap = [];

        foreach ($this->tableConfig as $sourceTable => $config) {
            $destTable = $config['dest'];
            $fks = $config['fks'];

            if (!$this->tableExists($sourceDb, $sourceTable)) {
                $this->warn("  Table '{$sourceDb}.{$sourceTable}' not found. Skipping.");
                continue;
            }

            $count = $this->copyTable($sourceDb, $sourceTable, $destTable, $tenantId, $fks, $idMap, $dryRun);
            if ($count > 0 || $dryRun) {
                $this->line("  {$sourceTable} → {$destTable}: {$count} rows");
            }
            $total += $count;
        }

        return $total;
    }

    protected function copyTable(
        string $sourceDb,
        string $sourceTable,
        string $destTable,
        string $tenantId,
        array $fks,
        array &$idMap,
        bool $dryRun
    ): int {
        $conn = DB::connection('tenant');

        $sourceRows = $conn->select("SELECT * FROM `{$sourceDb}`.`{$sourceTable}`");

        if (empty($sourceRows)) {
            return 0;
        }

        if ($dryRun) {
            $idMap[$sourceTable] = [];
            return count($sourceRows);
        }

        $currentMaxId = (int) $conn->table($destTable)->max('id');
        $idOffset = $currentMaxId + 1;

        $prepared = [];
        $oldToNew = [];

        foreach ($sourceRows as $row) {
            $row = (array) $row;
            $oldId = (int) $row['id'];
            $newId = $oldId + $idOffset;

            foreach ($fks as $fkCol => $parentTable) {
                if (!empty($row[$fkCol]) && isset($idMap[$parentTable][(int) $row[$fkCol]])) {
                    $row[$fkCol] = $idMap[$parentTable][(int) $row[$fkCol]];
                }
            }

            $row['id'] = $newId;
            $row['tenant_id'] = $tenantId;

            $prepared[] = $row;
            $oldToNew[$oldId] = $newId;
        }

        foreach (array_chunk($prepared, 100) as $chunk) {
            $conn->table($destTable)->insert($chunk);
        }

        $idMap[$sourceTable] = $oldToNew;

        return count($sourceRows);
    }

    protected function tableExists(string $db, string $table): bool
    {
        try {
            return (bool) DB::select(
                "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
                [$db, $table]
            );
        } catch (\Exception) {
            return false;
        }
    }

    protected function databaseExists(string $name): bool
    {
        try {
            return (bool) DB::select("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?", [$name]);
        } catch (\Exception) {
            return false;
        }
    }
}
