<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AddTenantIdToUsers extends Command
{
    protected $signature = 'tenants:backfill-user-tenant-ids {--dry-run : Preview only}';

    protected $description = 'Backfill tenant_id on central users table from tenant databases';

    public function handle(): int
    {
        $tenants = Tenant::where('status', 'active')->get();
        $updated = 0;

        foreach ($tenants as $tenant) {
            $this->info("Processing tenant: {$tenant->id}");

            $sourceDb = $tenant->id;
            $tenantDbName = 'tenant' . $sourceDb;

            if (!$this->databaseExists($tenantDbName)) {
                $this->warn("  DB '{$tenantDbName}' not found. Skipping.");
                continue;
            }

            try {
                $users = DB::select("SELECT id, email FROM `{$tenantDbName}`.users");

                foreach ($users as $user) {
                    $existing = DB::connection('platform')
                        ->table('users')
                        ->where('email', $user->email)
                        ->whereNull('tenant_id')
                        ->first();

                    if ($existing) {
                        if (!$this->option('dry-run')) {
                            DB::connection('platform')
                                ->table('users')
                                ->where('id', $existing->id)
                                ->update(['tenant_id' => $tenant->id]);
                        }
                        $updated++;
                        $this->line("  Updated user {$existing->id} ({$user->email})");
                    }
                }
            } catch (\Exception $e) {
                $this->warn("  Error processing {$tenantDbName}: " . $e->getMessage());
            }
        }

        $this->info("Done. {$updated} users updated.");

        return Command::SUCCESS;
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
