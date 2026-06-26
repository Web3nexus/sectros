<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SaaSBlog;
use App\Models\SaaSCustomerStory;
use App\Models\SaaSDocumentation;
use App\Models\SaaSHelpArticle;
use App\Models\SitemapEntry;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SEOController extends Controller
{
    public function robots()
    {
        $settings = $this->cacheSaaSSettings();
        $siteUrl = $settings['platform_site_domain'] ?? config('app.url');

        $disallow = [
            '/securegate/',
            '/dashboard/',
            '/builder/',
            '/login',
            '/register',
            '/forgot-password',
            '/reset-password',
            '/verify-email',
            '/order',
            '/access-denied',
            '/central-api/',
            '/tenant-api/',
            '/local-tenant-api/',
            '/sanctum/',
        ];

        $content = "User-agent: Googlebot\n";
        $content .= "User-agent: Bingbot\n";
        $content .= "User-agent: Slurp\n";
        $content .= "Crawl-delay: 10\n";
        foreach ($disallow as $path) {
            $content .= "Disallow: {$path}\n";
        }
        $content .= "\nUser-agent: *\n";
        $content .= "Disallow: /securegate/\n";
        $content .= "Disallow: /dashboard/\n";
        $content .= "Disallow: /builder/\n";
        $content .= "Disallow: /login\n";
        $content .= "Disallow: /register\n";
        $content .= "Disallow: /forgot-password\n";
        $content .= "Disallow: /reset-password\n";
        $content .= "Disallow: /verify-email\n";
        $content .= "Disallow: /order\n";
        $content .= "Disallow: /access-denied\n";
        $content .= "Disallow: /central-api/\n";
        $content .= "Disallow: /tenant-api/\n";
        $content .= "\nSitemap: {$siteUrl}/sitemap.xml\n";

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }

    public function sitemap()
    {
        $settings = $this->cacheSaaSSettings();
        $siteUrl = $settings['platform_site_domain'] ?? config('app.url');
        $siteUrl = rtrim($siteUrl, '/');

        $staticPages = [
            ['loc' => '/', 'priority' => '1.0', 'changefreq' => 'weekly'],
            ['loc' => '/pricing', 'priority' => '0.9', 'changefreq' => 'monthly'],
            ['loc' => '/features', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['loc' => '/about', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['loc' => '/blog', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['loc' => '/customers', 'priority' => '0.7', 'changefreq' => 'weekly'],
            ['loc' => '/docs', 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['loc' => '/help', 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['loc' => '/contact', 'priority' => '0.6', 'changefreq' => 'yearly'],
            ['loc' => '/privacy', 'priority' => '0.3', 'changefreq' => 'yearly'],
            ['loc' => '/solutions', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['loc' => '/integrations', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['loc' => '/directory', 'priority' => '0.7', 'changefreq' => 'daily'],
            ['loc' => '/community', 'priority' => '0.5', 'changefreq' => 'monthly'],
        ];

        $blogPosts = Cache::remember('sitemap_blogs', 3600, function () {
            return SaaSBlog::where('is_published', true)
                ->select('slug', 'updated_at')
                ->get();
        });

        $stories = Cache::remember('sitemap_stories', 3600, function () {
            return SaaSCustomerStory::where('is_published', true)
                ->select('slug', 'updated_at')
                ->get();
        });

        $docs = Cache::remember('sitemap_docs', 3600, function () {
            return SaaSDocumentation::where('is_published', true)
                ->select('slug', 'updated_at')
                ->get();
        });

        $tenantPages = Cache::remember('sitemap_tenant_entries', 3600, function () {
            return SitemapEntry::where('is_active', true)->get();
        });

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        foreach ($staticPages as $page) {
            $xml .= '<url>';
            $xml .= "<loc>{$siteUrl}{$page['loc']}</loc>";
            $xml .= "<priority>{$page['priority']}</priority>";
            $xml .= "<changefreq>{$page['changefreq']}</changefreq>";
            $xml .= "<lastmod>" . now()->toDateString() . "</lastmod>";
            $xml .= '</url>';
        }

        foreach ($blogPosts as $post) {
            $xml .= '<url>';
            $xml .= "<loc>{$siteUrl}/blog/{$post->slug}</loc>";
            $xml .= '<priority>0.7</priority>';
            $xml .= '<changefreq>monthly</changefreq>';
            $xml .= "<lastmod>{$post->updated_at->toDateString()}</lastmod>";
            $xml .= '</url>';
        }

        foreach ($stories as $story) {
            $xml .= '<url>';
            $xml .= "<loc>{$siteUrl}/customers/{$story->slug}</loc>";
            $xml .= '<priority>0.6</priority>';
            $xml .= '<changefreq>monthly</changefreq>';
            $xml .= "<lastmod>{$story->updated_at->toDateString()}</lastmod>";
            $xml .= '</url>';
        }

        foreach ($docs as $doc) {
            $xml .= '<url>';
            $xml .= "<loc>{$siteUrl}/docs/{$doc->slug}</loc>";
            $xml .= '<priority>0.5</priority>';
            $xml .= '<changefreq>monthly</changefreq>';
            $xml .= "<lastmod>{$doc->updated_at->toDateString()}</lastmod>";
            $xml .= '</url>';
        }

        foreach ($tenantPages as $entry) {
            $xml .= '<url>';
            $xml .= "<loc>{$siteUrl}{$entry->path}</loc>";
            $xml .= '<priority>' . ($entry->priority ?? '0.5') . '</priority>';
            $xml .= '<changefreq>' . ($entry->changefreq ?? 'weekly') . '</changefreq>';
            $xml .= "<lastmod>" . ($entry->updated_at?->toDateString() ?? now()->toDateString()) . "</lastmod>";
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    public function seoData(Request $request)
    {
        $path = $request->input('path', '/');
        $settings = $this->cacheSaaSSettings();
        $siteUrl = $settings['platform_site_domain'] ?? config('app.url');
        $platformName = $settings['platform_name'] ?? 'Sectros';
        $description = $settings['platform_description'] ?? 'All-in-one business management platform for restaurants, salons, and hotels.';

        $seo = $this->getSeoForPath($path, $platformName, $description, $siteUrl);

        return response()->json($seo);
    }

    public function jsonLdSchema(Request $request)
    {
        $settings = $this->cacheSaaSSettings();
        $siteUrl = $settings['platform_site_domain'] ?? config('app.url');
        $platformName = $settings['platform_name'] ?? 'Sectros';
        $description = $settings['platform_description'] ?? 'All-in-one business management platform.';

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'SoftwareApplication',
            'name' => $platformName,
            'description' => $description,
            'url' => $siteUrl,
            'applicationCategory' => 'BusinessManagement',
            'operatingSystem' => 'Web',
            'offers' => [
                '@type' => 'AggregateOffer',
                'priceCurrency' => 'USD',
                'availability' => 'https://schema.org/InStock',
            ],
        ];

        if (!empty($settings['platform_logo_url'])) {
            $schema['image'] = $settings['platform_logo_url'];
        }

        return response()->json($schema);
    }

    private function getSeoForPath(string $path, string $platformName, string $defaultDescription, string $siteUrl): array
    {
        $path = '/' . trim($path, '/');

        $pageMeta = [
            '/' => [
                'title' => $platformName . ' — All-in-One Business Platform',
                'description' => $defaultDescription,
                'og_type' => 'website',
            ],
            '/pricing' => [
                'title' => 'Pricing — ' . $platformName,
                'description' => 'Simple, transparent pricing for businesses of all sizes. Start free, upgrade as you grow.',
                'og_type' => 'website',
            ],
            '/features' => [
                'title' => 'Features — ' . $platformName,
                'description' => 'Discover powerful features: online reservations, digital menus, staff management, POS, and more.',
                'og_type' => 'website',
            ],
            '/about' => [
                'title' => 'About Us — ' . $platformName,
                'description' => 'Learn about our mission to empower local businesses with modern technology.',
                'og_type' => 'website',
            ],
            '/blog' => [
                'title' => 'Blog — ' . $platformName,
                'description' => 'Latest insights, tips, and news for business owners.',
                'og_type' => 'website',
            ],
            '/customers' => [
                'title' => 'Customer Stories — ' . $platformName,
                'description' => 'See how businesses like yours thrive with our platform.',
                'og_type' => 'website',
            ],
            '/contact' => [
                'title' => 'Contact Us — ' . $platformName,
                'description' => 'Get in touch with our team. We\'re here to help.',
                'og_type' => 'website',
            ],
            '/solutions' => [
                'title' => 'Solutions — ' . $platformName,
                'description' => 'Tailored solutions for restaurants, cafes, salons, hotels, and more.',
                'og_type' => 'website',
            ],
            '/integrations' => [
                'title' => 'Integrations — ' . $platformName,
                'description' => 'Connect your favorite tools and services with our platform.',
                'og_type' => 'website',
            ],
            '/directory' => [
                'title' => 'Business Directory — ' . $platformName,
                'description' => 'Discover local businesses in our curated directory.',
                'og_type' => 'website',
            ],
            '/docs' => [
                'title' => 'Documentation — ' . $platformName,
                'description' => 'Comprehensive guides and API documentation.',
                'og_type' => 'website',
            ],
            '/help' => [
                'title' => 'Help Center — ' . $platformName,
                'description' => 'Find answers to common questions and get support.',
                'og_type' => 'website',
            ],
            '/privacy' => [
                'title' => 'Privacy Policy — ' . $platformName,
                'description' => 'Our privacy policy and data handling practices.',
                'og_type' => 'website',
            ],
        ];

        $meta = $pageMeta[$path] ?? [
            'title' => $platformName,
            'description' => $defaultDescription,
            'og_type' => 'website',
        ];

        $meta['url'] = rtrim($siteUrl, '/') . $path;
        $meta['site_name'] = $platformName;

        return $meta;
    }
}
