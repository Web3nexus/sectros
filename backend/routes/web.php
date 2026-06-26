<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Response;

// ── SEO & Discovery Routes (root-level, not in SPA catch-all) ──
Route::get('/robots.txt', [\App\Http\Controllers\Api\SEOController::class, 'robots']);
Route::get('/sitemap.xml', [\App\Http\Controllers\Api\SEOController::class, 'sitemap']);
Route::get('/schema.json', [\App\Http\Controllers\Api\SEOController::class, 'jsonLdSchema']);

foreach (config('tenancy.central_domains') as $domain) {
    // Match exact central domain (e.g. sectros.com)
    Route::domain($domain)->group(function () {
        Route::get('/{any}', function () {
            return Response::make(
                file_get_contents(public_path('index.html')),
                200,
                [
                    'Content-Type'  => 'text/html',
                    'Cache-Control' => 'no-cache, no-store, must-revalidate',
                    'Pragma'        => 'no-cache',
                    'Expires'       => '0',
                ]
            );
        })->where('any', '^(?!(api|central-api|tenant-api|sanctum|cdn-cgi|_debugbar)).*$');
    });

    // Match management subdomains (e.g. el-santo.sectros.com)
    Route::domain('{subdomain}.' . $domain)->group(function () {
        Route::get('/{any}', function () {
            return Response::make(
                file_get_contents(public_path('index.html')),
                200,
                [
                    'Content-Type'  => 'text/html',
                    'Cache-Control' => 'no-cache, no-store, must-revalidate',
                    'Pragma'        => 'no-cache',
                    'Expires'       => '0',
                ]
            );
        })->where('any', '^(?!(api|central-api|tenant-api|sanctum|cdn-cgi|_debugbar)).+$');
    });
}
