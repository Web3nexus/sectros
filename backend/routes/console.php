<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Process queued jobs (provisioning, webhooks, email) every minute
Schedule::command('queue:work', ['--stop-when-empty', '--tries=3', '--timeout=120', '--queue=default'])
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();
