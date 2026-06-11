<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WebsiteTemplate;

class ThemeStoreSeeder extends Seeder
{
    public function run(): void
    {
        // 1. HARD PURGE: Physically delete all old templates to prevent ReferenceErrors and UI clutter.
        // We only want the 3 new Master Blueprints.
        WebsiteTemplate::query()->delete();

        // 1. TasteNest Elite (Dark/Red Flow)
        WebsiteTemplate::create([
            'slug' => 'blueprint-tastenest-dark',
            'name' => 'TasteNest Elite',
            'category' => 'restaurant',
            'price' => 0.00,
            'is_free' => true,
            'preview_image_url' => 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
            'sections_json' => [
                ['id' => 'nav-1', 'type' => 'Navbar', 'content' => ['layout' => 'tastenest-dark', 'logo' => '{{restaurant_name}}', 'buttonText' => 'Contact Us', 'phone' => '{{business_phone}}'], 'visible' => true],
                ['id' => 'hero-1', 'type' => 'Hero', 'content' => [
                    'layout' => 'tastenest-dark',
                    'title' => 'The Perfect Space to Enjoy Fantastic Food', 
                    'subtitle' => 'Festive dining at {{restaurant_name}} where we are strong believers in using the very best produce.', 
                    'imageUrl' => 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5?auto=format&fit=crop&w=800&q=80',
                    'buttonText' => 'See Our Menus',
                    'highlightCard' => ['title' => 'Sicilian Pizza', 'price' => '$20.85', 'label' => 'Weekly Special', 'image' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591']
                ], 'visible' => true],
                ['id' => 'serv-1', 'type' => 'Services', 'content' => [
                    'layout' => 'tastenest-dark', 'title' => 'New Ground with Dishes to be Enjoyed', 
                    'subtitle' => 'Defining the future of fine dining.',
                    'author' => 'Willimas James', 'authorRole' => 'Director and Chief Operations Officer'
                ], 'visible' => true],
                ['id' => 'menu-1', 'type' => 'Menu', 'content' => ['layout' => 'tastenest-dark'], 'visible' => true],
                ['id' => 'res-1', 'type' => 'ReservationForm', 'content' => ['layout' => 'tastenest-dark', 'title' => 'RESERVE A TABLE', 'subtitle' => 'Discover our New Menu!'], 'visible' => true],
                ['id' => 'cards-1', 'type' => 'FeaturedCards', 'content' => ['layout' => 'tastenest-dark', 'title' => 'Featured Dishes'], 'visible' => true],
                ['id' => 'test-1', 'type' => 'Testimonials', 'content' => ['layout' => 'tastenest-dark', 'title' => 'Our Customer Feedbacks'], 'visible' => true],
                ['id' => 'team-1', 'type' => 'Team', 'content' => ['layout' => 'tastenest-dark', 'title' => 'Meet Our Experts'], 'visible' => true],
                ['id' => 'cta-1', 'type' => 'CTABanner', 'content' => ['layout' => 'tastenest-dark', 'title' => 'Manage Your Restaurant Anytime! Anywhere!', 'subtitle' => 'Higher Reach. Showcase your Brand. Exclusive offers.'], 'visible' => true],
                ['id' => 'blog-1', 'type' => 'Blog', 'content' => ['layout' => 'tastenest-dark', 'title' => 'Recent News'], 'visible' => true],
                ['id' => 'foot-1', 'type' => 'Footer', 'content' => ['layout' => 'tastenest-dark', 'title' => '{{restaurant_name}}', 'subtitle' => '{{business_address}}', 'phone' => '{{business_phone}}'], 'visible' => true]
            ],
            'theme_json' => ['primaryColor' => '#F70A38', 'secondaryColor' => '#FFC806', 'fontFamily' => 'Outfit'],
            'html_content' => '<section class="bg-[#111] text-white py-20 text-center"><h1>TasteNest Elite Blueprint</h1><p>High-fidelity section-based architecture.</p></section>',
            'is_active' => true,
        ]);

        // 2. TasteNest Classic (Light/Bento Flow)
        WebsiteTemplate::create([
            'slug' => 'blueprint-tastenest-light',
            'name' => 'TasteNest Classic',
            'category' => 'restaurant',
            'price' => 0.00,
            'is_free' => true,
            'preview_image_url' => 'https://images.unsplash.com/photo-1414235077428-338988a2e8c0?auto=format&fit=crop&w=800&q=80',
            'sections_json' => [
                ['id' => 'nav-1', 'type' => 'Navbar', 'content' => ['layout' => 'tastenest-light', 'logo' => '{{restaurant_name}}', 'buttonText' => 'Contact Us', 'phone' => '{{business_phone}}'], 'visible' => true],
                ['id' => 'hero-1', 'type' => 'Hero', 'content' => [
                    'layout' => 'tastenest-light',
                    'title' => 'Best Food for Best Restaurants', 
                    'subtitle' => 'Experience the finest dining at {{restaurant_name}}.', 
                    'imageUrl' => 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5',
                    'buttonText' => 'Reserve Table'
                ], 'visible' => true],
                ['id' => 'about-1', 'type' => 'About', 'content' => ['layout' => 'tastenest-light', 'title' => 'Feel The Taste of Foods'], 'visible' => true],
                ['id' => 'menu-1', 'type' => 'Menu', 'content' => ['layout' => 'tastenest-light', 'title' => 'Delicious Menus'], 'visible' => true],
                ['id' => 'serv-1', 'type' => 'Services', 'content' => ['layout' => 'tastenest-light', 'title' => 'We Provide Best Services'], 'visible' => true],
                ['id' => 'deals-1', 'type' => 'FeaturedCards', 'content' => ['layout' => 'tastenest-light', 'title' => 'Deal of the Week'], 'visible' => true],
                ['id' => 'abt-2', 'type' => 'Gallery', 'content' => ['layout' => 'tastenest-light', 'title' => 'Private Dining and Events'], 'visible' => true],
                ['id' => 'cta-1', 'type' => 'CTABanner', 'content' => ['layout' => 'tastenest-light', 'title' => 'Highlighting its Unique Features and Experiences'], 'visible' => true],
                ['id' => 'res-1', 'type' => 'ReservationForm', 'content' => ['layout' => 'tastenest-light', 'title' => 'Reservation Table & Enjoy Dining Table'], 'visible' => true],
                ['id' => 'foot-1', 'type' => 'Footer', 'content' => ['layout' => 'tastenest-light', 'title' => '{{restaurant_name}}', 'subtitle' => '{{business_address}}'], 'visible' => true]
            ],
            'theme_json' => ['primaryColor' => '#F70A38', 'secondaryColor' => '#FFC806', 'fontFamily' => 'Outfit'],
            'html_content' => '<section class="bg-white text-slate-900 py-20 text-center"><h1>TasteNest Classic Blueprint</h1><p>Elegant bento-box inspired layout.</p></section>',
            'is_active' => true,
        ]);

        // 3. Coffee House Elite (Dark Classic Flow)
        WebsiteTemplate::create([
            'slug' => 'blueprint-coffee-house',
            'name' => 'Coffee House Elite',
            'category' => 'cafe',
            'price' => 0.00,
            'is_free' => true,
            'preview_image_url' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
            'sections_json' => [
                ['id' => 'nav-1', 'type' => 'Navbar', 'content' => ['layout' => 'coffee-house', 'logo' => '{{restaurant_name}}', 'buttonText' => 'Get A Cup'], 'visible' => true],
                ['id' => 'hero-1', 'type' => 'Hero', 'content' => [
                    'layout' => 'coffee-house',
                    'title' => '{{restaurant_name}}', 
                    'subtitle' => 'Awaken your senses with the finest roasted beans at {{restaurant_name}}.', 
                    'imageUrl' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
                    'buttonText' => 'Buy Coffee'
                ], 'visible' => true],
                ['id' => 'serv-1', 'type' => 'Services', 'content' => ['layout' => 'coffee-house', 'title' => 'Coffee Serves Best From your intent'], 'visible' => true],
                ['id' => 'about-1', 'type' => 'About', 'content' => ['layout' => 'coffee-house', 'title' => 'Explore The History Of the Cafe', 'subtitle' => 'Visitors 95k', 'imageUrl' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93'], 'visible' => true],
                ['id' => 'menu-1', 'type' => 'Menu', 'content' => ['layout' => 'coffee-house', 'title' => 'Our Special Menu'], 'visible' => true],
                ['id' => 'gal-1', 'type' => 'Gallery', 'content' => ['layout' => 'coffee-house'], 'visible' => true],
                ['id' => 'test-1', 'type' => 'Testimonials', 'content' => ['layout' => 'coffee-house', 'title' => 'What They Say'], 'visible' => true],
                ['id' => 'prod-1', 'type' => 'FeaturedCards', 'content' => ['layout' => 'coffee-house', 'title' => 'Our Products'], 'visible' => true],
                ['id' => 'blog-1', 'type' => 'Blog', 'content' => ['layout' => 'coffee-house', 'title' => 'Latest News and Blogs'], 'visible' => true],
                ['id' => 'foot-1', 'type' => 'Footer', 'content' => ['layout' => 'coffee-house', 'title' => '{{restaurant_name}}', 'phone' => '{{business_phone}}'], 'visible' => true]
            ],
            'theme_json' => ['primaryColor' => '#A58B6D', 'secondaryColor' => '#1F1A17', 'fontFamily' => 'Playfair Display'],
            'html_content' => '<section class="bg-[#120F0D] text-[#A0988E] py-20 text-center"><h1>Coffee House Elite</h1><p>Artisanal cafe experience.</p></section>',
            'is_active' => true,
        ]);
    }
}
