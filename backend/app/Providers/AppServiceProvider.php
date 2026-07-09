<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\ServiceProvider;
use App\Scopes\StrictTenantScope;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Builder::macro('withoutTenantScope', function () {
            return $this->withoutGlobalScope(StrictTenantScope::class);
        });

        \Illuminate\Support\Facades\RateLimiter::for('login', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(6)->by($request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('login-token', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->ip());
        });

        \App\Models\Tenant::observe(\App\Observers\TenantObserver::class);
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable((new \App\Models\SaaSSetting)->getTable())) {
                $settings = \App\Models\SaaSSetting::all()->pluck('value', 'key')->toArray();
                
                $mailer = strtolower($settings['mail_mailer'] ?? '');
                if ($mailer) {
                    config(['mail.default' => $mailer]);
                    
                    if ($mailer === 'smtp') {
                        config([
                            'mail.mailers.smtp.host' => !empty($settings['mail_host']) ? $settings['mail_host'] : config('mail.mailers.smtp.host'),
                            'mail.mailers.smtp.port' => !empty($settings['mail_port']) ? $settings['mail_port'] : config('mail.mailers.smtp.port'),
                            'mail.mailers.smtp.username' => !empty($settings['mail_username']) ? $settings['mail_username'] : config('mail.mailers.smtp.username'),
                            'mail.mailers.smtp.password' => !empty($settings['mail_password']) ? $settings['mail_password'] : config('mail.mailers.smtp.password'),
                            'mail.mailers.smtp.encryption' => ($settings['mail_encryption'] === 'null' ? null : (!empty($settings['mail_encryption']) ? $settings['mail_encryption'] : config('mail.mailers.smtp.encryption'))),
                        ]);
                    }
                    
                    if (!empty($settings['from_address'])) {
                        config(['mail.from.address' => $settings['from_address']]);
                    }
                }
            }
        } catch (\Exception $e) {
            // Fail silently during migrations/setup
        }
    }
}
