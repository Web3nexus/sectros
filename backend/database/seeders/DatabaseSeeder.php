<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->resolved('tenancy') && tenancy()->initialized) {
            $this->call(TenantSeeder::class);
            return;
        }

        $this->call([
            AdminSeeder::class,
            TranslationSeeder::class,
            SubscriptionPlanSeeder::class,
            EmailTemplateSeeder::class,
            SaaSCMSSeeder::class,
            AllTemplatesSeeder::class,
            AddonSeeder::class,
        ]);
    }
}
