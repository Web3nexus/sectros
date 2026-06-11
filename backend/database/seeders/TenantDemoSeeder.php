<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\TenantSetting;

class TenantDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Service Hours
        TenantSetting::updateOrCreate(['key' => 'service_hours'], [
            'value' => [
                'Monday' => '11:00 AM - 10:00 PM',
                'Tuesday' => '11:00 AM - 10:00 PM',
                'Wednesday' => '11:00 AM - 10:00 PM',
                'Thursday' => '11:00 AM - 10:00 PM',
                'Friday' => '11:00 AM - 12:00 AM',
                'Saturday' => '10:00 AM - 12:00 AM',
                'Sunday' => '10:00 AM - 9:00 PM',
            ]
        ]);

        // 2. Menu Categories & Items
        $starters = MenuCategory::create([
            'name' => 'Starters & Small Plates',
            'description' => 'Perfect for sharing or as a light beginning.',
            'is_active' => true
        ]);

        MenuItem::create([
            'menu_category_id' => $starters->id,
            'name' => 'Wagyu Beef Tartare',
            'description' => 'Quail egg, truffled mustard, house-made brioche toast.',
            'price' => 28.00,
            'is_available' => true
        ]);

        MenuItem::create([
            'menu_category_id' => $starters->id,
            'name' => 'Pan-Seared Scallops',
            'description' => 'Cauliflower purée, brown butter caper sauce, crispy pancetta.',
            'price' => 32.00,
            'is_available' => true
        ]);

        $mains = MenuCategory::create([
            'name' => 'Signature Mains',
            'description' => 'Our finest culinary creations.',
            'is_active' => true
        ]);

        MenuItem::create([
            'menu_category_id' => $mains->id,
            'name' => 'Dry-Aged Duck Breast',
            'description' => 'Spiced honey glaze, lavender-rubbed skin, parsnip purée.',
            'price' => 44.00,
            'is_available' => true
        ]);
        
        MenuItem::create([
            'menu_category_id' => $mains->id,
            'name' => 'Herb-Crusted Rack of Lamb',
            'description' => 'Minted pea mash, rosemary reduction, roasted baby carrots.',
            'price' => 48.00,
            'is_available' => true
        ]);
        
        $desserts = MenuCategory::create([
            'name' => 'Patisserie',
            'description' => 'The perfect sweet conclusion.',
            'is_active' => true
        ]);

        MenuItem::create([
            'menu_category_id' => $desserts->id,
            'name' => 'Yuzu Mochi',
            'description' => 'Refreshing Japanese citrus rice cakes.',
            'price' => 12.00,
            'is_available' => true
        ]);
    }
}
