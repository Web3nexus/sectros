<?php

namespace Database\Seeders;

use App\Models\SitemapEntry;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SitemapEntrySeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::where('status', 'active')->get();

        $now = now();

        foreach ($tenants as $tenant) {
            $slug = Str::slug($tenant->business_name ?? $tenant->id);
            if (empty($slug) || strlen($slug) < 2) {
                $slug = $tenant->id;
            }

            $type = $tenant->business_type;

            $entries = $this->getEntriesForType($type, $slug);

            foreach ($entries as $entry) {
                SitemapEntry::updateOrCreate(
                    ['tenant_id' => $tenant->id, 'path' => $entry['path']],
                    [
                        'priority' => $entry['priority'],
                        'changefreq' => $entry['changefreq'],
                        'is_active' => true,
                        'lastmod' => $now,
                    ]
                );
            }
        }
    }

    private function getEntriesForType(?string $type, string $slug): array
    {
        $home = [
            'path' => "/{$slug}",
            'priority' => '0.8',
            'changefreq' => 'weekly',
        ];

        $common = [
            ['path' => "/{$slug}/about", 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['path' => "/{$slug}/contact", 'priority' => '0.4', 'changefreq' => 'monthly'],
            ['path' => "/{$slug}/gallery", 'priority' => '0.5', 'changefreq' => 'weekly'],
        ];

        $pages = [$home];

        $typePages = match ($type) {
            'restaurant', 'cafe' => [
                ['path' => "/{$slug}/menu", 'priority' => '0.7', 'changefreq' => 'daily'],
                ['path' => "/{$slug}/reservations", 'priority' => '0.6', 'changefreq' => 'weekly'],
                ['path' => "/{$slug}/reviews", 'priority' => '0.5', 'changefreq' => 'weekly'],
            ],
            'salon', 'spa' => [
                ['path' => "/{$slug}/services", 'priority' => '0.7', 'changefreq' => 'weekly'],
                ['path' => "/{$slug}/booking", 'priority' => '0.6', 'changefreq' => 'weekly'],
                ['path' => "/{$slug}/team", 'priority' => '0.5', 'changefreq' => 'monthly'],
            ],
            'hotel' => [
                ['path' => "/{$slug}/rooms", 'priority' => '0.7', 'changefreq' => 'daily'],
                ['path' => "/{$slug}/booking", 'priority' => '0.6', 'changefreq' => 'weekly'],
                ['path' => "/{$slug}/amenities", 'priority' => '0.5', 'changefreq' => 'monthly'],
            ],
            'fitness' => [
                ['path' => "/{$slug}/classes", 'priority' => '0.7', 'changefreq' => 'weekly'],
                ['path' => "/{$slug}/schedule", 'priority' => '0.6', 'changefreq' => 'weekly'],
                ['path' => "/{$slug}/pricing", 'priority' => '0.6', 'changefreq' => 'monthly'],
            ],
            'clinic' => [
                ['path' => "/{$slug}/providers", 'priority' => '0.7', 'changefreq' => 'weekly'],
                ['path' => "/{$slug}/appointments", 'priority' => '0.6', 'changefreq' => 'weekly'],
                ['path' => "/{$slug}/services", 'priority' => '0.6', 'changefreq' => 'monthly'],
            ],
            default => [
                ['path' => "/{$slug}/services", 'priority' => '0.6', 'changefreq' => 'weekly'],
            ],
        };

        return array_merge($pages, $common, $typePages);
    }
}
