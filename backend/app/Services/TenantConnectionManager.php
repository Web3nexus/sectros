<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class TenantConnectionManager
{
    protected static array $activeConnections = [];

    public static function bootForTenant(Tenant $tenant): string
    {
        $tenantId = $tenant->getTenantKey();
        $connectionName = 'tenant_' . $tenantId;

        if (isset(self::$activeConnections[$connectionName])) {
            return $connectionName;
        }

        $tenantDbName = self::getTenantDatabaseName($tenant);
        $templateConfig = Config::get('database.connections.mysql');

        Config::set('database.connections.' . $connectionName, [
            'driver' => $templateConfig['driver'] ?? 'mysql',
            'host' => $templateConfig['host'] ?? '127.0.0.1',
            'port' => $templateConfig['port'] ?? '3306',
            'database' => $tenantDbName,
            'username' => $templateConfig['username'] ?? 'root',
            'password' => $templateConfig['password'] ?? '',
            'unix_socket' => $templateConfig['unix_socket'] ?? '',
            'charset' => $templateConfig['charset'] ?? 'utf8mb4',
            'collation' => $templateConfig['collation'] ?? 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? [
                \PDO::ATTR_TIMEOUT => 30,
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
                \PDO::MYSQL_ATTR_INIT_COMMAND => implode('; ', [
                    "SET SESSION wait_timeout = 60",
                    "SET SESSION max_execution_time = 30000",
                    "SET SESSION lock_wait_timeout = 10",
                    "SET SESSION interactive_timeout = 60",
                    "SET SESSION net_read_timeout = 30",
                    "SET SESSION net_write_timeout = 30",
                ]),
            ] : [],
        ]);

        self::$activeConnections[$connectionName] = true;

        DB::purge($connectionName);
        DB::reconnect($connectionName);

        return $connectionName;
    }

    public static function disconnect(string $connectionName): void
    {
        if (isset(self::$activeConnections[$connectionName])) {
            DB::disconnect($connectionName);
            unset(self::$activeConnections[$connectionName]);
        }
    }

    public static function disconnectAll(): void
    {
        foreach (array_keys(self::$activeConnections) as $name) {
            DB::disconnect($name);
        }
        self::$activeConnections = [];
    }

    public static function connectionName(Tenant $tenant): string
    {
        return 'tenant_' . $tenant->getTenantKey();
    }

    public static function setAsCurrent(string $connectionName): void
    {
        Config::set('database.connections.tenant', Config::get('database.connections.' . $connectionName));
        DB::purge('tenant');
        DB::reconnect('tenant');
    }

    protected static function getTenantDatabaseName(Tenant $tenant): string
    {
        $prefix = Config::get('tenancy.database.prefix', 'tenant');
        return $prefix . $tenant->getTenantKey();
    }

    public static function activeCount(): int
    {
        return count(self::$activeConnections);
    }
}
