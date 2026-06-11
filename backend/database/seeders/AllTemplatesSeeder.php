<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WebsiteTemplate;

class AllTemplatesSeeder extends Seeder
{
    public function run()
    {
        $templates = [
            [
                'name' => 'TasteNest Elite',
                'slug' => 'blueprint-tastenest-dark',
                'category' => 'restaurant',
                'preview_image_url' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
                'price' => 0,
                'is_free' => true,
                'is_active' => true,
                'sections_json' => [
                    ['id' => 'nav-1', 'type' => 'Navbar', 'content' => ['layout' => 'tastenest-dark', 'logo' => '{{restaurant_name}}', 'buttonText' => 'Book Table', 'phone' => '{{business_phone}}'], 'visible' => true],
                    ['id' => 'hero-1', 'type' => 'Hero', 'content' => ['layout' => 'tastenest-dark', 'title' => 'The Perfect Space to Enjoy Fantastic Food', 'subtitle' => 'Festive dining at {{restaurant_name}} where we are strong believers in using the very best produce.', 'imageUrl' => 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5?auto=format&fit=crop&q=80&w=1200', 'buttonText' => 'See Our Menus'], 'visible' => true],
                    ['id' => 'abt-1', 'type' => 'About', 'content' => ['layout' => 'tastenest-dark', 'title' => 'Our Culinary Journey', 'subtitle' => 'A legacy of flavor and passion for fine dining.', 'description' => 'Founded in 2024, {{restaurant_name}} has become a sanctuary for food lovers.'], 'visible' => true],
                    ['id' => 'menu-1', 'type' => 'Menu', 'content' => ['layout' => 'tastenest-dark', 'title' => 'Signature Dishes'], 'visible' => true],
                    ['id' => 'test-1', 'type' => 'Testimonials', 'content' => ['layout' => 'tastenest-dark', 'title' => 'What Our Guests Say'], 'visible' => true],
                    ['id' => 'res-1', 'type' => 'ReservationForm', 'content' => ['layout' => 'tastenest-dark', 'title' => 'Reserve a Table', 'subtitle' => 'Join us for an unforgettable dining experience.'], 'visible' => true],
                    ['id' => 'foot-1', 'type' => 'Footer', 'content' => ['layout' => 'tastenest-dark', 'title' => '{{restaurant_name}}', 'subtitle' => '{{business_address}}', 'phone' => '{{business_phone}}'], 'visible' => true]
                ],
                'theme_json' => ['primaryColor' => '#F70A38', 'secondaryColor' => '#FFC806', 'fontFamily' => 'Outfit']
            ],
            [
                'name' => 'TasteNest Classic',
                'slug' => 'blueprint-tastenest-light',
                'category' => 'restaurant',
                'preview_image_url' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
                'price' => 0,
                'is_free' => true,
                'is_active' => true,
                'sections_json' => [
                    ['id' => 'nav-1', 'type' => 'Navbar', 'content' => ['layout' => 'tastenest-light', 'logo' => '{{restaurant_name}}', 'buttonText' => 'Book Now', 'phone' => '{{business_phone}}'], 'visible' => true],
                    ['id' => 'hero-1', 'type' => 'Hero', 'content' => ['layout' => 'tastenest-light', 'title' => 'Best Food for Best People', 'subtitle' => 'Experience the finest dining at {{restaurant_name}} with our curated seasonal menu.', 'imageUrl' => 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5', 'buttonText' => 'Reserve Table'], 'visible' => true],
                    ['id' => 'abt-1', 'type' => 'About', 'content' => ['layout' => 'tastenest-light', 'title' => 'Discover Our Story', 'subtitle' => 'From Farm to Table', 'description' => 'We believe in the power of good food to bring people together.'], 'visible' => true],
                    ['id' => 'menu-1', 'type' => 'Menu', 'content' => ['layout' => 'tastenest-light', 'title' => 'Main Course'], 'visible' => true],
                    ['id' => 'test-1', 'type' => 'Testimonials', 'content' => ['layout' => 'tastenest-light', 'title' => 'Guest Reviews'], 'visible' => true],
                    ['id' => 'res-1', 'type' => 'ReservationForm', 'content' => ['layout' => 'tastenest-light', 'title' => 'Schedule Your Visit', 'subtitle' => 'Select your preferred time and date.'], 'visible' => true],
                    ['id' => 'foot-1', 'type' => 'Footer', 'content' => ['layout' => 'tastenest-light', 'title' => '{{restaurant_name}}', 'subtitle' => '{{business_address}}'], 'visible' => true]
                ],
                'theme_json' => ['primaryColor' => '#F70A38', 'secondaryColor' => '#FFC806', 'fontFamily' => 'Outfit']
            ],
            [
                'name' => 'Coffee House Elite',
                'slug' => 'blueprint-coffee-house',
                'category' => 'cafe',
                'preview_image_url' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
                'price' => 0,
                'is_free' => true,
                'is_active' => true,
                'sections_json' => [
                    ['id' => 'nav-1', 'type' => 'Navbar', 'content' => ['layout' => 'coffee-house', 'logo' => '{{restaurant_name}}', 'buttonText' => 'Get A Cup'], 'visible' => true],
                    ['id' => 'hero-1', 'type' => 'Hero', 'content' => ['layout' => 'coffee-house', 'title' => '{{restaurant_name}}', 'subtitle' => 'Awaken your senses with the finest roasted beans at {{restaurant_name}}.', 'imageUrl' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200', 'buttonText' => 'Order Now'], 'visible' => true],
                    ['id' => 'abt-1', 'type' => 'About', 'content' => ['layout' => 'tastenest-dark', 'title' => 'Crafted with Love', 'subtitle' => 'The Art of Coffee', 'description' => 'Our beans are ethically sourced and roasted to perfection in-house.'], 'visible' => true],
                    ['id' => 'menu-1', 'type' => 'Menu', 'content' => ['layout' => 'coffee-house', 'title' => 'Our Special Brews'], 'visible' => true],
                    ['id' => 'test-1', 'type' => 'Testimonials', 'content' => ['layout' => 'tastenest-dark', 'title' => 'Community Love'], 'visible' => true],
                    ['id' => 'foot-1', 'type' => 'Footer', 'content' => ['layout' => 'coffee-house', 'title' => '{{restaurant_name}}', 'phone' => '{{business_phone}}'], 'visible' => true]
                ],
                'theme_json' => ['primaryColor' => '#A58B6D', 'secondaryColor' => '#1F1A17', 'fontFamily' => 'Playfair Display']
            ],
            [
                'name' => 'Salon Vogue',
                'slug' => 'blueprint-salon-vogue',
                'category' => 'salon',
                'preview_image_url' => 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
                'price' => 0,
                'is_free' => true,
                'is_active' => true,
                'sections_json' => [
                    ['id' => 'nav-1', 'type' => 'Navbar', 'content' => ['layout' => 'salon-elegance', 'logo' => '{{restaurant_name}}', 'buttonText' => 'Book Now'], 'visible' => true],
                    ['id' => 'hero-1', 'type' => 'Hero', 'content' => ['layout' => 'salon-elegance', 'title' => 'Unveil Your Inner Radiance', 'subtitle' => 'Premium styling and beauty services tailored to your unique beauty.', 'imageUrl' => 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200', 'buttonText' => 'Book Now'], 'visible' => true],
                    ['id' => 'abt-1', 'type' => 'About', 'content' => ['layout' => 'salon-elegance', 'title' => 'Our Philosophy', 'subtitle' => 'Elegance & Care', 'description' => 'At {{restaurant_name}}, we believe beauty is about feeling confident.'], 'visible' => true],
                    ['id' => 'serv-1', 'type' => 'Services', 'content' => ['layout' => 'salon-elegance', 'title' => 'Beauty Treatments', 'subtitle' => 'Indulge in our range of premium salon services.'], 'visible' => true],
                    ['id' => 'test-1', 'type' => 'Testimonials', 'content' => ['layout' => 'salon-elegance', 'title' => 'Happy Clients'], 'visible' => true],
                    ['id' => 'res-1', 'type' => 'ReservationForm', 'content' => ['layout' => 'salon-elegance', 'title' => 'Schedule Your Visit', 'subtitle' => 'Select your preferred stylist and date.'], 'visible' => true],
                    ['id' => 'foot-1', 'type' => 'Footer', 'content' => ['layout' => 'salon-elegance', 'title' => '{{restaurant_name}}'], 'visible' => true]
                ],
                'theme_json' => ['primaryColor' => '#C49F7B', 'secondaryColor' => '#1A1A1A', 'fontFamily' => 'Raleway']
            ],
            [
                'name' => 'Grand Horizon Hospitality',
                'slug' => 'blueprint-hotel-grand',
                'category' => 'hotel',
                'preview_image_url' => 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600',
                'price' => 0,
                'is_free' => true,
                'is_active' => true,
                'sections_json' => [
                    ['id' => 'nav-1', 'type' => 'Navbar', 'content' => ['layout' => 'hotel-boutique', 'logo' => '{{restaurant_name}}', 'buttonText' => 'Reserve Room'], 'visible' => true],
                    ['id' => 'hero-1', 'type' => 'Hero', 'content' => ['layout' => 'hotel-boutique', 'title' => 'Your Sanctuary Awaits', 'subtitle' => 'Luxury accommodations and unparalleled service at {{restaurant_name}}.', 'imageUrl' => 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1200', 'buttonText' => 'Explore Rooms'], 'visible' => true],
                    ['id' => 'abt-1', 'type' => 'About', 'content' => ['layout' => 'hotel-boutique', 'title' => 'Modern Luxury', 'subtitle' => 'A World of Comfort', 'description' => 'Experience the pinnacle of hospitality at {{restaurant_name}}.'], 'visible' => true],
                    ['id' => 'serv-1', 'type' => 'Services', 'content' => ['layout' => 'hotel-boutique', 'title' => 'Available Suites', 'subtitle' => 'Choose from our range of luxury rooms.'], 'visible' => true],
                    ['id' => 'test-1', 'type' => 'Testimonials', 'content' => ['layout' => 'hotel-boutique', 'title' => 'Guest Stories'], 'visible' => true],
                    ['id' => 'foot-1', 'type' => 'Footer', 'content' => ['layout' => 'hotel-boutique', 'title' => '{{restaurant_name}}'], 'visible' => true]
                ],
                'theme_json' => ['primaryColor' => '#2C3E50', 'secondaryColor' => '#BDC3C7', 'fontFamily' => 'Playfair Display']
            ],
            [
                'name' => 'Salon Elegance',
                'slug' => 'blueprint-salon-elegance',
                'category' => 'salon',
                'preview_image_url' => 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=600',
                'price' => 0,
                'is_free' => true,
                'is_active' => true,
                'sections_json' => [
                    ['id' => 'nav-1', 'type' => 'Navbar', 'content' => ['layout' => 'salon-elegance', 'logo' => '{{restaurant_name}}', 'buttonText' => 'Book Now', 'phone' => '{{business_phone}}'], 'visible' => true],
                    ['id' => 'hero-1', 'type' => 'Hero', 'content' => ['layout' => 'salon-elegance', 'title' => 'We can create what you imagine', 'subtitle' => 'Welcome to your premium beauty experience.', 'imageUrl' => 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200', 'buttonText' => 'Discover Services'], 'visible' => true],
                    ['id' => 'abt-1', 'type' => 'About', 'content' => ['layout' => 'salon-elegance', 'title' => 'The Beauty Hub', 'subtitle' => 'Excellence in Hair & Beauty', 'description' => 'Our team of award-winning stylists is dedicated to you.'], 'visible' => true],
                    ['id' => 'serv-1', 'type' => 'Services', 'content' => ['layout' => 'salon-elegance', 'title' => 'Services & Prices', 'subtitle' => 'Enhance your natural beauty.'], 'visible' => true],
                    ['id' => 'test-1', 'type' => 'Testimonials', 'content' => ['layout' => 'salon-elegance', 'title' => 'Client Reviews'], 'visible' => true],
                    ['id' => 'res-1', 'type' => 'ReservationForm', 'content' => ['layout' => 'salon-elegance', 'title' => 'Book an Appointment', 'subtitle' => 'Select your service.'], 'visible' => true],
                    ['id' => 'foot-1', 'type' => 'Footer', 'content' => ['layout' => 'salon-elegance', 'title' => '{{restaurant_name}}', 'subtitle' => 'Your trusted destination.', 'phone' => '{{business_phone}}'], 'visible' => true]
                ],
                'theme_json' => ['primaryColor' => '#8B0000', 'secondaryColor' => '#F3DDCF', 'fontFamily' => 'Playfair Display']
            ],
            [
                'name' => 'Boutique Haven',
                'slug' => 'blueprint-hotel-boutique',
                'category' => 'hotel',
                'preview_image_url' => 'https://images.unsplash.com/photo-1542314831-c6a4d14d8373?auto=format&fit=crop&q=80&w=600',
                'price' => 0,
                'is_free' => true,
                'is_active' => true,
                'sections_json' => [
                    ['id' => 'nav-1', 'type' => 'Navbar', 'content' => ['layout' => 'hotel-boutique', 'logo' => '{{restaurant_name}}', 'buttonText' => 'Book Now'], 'visible' => true],
                    ['id' => 'hero-1', 'type' => 'Hero', 'content' => ['layout' => 'hotel-boutique', 'title' => 'Hotel for every moment rich in emotion', 'subtitle' => 'Experience warm boutique luxury.', 'imageUrl' => 'https://images.unsplash.com/photo-1542314831-c6a4d14d8373?auto=format&fit=crop&q=80&w=1200', 'buttonText' => 'Explore'], 'visible' => true],
                    ['id' => 'abt-1', 'type' => 'About', 'content' => ['layout' => 'hotel-boutique', 'title' => 'Quiet Luxury', 'subtitle' => 'Your Home Away From Home', 'description' => 'Nestled in the heart of the city.'], 'visible' => true],
                    ['id' => 'serv-1', 'type' => 'Services', 'content' => ['layout' => 'hotel-boutique', 'title' => 'Featured Rooms', 'subtitle' => 'Discover our elegant accommodations'], 'visible' => true],
                    ['id' => 'test-1', 'type' => 'Testimonials', 'content' => ['layout' => 'hotel-boutique', 'title' => 'Guest Experiences'], 'visible' => true],
                    ['id' => 'foot-1', 'type' => 'Footer', 'content' => ['layout' => 'hotel-boutique', 'title' => '{{restaurant_name}}', 'subtitle' => 'Warm boutique luxury.'], 'visible' => true]
                ],
                'theme_json' => ['primaryColor' => '#7C6A43', 'secondaryColor' => '#EFE7DA', 'fontFamily' => 'Playfair Display']
            ]
        ];

        foreach ($templates as $template) {
            WebsiteTemplate::updateOrCreate(
                ['slug' => $template['slug']],
                [
                    'name' => $template['name'],
                    'category' => $template['category'],
                    'preview_image_url' => $template['preview_image_url'],
                    'price' => $template['price'],
                    'is_free' => $template['is_free'],
                    'is_active' => $template['is_active'],
                    'sections_json' => $template['sections_json'],
                    'theme_json' => $template['theme_json'],
                    'html_content' => '<!-- Managed by Blueprint Engine -->',
                ]
            );
        }
    }
}
