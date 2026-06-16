<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\StaffProfile;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\RestaurantTable;
use Spatie\Permission\Models\Role;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $businessType = tenant('business_type') ?? 'restaurant';

        $ownerRole = Role::firstOrCreate(['name' => 'restaurant_owner', 'guard_name' => 'web']);
        $waiterRole = Role::firstOrCreate(['name' => 'waiter', 'guard_name' => 'web']);
        $managerRole = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);

        $ownerExists = User::where('role', 'owner')->exists();
        if (!$ownerExists) {
            $owner = User::create([
                'name' => tenant('owner_name') ?? 'Business Owner',
                'email' => tenant('owner_email') ?? 'owner@demo.com',
                'password' => Hash::make('password123'),
                'role' => 'owner',
            ]);
            $owner->assignRole($ownerRole);
        }

        $waiter = User::firstOrCreate(
            ['email' => 'waiter@demo.com'],
            [
                'name' => 'Demo Waiter',
                'password' => Hash::make('password123'),
                'role' => 'staff',
            ]
        );
        $waiter->assignRole($waiterRole);

        StaffProfile::firstOrCreate(
            ['user_id' => $waiter->id],
            ['role' => 'waiter', 'pin' => '1234', 'hourly_rate' => 15.00]
        );

        if ($businessType === 'restaurant' || $businessType === 'cafe') {
            $categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages'];
            foreach ($categories as $catName) {
                $category = MenuCategory::firstOrCreate(
                    ['name' => $catName],
                    ['is_active' => true]
                );
                MenuItem::firstOrCreate(
                    ['name' => "Sample {$catName} Item", 'menu_category_id' => $category->id],
                    ['description' => 'Freshly prepared', 'price' => 12.99, 'is_active' => true]
                );
            }

            for ($i = 1; $i <= 8; $i++) {
                RestaurantTable::firstOrCreate(
                    ['number' => "T{$i}"],
                    ['capacity' => 4, 'status' => 'available', 'is_active' => true]
                );
            }
        }

        if ($businessType === 'salon') {
            $services = ['Haircut', 'Styling', 'Coloring', 'Manicure', 'Facial'];
            foreach ($services as $svc) {
                \App\Models\StaffProfile::firstOrCreate(
                    ['name' => "{$svc} Specialist"],
                    ['role' => 'stylist', 'email' => strtolower(str_replace(' ', '.', $svc)) . '@demo.com', 'is_active' => true]
                );
            }
        }
    }
}
