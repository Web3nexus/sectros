<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use App\Models\Tenant;
use Illuminate\Support\Facades\Log;

$tenantId = "Crunchies56"; // Or any ID from the logs
$tenant = Tenant::find($tenantId);

if (!$tenant) {
    die("Tenant not found\n");
}

try {
    echo "Initializing tenancy for $tenantId...\n";
    tenancy()->initialize($tenant);
    
    echo "Creating user...\n";
    $user = \App\Models\User::updateOrCreate(
        ['email' => $tenant->owner_email],
        [
            'name' => $tenant->owner_name ?? 'Restaurant Owner',
            'password' => \Illuminate\Support\Facades\Hash::make('Welcome123!'),
            'role' => 'owner'
        ]
    );

    echo "User created: ID " . $user->id . "\n";

    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        echo "Assigning role...\n";
        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'owner']);
        $user->assignRole($role);
        echo "Role assigned.\n";
    }

    tenancy()->end();
    echo "Sync successful!\n";
} catch (\Exception $e) {
    echo "Sync failed: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
