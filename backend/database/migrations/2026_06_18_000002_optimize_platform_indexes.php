<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected array $createdIndexes = [];

    public function up(): void
    {
        $connection = config('database.default', 'mysql');

        $indexes = [
            'tenant_themes' => [
                ['columns' => ['tenant_id', 'website_template_id'], 'name' => 'tt_tenant_tpl_idx'],
                ['columns' => ['tenant_id', 'purchased_at'], 'name' => 'tt_tenant_date_idx'],
            ],
            'tenant_addon' => [
                ['columns' => ['tenant_id', 'addon_id'], 'name' => 'ta_tenant_addon_idx'],
                ['columns' => ['tenant_id', 'status'], 'name' => 'ta_tenant_status_idx'],
            ],
            'tenant_whatsapp_connections' => [
                ['columns' => ['tenant_id', 'status'], 'name' => 'twc_tenant_status_idx'],
            ],
            'connected_accounts' => [
                ['columns' => ['tenant_id', 'channel'], 'name' => 'ca_tenant_channel_idx'],
                ['columns' => ['tenant_id', 'status'], 'name' => 'ca_tenant_status_idx'],
            ],
            'support_tickets' => [
                ['columns' => ['tenant_id', 'status'], 'name' => 'st_tenant_status_idx'],
                ['columns' => ['tenant_id', 'created_at'], 'name' => 'st_tenant_created_idx'],
            ],
            'audit_logs' => [
                ['columns' => ['tenant_id', 'action'], 'name' => 'al_tenant_action_idx'],
                ['columns' => ['tenant_id', 'created_at'], 'name' => 'al_tenant_created_idx'],
            ],
            'directory_listings' => [
                ['columns' => ['tenant_id', 'is_published'], 'name' => 'dl_tenant_published_idx'],
            ],
        ];

        foreach ($indexes as $table => $indices) {
            if (!Schema::connection($connection)->hasTable($table)) continue;
            foreach ($indices as $idx) {
                $this->addIndexIfNotExists($connection, $table, $idx['columns'], $idx['name']);
            }
        }
    }

    public function down(): void
    {
        $connection = config('database.default', 'mysql');
        foreach (array_reverse($this->createdIndexes) as $indexName) {
            $parts = explode('_', $indexName, 3);
            $tablePrefix = $parts[0] ?? '';
            $tableMap = [
                'tt' => 'tenant_themes',
                'ta' => 'tenant_addon',
                'twc' => 'tenant_whatsapp_connections',
                'ca' => 'connected_accounts',
                'st' => 'support_tickets',
                'al' => 'audit_logs',
                'dl' => 'directory_listings',
            ];
            $table = $tableMap[$tablePrefix] ?? null;
            if ($table && Schema::connection($connection)->hasTable($table)) {
                try {
                    Schema::connection($connection)->table($table, function (Blueprint $t) use ($indexName) {
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

    protected function addIndexIfNotExists(string $connection, string $table, array $columns, string $indexName): void
    {
        $existingIndexes = Schema::connection($connection)->getIndexes($table);
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
            Schema::connection($connection)->table($table, function (Blueprint $t) use ($columns, $indexName) {
                $t->index($columns, $indexName);
            });
            $this->createdIndexes[] = $indexName;
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                Log::warning('Failed to create index', [
                    'index' => $indexName,
                    'table' => $table,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
};
