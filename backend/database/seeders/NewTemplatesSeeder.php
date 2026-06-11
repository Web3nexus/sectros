<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WebsiteTemplate;

class NewTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Salon Elegance ──────────────────────────────────────────────
        WebsiteTemplate::updateOrCreate(
            ['slug' => 'blueprint-salon-elegance'],
            [
                'name'              => 'Salon Elegance',
                'category'          => 'salon',
                'preview_image_url' => 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=600',
                'is_free'           => true,
                'price'             => 0,
                'is_active'         => true,
                'html_content'      => 'salon-elegance',   // layout key used by builder
                'theme_json'        => [
                    'primaryColor'   => '#8B0000',
                    'secondaryColor' => '#F3DDCF',
                    'fontFamily'     => 'Playfair Display',
                ],
                'sections_json'     => [
                    ['id' => 'nav-1',  'type' => 'Navbar',          'content' => ['layout' => 'salon-elegance', 'logo' => '{{restaurant_name}}', 'buttonText' => 'Book Now', 'phone' => '{{business_phone}}'], 'visible' => true],
                    ['id' => 'hero-1', 'type' => 'Hero',            'content' => ['layout' => 'salon-elegance', 'title' => 'We can create what you imagine', 'subtitle' => 'Welcome to your premium beauty experience. Discover modern treatments tailored just for you.', 'imageUrl' => 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200', 'buttonText' => 'Discover Services', 'categories' => ['Makeup', 'Hair Styling', 'Nail Care', 'Cosmetology']], 'visible' => true],
                    ['id' => 'serv-1', 'type' => 'Services',        'content' => ['layout' => 'salon-elegance', 'title' => 'Services & Prices', 'subtitle' => 'Enhance your natural beauty with our exclusive treatments.'], 'visible' => true],
                    ['id' => 'gal-1',  'type' => 'Gallery',         'content' => ['layout' => 'salon-elegance', 'title' => 'Instagram Feed', 'subtitle' => 'Follow us @salon.elegance'], 'visible' => true],
                    ['id' => 'test-1', 'type' => 'Testimonials',    'content' => ['layout' => 'salon-elegance', 'title' => 'Client Reviews'], 'visible' => true],
                    ['id' => 'res-1',  'type' => 'ReservationForm', 'content' => ['layout' => 'salon-elegance', 'title' => 'Book an Appointment', 'subtitle' => 'Select your service and preferred date.'], 'visible' => true],
                    ['id' => 'foot-1', 'type' => 'Footer',          'content' => ['layout' => 'salon-elegance', 'title' => '{{restaurant_name}}', 'subtitle' => 'Your trusted destination for beauty and care.', 'phone' => '{{business_phone}}'], 'visible' => true],
                ],
            ]
        );

        // ─── Boutique Haven ──────────────────────────────────────────────
        WebsiteTemplate::updateOrCreate(
            ['slug' => 'blueprint-hotel-boutique'],
            [
                'name'              => 'Boutique Haven',
                'category'          => 'hotel',
                'preview_image_url' => 'https://images.unsplash.com/photo-1542314831-c6a4d14d8373?auto=format&fit=crop&q=80&w=600',
                'is_free'           => true,
                'price'             => 0,
                'is_active'         => true,
                'html_content'      => 'hotel-boutique',   // layout key used by builder
                'theme_json'        => [
                    'primaryColor'   => '#7C6A43',
                    'secondaryColor' => '#EFE7DA',
                    'fontFamily'     => 'Playfair Display',
                ],
                'sections_json'     => [
                    ['id' => 'nav-1',  'type' => 'Navbar',       'content' => ['layout' => 'hotel-boutique', 'logo' => '{{restaurant_name}}', 'buttonText' => 'Book Now'], 'visible' => true],
                    ['id' => 'hero-1', 'type' => 'Hero',         'content' => ['layout' => 'hotel-boutique', 'title' => 'Hotel for every moment rich in emotion', 'subtitle' => 'Experience warm boutique luxury with cozy room photography and earthy accents.', 'imageUrl' => 'https://images.unsplash.com/photo-1542314831-c6a4d14d8373?auto=format&fit=crop&q=80&w=1200', 'buttonText' => 'Explore', 'buttonTextPrimary' => 'Book Now'], 'visible' => true],
                    ['id' => 'serv-1', 'type' => 'Services',     'content' => ['layout' => 'hotel-boutique', 'title' => 'Featured Rooms', 'subtitle' => 'Discover our elegant accommodations'], 'visible' => true],
                    ['id' => 'test-1', 'type' => 'Testimonials', 'content' => ['layout' => 'hotel-boutique', 'title' => 'Guest Experiences'], 'visible' => true],
                    ['id' => 'foot-1', 'type' => 'Footer',       'content' => ['layout' => 'hotel-boutique', 'title' => '{{restaurant_name}}', 'subtitle' => 'Warm boutique luxury.'], 'visible' => true],
                ],
            ]
        );

        $this->command->info('✅ Salon Elegance and Boutique Haven templates seeded successfully.');
    }
}
