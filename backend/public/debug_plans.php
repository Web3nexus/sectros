<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\DB;

header('Content-Type: application/json');

try {
    // Force a fresh check
    $plans = SubscriptionPlan::all();
    echo json_encode([
        'db_database' => env('DB_DATABASE'),
        'count' => $plans->count(),
        'plans' => $plans,
        'table_exists' => \Illuminate\Support\Facades\Schema::hasTable('subscription_plans')
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
