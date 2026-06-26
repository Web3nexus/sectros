<?php

namespace App\Services\Voice;

use App\Models\InventoryItem;
use App\Models\MenuItem;
use App\Models\Tenant;
use App\Models\TenantRoom;
use App\Models\TenantService;
use App\Models\TenantSetting;
use App\Models\VoiceAgentKnowledgeBase;
use App\Models\VoiceAgentSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DefaultKnowledgeBasePopulator
{
    public function populate(int $tenantId): void
    {
        $existing = VoiceAgentKnowledgeBase::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->count();

        if ($existing > 0) {
            return;
        }

        try {
            DB::transaction(function () use ($tenantId) {
                $tenant = Tenant::withoutGlobalScopes()->find($tenantId);
                if (!$tenant) return;

                $settings = VoiceAgentSetting::withoutGlobalScopes()
                    ->where('tenant_id', $tenantId)
                    ->first();

                $businessType = $settings->business_type ?? $tenant->business_type ?? 'restaurant';
                $businessName = $settings->business_name ?? $tenant->business_name ?? 'the business';

                $this->createBusinessInfo($tenantId, $tenant, $settings);

                match ($businessType) {
                    'restaurant', 'cafe' => $this->createRestaurantItems($tenantId, $businessName),
                    'salon', 'spa' => $this->createSalonItems($tenantId),
                    'hotel' => $this->createHotelItems($tenantId, $businessName),
                    'fitness' => $this->createFitnessItems($tenantId),
                    default => null,
                };

                $this->createReviewItem($tenantId, $businessName);
            });

            Log::info("Default KB populated for tenant {$tenantId}");
        } catch (\Exception $e) {
            Log::error("Default KB population failed for tenant {$tenantId}: " . $e->getMessage());
        }
    }

    protected function createBusinessInfo(int $tenantId, Tenant $tenant, ?VoiceAgentSetting $settings): void
    {
        $address = TenantSetting::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('key', 'business_address')
            ->value('value');

        $businessPhone = $settings->business_phone_number ?? '';
        $email = $tenant->owner_email ?? '';

        $lines = ["Business Name: {$tenant->business_name}"];
        if ($address) $lines[] = "Address: {$address}";
        if ($businessPhone) $lines[] = "Phone: {$businessPhone}";
        if ($email) $lines[] = "Email: {$email}";
        if ($tenant->country) $lines[] = "Country: {$tenant->country}";

        VoiceAgentKnowledgeBase::withoutGlobalScopes()->create([
            'tenant_id' => $tenantId,
            'title' => 'Business Information',
            'content' => implode("\n", $lines),
            'category' => 'business_info',
            'is_active' => true,
        ]);

        $hoursSetting = TenantSetting::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('key', 'business_hours')
            ->first();

        if ($hoursSetting && $hoursSetting->value) {
            $hours = json_decode($hoursSetting->value, true);
            if (is_array($hours) && !empty($hours)) {
                $hoursLines = [];
                foreach ($hours as $day => $times) {
                    if (is_array($times)) {
                        $open = $times['open'] ?? $times[0] ?? '?';
                        $close = $times['close'] ?? $times[1] ?? '?';
                        $hoursLines[] = "{$day}: {$open} - {$close}";
                    } else {
                        $hoursLines[] = "{$day}: {$times}";
                    }
                }
                VoiceAgentKnowledgeBase::withoutGlobalScopes()->create([
                    'tenant_id' => $tenantId,
                    'title' => 'Business Hours',
                    'content' => implode("\n", $hoursLines),
                    'category' => 'hours',
                    'is_active' => true,
                ]);
            }
        }
    }

    protected function createRestaurantItems(int $tenantId, string $businessName): void
    {
        $items = MenuItem::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('is_available', true)
            ->get();

        if ($items->isEmpty()) {
            VoiceAgentKnowledgeBase::withoutGlobalScopes()->create([
                'tenant_id' => $tenantId,
                'title' => 'Menu',
                'content' => "{$businessName} offers a variety of dishes. Please call for the full menu details.",
                'category' => 'menu',
                'is_active' => true,
            ]);
            return;
        }

        $grouped = $items->groupBy(fn($item) => $item->category?->name ?? 'General');
        foreach ($grouped as $categoryName => $categoryItems) {
            $lines = [];
            foreach ($categoryItems as $item) {
                $price = $item->price ? '$' . number_format((float)$item->price, 2) : '';
                $desc = $item->description ? " - {$item->description}" : '';
                $lines[] = "- {$item->name}{$desc} {$price}";
            }

            VoiceAgentKnowledgeBase::withoutGlobalScopes()->create([
                'tenant_id' => $tenantId,
                'title' => "Menu: {$categoryName}",
                'content' => implode("\n", $lines),
                'category' => 'menu',
                'is_active' => true,
            ]);
        }
    }

    protected function createSalonItems(int $tenantId): void
    {
        $services = TenantService::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->get();

        if ($services->isEmpty()) {
            VoiceAgentKnowledgeBase::withoutGlobalScopes()->create([
                'tenant_id' => $tenantId,
                'title' => 'Services',
                'content' => 'We offer a range of beauty and wellness services. Please call for details and pricing.',
                'category' => 'services',
                'is_active' => true,
            ]);
            return;
        }

        $grouped = $services->groupBy('category');
        foreach ($grouped as $category => $categoryServices) {
            $label = $category ?: 'General';
            $lines = [];
            foreach ($categoryServices as $svc) {
                $price = $svc->price ? '$' . number_format((float)$svc->price, 2) : '';
                $duration = $svc->duration_minutes ? " ({$svc->duration_minutes} min)" : '';
                $desc = $svc->description ? " - {$svc->description}" : '';
                $lines[] = "- {$svc->name}{$desc} {$price}{$duration}";
            }

            VoiceAgentKnowledgeBase::withoutGlobalScopes()->create([
                'tenant_id' => $tenantId,
                'title' => "Services: {$label}",
                'content' => implode("\n", $lines),
                'category' => 'services',
                'is_active' => true,
            ]);
        }
    }

    protected function createHotelItems(int $tenantId, string $businessName): void
    {
        $rooms = TenantRoom::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->get();

        if ($rooms->isEmpty()) {
            VoiceAgentKnowledgeBase::withoutGlobalScopes()->create([
                'tenant_id' => $tenantId,
                'title' => 'Rooms & Accommodation',
                'content' => "{$businessName} offers comfortable accommodation. Please call for room availability and pricing.",
                'category' => 'services',
                'is_active' => true,
            ]);
            return;
        }

        $lines = [];
        foreach ($rooms as $room) {
            $price = $room->price ? '$' . number_format((float)$room->price, 2) . '/night' : '';
            $capacity = $room->capacity ? " (Sleeps {$room->capacity})" : '';
            $desc = $room->description ? " - {$room->description}" : '';
            $amenities = '';
            if (!empty($room->amenities)) {
                $amenityList = is_array($room->amenities) ? implode(', ', $room->amenities) : $room->amenities;
                $amenities = " [Amenities: {$amenityList}]";
            }
            $lines[] = "- {$room->name}{$desc} {$price}{$capacity}{$amenities}";
        }

        VoiceAgentKnowledgeBase::withoutGlobalScopes()->create([
            'tenant_id' => $tenantId,
            'title' => 'Rooms & Accommodation',
            'content' => implode("\n", $lines),
            'category' => 'services',
            'is_active' => true,
        ]);
    }

    protected function createFitnessItems(int $tenantId): void
    {
        $classes = TenantService::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->get();

        if ($classes->isEmpty()) {
            VoiceAgentKnowledgeBase::withoutGlobalScopes()->create([
                'tenant_id' => $tenantId,
                'title' => 'Classes & Programs',
                'content' => 'We offer a variety of fitness classes and training programs. Please call for the schedule and pricing.',
                'category' => 'services',
                'is_active' => true,
            ]);
            return;
        }

        $grouped = $classes->groupBy('category');
        foreach ($grouped as $category => $categoryServices) {
            $label = $category ?: 'General';
            $lines = [];
            foreach ($categoryServices as $svc) {
                $price = $svc->price ? '$' . number_format((float)$svc->price, 2) : '';
                $duration = $svc->duration_minutes ? " ({$svc->duration_minutes} min)" : '';
                $desc = $svc->description ? " - {$svc->description}" : '';
                $lines[] = "- {$svc->name}{$desc} {$price}{$duration}";
            }

            VoiceAgentKnowledgeBase::withoutGlobalScopes()->create([
                'tenant_id' => $tenantId,
                'title' => "Classes: {$label}",
                'content' => implode("\n", $lines),
                'category' => 'services',
                'is_active' => true,
            ]);
        }
    }

    protected function createReviewItem(int $tenantId, string $businessName): void
    {
        VoiceAgentKnowledgeBase::withoutGlobalScopes()->create([
            'tenant_id' => $tenantId,
            'title' => 'Leave a Review',
            'content' => "We value your feedback! After your visit, please let us know about your experience. You can leave a review by calling back or visiting our website. Your feedback helps us serve you better.",
            'category' => 'faq',
            'is_active' => true,
        ]);
    }
}
