<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SuperAdmin\SaaSController;

Route::get('/public/branding', [SaaSController::class, 'getPublicBranding']);
Route::get('/public/tenant-by-domain/{domain}', [SaaSController::class, 'getTenantByDomain'])->middleware('throttle:10,1');
Route::get('/public/theme', [SaaSController::class, 'getPublicTheme']);
Route::post('/public/support-tickets', [SaaSController::class, 'storeSupportTicket'])->middleware('throttle:10,1');
