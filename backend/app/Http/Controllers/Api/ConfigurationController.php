<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantSetting;
use App\Services\BookingFormDefaults;
use Illuminate\Http\Request;

class ConfigurationController extends Controller
{
    public function index()
    {
        $settings = $this->cacheTenantSettings();
        $tenant = tenant();

        $defaults = [
            'business_name' => $tenant?->business_name ?? '',
            'business_phone' => $tenant?->business_phone ?? '',
            'business_address' => $tenant?->business_address ?? '',
            'business_type' => $tenant?->business_type ?? 'restaurant',
            'currency_symbol' => '$',
            'primary_color' => '#1D4ED8',
            'auto_responder' => false,
            'predictive_analytics' => false,
            'notification_email' => $tenant?->owner_email ?? '',
        ];

        return response()->json(array_merge($defaults, $settings));
    }

    public function update(Request $request)
    {
        $allowed = [
            'business_name', 'business_phone', 'business_address', 'currency_symbol',
            'primary_color', 'auto_responder', 'predictive_analytics', 'notification_email',
            'business_hours', 'reservation_rules', 'cancellation_policy', 'check_in_out_time',
            'delivery_settings', 'pickup_settings', 'tax_settings', 'service_charge',
            'staff_roles', 'notification_settings', 'booking_rules',
        ];

        $this->transaction(function () use ($request, $allowed) {
            foreach ($request->only($allowed) as $key => $value) {
                $storeValue = is_array($value) ? json_encode($value) : (is_bool($value) ? ($value ? 'true' : 'false') : $value);
                TenantSetting::updateOrCreate(['key' => $key], ['value' => $storeValue]);
            }
        });

        TenantSetting::forgetCache();

        return response()->json(['message' => 'Settings saved successfully.']);
    }

    public function bookingForm()
    {
        $type = tenant('business_type') ?? 'restaurant';
        $saved = TenantSetting::where('key', 'booking_form_config')->value('value');
        $savedConfig = null;
        if ($saved) {
            try {
                $savedConfig = json_decode($saved, true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException $e) {
                \Log::warning('Corrupted booking_form_config detected', ['error' => $e->getMessage()]);
            }
        }

        $defaults = BookingFormDefaults::get($type);

        if ($savedConfig) {
            $merged = array_merge($defaults, $savedConfig);
            $merged['fields'] = $savedConfig['fields'] ?? $defaults['fields'];
            return response()->json($merged);
        }

        return response()->json($defaults);
    }

    public function saveBookingForm(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:1000',
            'fields' => 'nullable|array',
            'fields.*.name' => 'required|string',
            'fields.*.label' => 'required|string',
            'fields.*.type' => 'required|string|in:text,email,tel,select,textarea,number,date,time,datetime',
            'fields.*.required' => 'boolean',
            'fields.*.enabled' => 'boolean',
            'fields.*.options' => 'nullable|array',
        ]);

        $this->transaction(function () use ($validated) {
            TenantSetting::updateOrCreate(
                ['key' => 'booking_form_config'],
                ['value' => json_encode($validated)]
            );
        });

        TenantSetting::forgetCache();

        return response()->json(['message' => 'Booking form saved successfully.']);
    }

    public function schema()
    {
        $type = tenant('business_type') ?? 'restaurant';

        $schemas = [
            'restaurant' => [
                'table_settings' => ['label' => 'Table Settings', 'type' => 'group', 'icon' => 'Table'],
                'menu_settings' => ['label' => 'Menu Settings', 'type' => 'group', 'icon' => 'Utensils'],
                'reservation_rules' => ['label' => 'Reservation Rules', 'type' => 'textarea', 'icon' => 'BookOpen'],
                'order_settings' => ['label' => 'Order Settings', 'type' => 'group', 'icon' => 'ShoppingBag'],
                'delivery_settings' => ['label' => 'Delivery Settings', 'type' => 'group', 'icon' => 'Truck'],
                'pickup_settings' => ['label' => 'Pickup Settings', 'type' => 'group', 'icon' => 'Package'],
                'tax_and_service_charge' => ['label' => 'Tax & Service Charge', 'type' => 'group', 'icon' => 'Percent'],
                'staff_roles' => ['label' => 'Staff Roles', 'type' => 'group', 'icon' => 'Shield'],
                'notification_settings' => ['label' => 'Notification Settings', 'type' => 'group', 'icon' => 'Bell'],
            ],
            'cafe' => [
                'menu_settings' => ['label' => 'Menu Settings', 'type' => 'group', 'icon' => 'Utensils'],
                'pickup_settings' => ['label' => 'Pickup Settings', 'type' => 'group', 'icon' => 'Package'],
                'reservation_settings' => ['label' => 'Reservation Settings', 'type' => 'group', 'icon' => 'BookOpen'],
                'loyalty_settings' => ['label' => 'Loyalty Settings', 'type' => 'group', 'icon' => 'Award'],
                'stock_settings' => ['label' => 'Stock Settings', 'type' => 'group', 'icon' => 'Package'],
                'tax_settings' => ['label' => 'Tax Settings', 'type' => 'group', 'icon' => 'Percent'],
                'staff_roles' => ['label' => 'Staff Roles', 'type' => 'group', 'icon' => 'Shield'],
                'notification_settings' => ['label' => 'Notification Settings', 'type' => 'group', 'icon' => 'Bell'],
            ],
            'salon' => [
                'appointment_settings' => ['label' => 'Appointment Settings', 'type' => 'group', 'icon' => 'Calendar'],
                'staff_availability' => ['label' => 'Staff Availability', 'type' => 'group', 'icon' => 'Users'],
                'service_duration' => ['label' => 'Service Duration', 'type' => 'group', 'icon' => 'Clock'],
                'service_pricing' => ['label' => 'Service Pricing', 'type' => 'group', 'icon' => 'DollarSign'],
                'booking_rules' => ['label' => 'Booking Rules', 'type' => 'textarea', 'icon' => 'BookOpen'],
                'cancellation_rules' => ['label' => 'Cancellation Rules', 'type' => 'textarea', 'icon' => 'XCircle'],
                'client_reminder_settings' => ['label' => 'Client Reminder Settings', 'type' => 'group', 'icon' => 'Bell'],
                'product_sales_settings' => ['label' => 'Product Sales Settings', 'type' => 'group', 'icon' => 'ShoppingBag'],
                'staff_roles' => ['label' => 'Staff Roles', 'type' => 'group', 'icon' => 'Shield'],
                'notification_settings' => ['label' => 'Notification Settings', 'type' => 'group', 'icon' => 'Bell'],
            ],
            'hotel' => [
                'room_settings' => ['label' => 'Room Settings', 'type' => 'group', 'icon' => 'BedDouble'],
                'booking_rules' => ['label' => 'Booking Rules', 'type' => 'textarea', 'icon' => 'BookOpen'],
                'check_in_out_time' => ['label' => 'Check-in/Out Time', 'type' => 'group', 'icon' => 'Clock'],
                'cancellation_policy' => ['label' => 'Cancellation Policy', 'type' => 'textarea', 'icon' => 'XCircle'],
                'room_pricing' => ['label' => 'Room Pricing', 'type' => 'group', 'icon' => 'DollarSign'],
                'tax_and_fees' => ['label' => 'Tax & Fees', 'type' => 'group', 'icon' => 'Percent'],
                'housekeeping_settings' => ['label' => 'Housekeeping Settings', 'type' => 'group', 'icon' => 'Brush'],
                'maintenance_settings' => ['label' => 'Maintenance Settings', 'type' => 'group', 'icon' => 'Wrench'],
                'staff_roles' => ['label' => 'Staff Roles', 'type' => 'group', 'icon' => 'Shield'],
                'notification_settings' => ['label' => 'Notification Settings', 'type' => 'group', 'icon' => 'Bell'],
            ],
        ];

        return response()->json($schemas[$type] ?? $schemas['restaurant']);
    }
}
