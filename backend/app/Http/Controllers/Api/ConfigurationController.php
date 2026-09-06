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
        try {
            $settings = $this->cacheTenantSettings();
        } catch (\RuntimeException $e) {
            $settings = [];
        }
        $tenant = tenant();
        $tenantCountry = strtoupper($settings['country'] ?? $tenant?->country ?? 'US');

        $countryCurrencyMap = [
            'US' => ['currency' => 'USD', 'symbol' => '$'],
            'GB' => ['currency' => 'GBP', 'symbol' => '£'],
            'UK' => ['currency' => 'GBP', 'symbol' => '£'],
            'DE' => ['currency' => 'EUR', 'symbol' => '€'],
            'FR' => ['currency' => 'EUR', 'symbol' => '€'],
            'IT' => ['currency' => 'EUR', 'symbol' => '€'],
            'ES' => ['currency' => 'EUR', 'symbol' => '€'],
            'NL' => ['currency' => 'EUR', 'symbol' => '€'],
            'BE' => ['currency' => 'EUR', 'symbol' => '€'],
            'AT' => ['currency' => 'EUR', 'symbol' => '€'],
            'IE' => ['currency' => 'EUR', 'symbol' => '€'],
            'PT' => ['currency' => 'EUR', 'symbol' => '€'],
            'GR' => ['currency' => 'EUR', 'symbol' => '€'],
            'FI' => ['currency' => 'EUR', 'symbol' => '€'],
            'NG' => ['currency' => 'NGN', 'symbol' => '₦'],
            'GH' => ['currency' => 'GHS', 'symbol' => 'GH₵'],
            'KE' => ['currency' => 'KES', 'symbol' => 'KSh'],
            'ZA' => ['currency' => 'ZAR', 'symbol' => 'R'],
            'CA' => ['currency' => 'CAD', 'symbol' => 'CA$'],
            'AU' => ['currency' => 'AUD', 'symbol' => 'A$'],
            'NZ' => ['currency' => 'NZD', 'symbol' => 'NZ$'],
            'AE' => ['currency' => 'AED', 'symbol' => 'AED'],
            'SA' => ['currency' => 'SAR', 'symbol' => 'SAR'],
            'IN' => ['currency' => 'INR', 'symbol' => '₹'],
            'JP' => ['currency' => 'JPY', 'symbol' => '¥'],
            'CH' => ['currency' => 'CHF', 'symbol' => 'CHF'],
            'SE' => ['currency' => 'SEK', 'symbol' => 'kr'],
            'NO' => ['currency' => 'NOK', 'symbol' => 'kr'],
            'DK' => ['currency' => 'DKK', 'symbol' => 'kr'],
            'PL' => ['currency' => 'PLN', 'symbol' => 'zł'],
            'SG' => ['currency' => 'SGD', 'symbol' => 'S$'],
            'BR' => ['currency' => 'BRL', 'symbol' => 'R$'],
            'MX' => ['currency' => 'MXN', 'symbol' => 'MX$'],
        ];

        $matched = $countryCurrencyMap[$tenantCountry] ?? ['currency' => 'USD', 'symbol' => '$'];

        $defaults = [
            'business_name' => $tenant?->business_name ?? '',
            'business_phone' => $tenant?->business_phone ?? '',
            'business_address' => $tenant?->business_address ?? '',
            'business_type' => $tenant?->business_type ?? 'restaurant',
            'country' => $tenantCountry,
            'currency_code' => $matched['currency'],
            'currency_symbol' => $matched['symbol'],
            'primary_color' => '#11c685',
            'auto_responder' => false,
            'predictive_analytics' => false,
            'notification_email' => $tenant?->owner_email ?? '',
            'reservations_deposit_required' => false,
            'reservations_deposit_amount' => 0,
            'tax_rate' => 0,
            'service_charge' => 0,
            'auto_confirm_bookings' => true,
            'booking_slot_duration' => 90,
            'cancellation_policy' => 'Free cancellation up to 2 hours before scheduled booking.',
            'special_instructions' => '',
            'business_hours' => 'Mon-Sun: 10:00 AM - 10:00 PM',
        ];

        return response()->json(array_merge($defaults, $settings));
    }

    public function update(Request $request)
    {
        $allowed = [
            'business_name', 'business_phone', 'business_address', 'country',
            'currency_code', 'currency_symbol', 'primary_color', 'auto_responder',
            'predictive_analytics', 'notification_email', 'contact_email',
            'business_hours', 'reservation_rules', 'cancellation_policy', 'check_in_out_time',
            'delivery_settings', 'pickup_settings', 'tax_settings', 'tax_rate', 'service_charge',
            'staff_roles', 'notification_settings', 'booking_rules', 'auto_confirm_bookings',
            'booking_slot_duration', 'special_instructions',
            'reservations_deposit_required', 'reservations_deposit_amount',
        ];

        $this->transaction(function () use ($request, $allowed) {
            foreach ($request->only($allowed) as $key => $value) {
                $storeValue = is_array($value) ? json_encode($value) : (is_bool($value) ? ($value ? 'true' : 'false') : $value);
                TenantSetting::updateOrCreate(['key' => $key], ['value' => $storeValue]);
            }

            if ($request->filled('country')) {
                $tenant = tenant();
                if ($tenant) {
                    $tenant->country = strtoupper($request->country);
                    $tenant->save();
                }
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
