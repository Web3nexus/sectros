<?php

namespace Database\Seeders;

use App\Models\Addon;
use Illuminate\Database\Seeder;

class AddonSeeder extends Seeder
{
    public function run(): void
    {
        Addon::updateOrCreate(['slug' => 'sms_credits'], [
            'name' => 'SMS Credits',
            'description' => 'Send booking confirmations and reminders via SMS.',
            'category' => 'communications',
            'price' => null,
            'unit_price' => 0.05,
            'unit_label' => 'per SMS',
            'billing_type' => 'usage',
            'features' => ['sms_notifications'],
            'is_active' => true,
        ]);

        Addon::updateOrCreate(['slug' => 'additional_staff'], [
            'name' => 'Additional Staff',
            'description' => 'Add extra team members with role-based access.',
            'category' => 'team',
            'price' => null,
            'unit_price' => 10.00,
            'unit_label' => '/staff/mo',
            'billing_type' => 'recurring',
            'features' => ['staff_management'],
            'is_active' => true,
        ]);

        Addon::updateOrCreate(['slug' => 'white_label_website'], [
            'name' => 'White-label Website',
            'description' => 'A branded website with online booking built in.',
            'category' => 'website',
            'price' => 19.00,
            'unit_price' => null,
            'unit_label' => '/mo',
            'billing_type' => 'recurring',
            'features' => ['white_label_website'],
            'is_active' => true,
        ]);
    }
}
