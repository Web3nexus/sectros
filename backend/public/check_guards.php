<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

$tenantId = "Crunchies56"; // Known good tenant
$tenant = Tenant::find($tenantId);

if (!$tenant) {
    die("Tenant not found\n");
}

try {
    tenancy()->initialize($tenant);
    $roles = DB::table('roles')->get();
    echo "Guard names in roles table:\n";
    foreach ($roles as $role) {
        echo "- " . $role->name . ": " . $role->guard_name . "\n";
    }
    tenancy()->end();
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
