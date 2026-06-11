<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BusinessTypesDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $businessTypes = [
            'restaurant' => [
                'name' => 'Prime Steakhouse',
                'email' => 'steakhouse@demo.com',
            ],
            'cafe' => [
                'name' => 'Morning Brew Cafe',
                'email' => 'cafe@demo.com',
            ],
            'salon' => [
                'name' => 'Elite Beauty Salon',
                'email' => 'salon@demo.com',
            ],
            'hotel' => [
                'name' => 'The Grand Sectros Hotel',
                'email' => 'hotel@demo.com',
            ],
        ];

        $centralDomain = config('tenancy.central_domains')[0] ?? 'sectrosweb.test';

        foreach ($businessTypes as $type => $info) {
            $this->command->info("Creating demo tenant for: {$info['name']} ({$type})");

            $tenantId = Str::slug($info['name']);
            
            // 1. Create Tenant
            $tenant = Tenant::updateOrCreate(
                ['id' => $tenantId],
                [
                    'business_name' => $info['name'],
                    'business_type' => $type,
                    'plan' => 'pro',
                    'owner_email' => $info['email'],
                    'owner_name' => 'Demo Manager',
                    'country' => 'US',
                    'status' => 'active',
                    'data' => [
                        'status' => 'active',
                        'owner_name' => 'Demo Manager',
                        'owner_email' => $info['email'],
                        'business_type' => $type,
                    ]
                ]
            );

            // 2. Create Domain
            if (!$tenant->domains()->where('domain', $tenantId . '.' . $centralDomain)->exists()) {
                $tenant->domains()->create(['domain' => $tenantId . '.' . $centralDomain]);
            }

            // 3. Initialize and Create User / Seed Content
            $tenant->run(function () use ($info, $tenant) {
                // Create Owner User
                User::updateOrCreate(
                    ['email' => $info['email']],
                    [
                        'name' => 'Demo Manager',
                        'password' => Hash::make('password123'),
                        'role' => 'owner',
                        'tenant_id' => $tenant->id,
                    ]
                );

                // Run TenantDemoSeeder to give them some items
                $this->call(TenantDemoSeeder::class);
            });
        }

        $this->command->info("All demo business types seeded successfully!");
    }
}
