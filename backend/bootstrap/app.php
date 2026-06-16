<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        then: function () {
            // Consolidated Central API (Working Prefix)
            Route::middleware('api')
                ->prefix('central-api')
                ->group(function () {
                    // SaaS Admin & Public Branding
                    require base_path('routes/admin.php');
                    
                    // Global Webhooks & Public Auth
                    require base_path('routes/api.php');
                });

            // Tenant API — accessible under both prefixes for transition
            Route::middleware('api')
                ->prefix('tenant-api')
                ->group(function () {
                    require base_path('routes/tenant.php');
                });
            Route::middleware('api')
                ->prefix('central-api')
                ->group(function () {
                    require base_path('routes/tenant.php');
                });
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
        $middleware->prepend(\App\Http\Middleware\TrustProxies::class);
        $middleware->append(\App\Http\Middleware\LocaleMiddleware::class);
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
        $middleware->alias([
            'tenancy.header' => \App\Http\Middleware\InitializeTenancyByHeader::class,
        ]);
        $middleware->redirectGuestsTo(function ($request) {
            if ($request->is('api/*') || $request->is('central-api/*') || $request->is('tenant-api/*')) {
                return null; // Return 401 JSON for API
            }
            return route('login');
        });
        $middleware->throttleApi('60', '1');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
