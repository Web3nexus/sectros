<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DirectorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Restaurants', 'slug' => 'restaurants', 'icon' => 'Utensils', 'description' => 'Fine dining, fast food, and local eateries.'],
            ['name' => 'Cafés', 'slug' => 'cafes', 'icon' => 'Coffee', 'description' => 'Coffee shops, bakeries, and brunch spots.'],
            ['name' => 'Salons', 'slug' => 'salons', 'icon' => 'Scissors', 'description' => 'Hair salons, barbershops, and beauty parlors.'],
            ['name' => 'Spas & Wellness', 'slug' => 'spas', 'icon' => 'Sparkles', 'description' => 'Massage, skin care, and holistic wellness.'],
            ['name' => 'Hotels & Stay', 'slug' => 'hotels', 'icon' => 'BedDouble', 'description' => 'Hotels, resorts, and boutique stays.'],
            ['name' => 'Clinics', 'slug' => 'clinics', 'icon' => 'Stethoscope', 'description' => 'Medical and dental clinics.'],
        ];

        foreach ($categories as $cat) {
            \App\Models\DirectoryCategory::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        $restaurantCat = \App\Models\DirectoryCategory::where('slug', 'restaurants')->first();
        $salonCat = \App\Models\DirectoryCategory::where('slug', 'salons')->first();

        \App\Models\DirectoryListing::updateOrCreate(
            ['slug' => 'the-noir-restaurant'],
            [
                'name' => 'The Noir Restaurant',
                'business_type' => 'restaurant',
                'category_id' => $restaurantCat->id,
                'description' => 'Modern European cuisine with a dark, sophisticated atmosphere.',
                'address' => '123 Fine St, Gastronomy District',
                'city' => 'New York',
                'country' => 'USA',
                'phone' => '+1 (555) 123-4567',
                'email' => 'hello@thenoir.com',
                'website' => 'https://thenoir.com',
                'is_verified' => true,
                'is_featured' => true,
                'rating_avg' => 4.8,
                'review_count' => 124,
                'price_range' => 3.0,
            ]
        );

        \App\Models\DirectoryListing::updateOrCreate(
            ['slug' => 'glam-studio'],
            [
                'name' => 'Glam Studio',
                'business_type' => 'salon',
                'category_id' => $salonCat->id,
                'description' => 'Luxury hair styling and coloring services.',
                'address' => '456 Style Ave, Fashion Block',
                'city' => 'Los Angeles',
                'country' => 'USA',
                'phone' => '+1 (555) 987-6543',
                'email' => 'info@glamstudio.com',
                'website' => 'https://glamstudio.com',
                'is_verified' => true,
                'is_featured' => false,
                'rating_avg' => 4.6,
                'review_count' => 89,
                'price_range' => 2.5,
            ]
        );
    }
}
