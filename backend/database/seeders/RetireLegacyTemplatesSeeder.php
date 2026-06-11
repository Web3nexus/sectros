<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WebsiteTemplate;

class RetireLegacyTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $eliteSlugs = [
            'blueprint-tastenest-dark',
            'blueprint-tastenest-light',
            'blueprint-coffee-house',
            'blueprint-salon-vogue',
            'blueprint-hotel-grand',
            'blueprint-salon-elegance',
            'blueprint-hotel-boutique',
        ];

        // 1. Deactivate everything
        WebsiteTemplate::where('is_active', true)->update(['is_active' => false]);

        // 2. Reactivate and Promote the Elite 5
        $count = WebsiteTemplate::whereIn('slug', $eliteSlugs)->update(['is_active' => true]);

        echo "Deactivated legacy templates. Reactivated {$count} Elite Blueprints.\n";
    }
}
