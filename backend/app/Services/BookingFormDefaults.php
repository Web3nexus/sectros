<?php

namespace App\Services;

class BookingFormDefaults
{
    public static function get(string $type): array
    {
        $all = [
            'restaurant' => [
                'title' => 'Reserve Your Table',
                'subtitle' => 'Experience our seasonal menu in an atmosphere designed for excellence.',
                'fields' => [
                    ['name' => 'customer_name', 'label' => 'Full Name', 'type' => 'text', 'required' => true, 'enabled' => true],
                    ['name' => 'customer_email', 'label' => 'Email Address', 'type' => 'email', 'required' => true, 'enabled' => true],
                    ['name' => 'customer_phone', 'label' => 'Phone Number', 'type' => 'tel', 'required' => true, 'enabled' => true],
                    ['name' => 'reservation_date', 'label' => 'Reservation Date', 'type' => 'date', 'required' => true, 'enabled' => true],
                    ['name' => 'reservation_time', 'label' => 'Reservation Time', 'type' => 'time', 'required' => true, 'enabled' => true],
                    ['name' => 'party_size', 'label' => 'Number of Guests', 'type' => 'number', 'required' => true, 'enabled' => true],
                    ['name' => 'seating', 'label' => 'Seating Preference', 'type' => 'select', 'required' => false, 'enabled' => true, 'options' => ['Indoor', 'Outdoor', 'Window', 'Bar']],
                    ['name' => 'notes', 'label' => 'Special Requests', 'type' => 'textarea', 'required' => false, 'enabled' => true],
                ],
            ],
            'cafe' => [
                'title' => 'Book Your Experience',
                'subtitle' => 'Reserve a table or place a pickup order at your favorite cafe.',
                'fields' => [
                    ['name' => 'customer_name', 'label' => 'Full Name', 'type' => 'text', 'required' => true, 'enabled' => true],
                    ['name' => 'customer_email', 'label' => 'Email Address', 'type' => 'email', 'required' => true, 'enabled' => true],
                    ['name' => 'customer_phone', 'label' => 'Phone Number', 'type' => 'tel', 'required' => true, 'enabled' => true],
                    ['name' => 'type', 'label' => 'Type', 'type' => 'select', 'required' => true, 'enabled' => true, 'options' => ['Reservation', 'Pickup Order']],
                    ['name' => 'reservation_date', 'label' => 'Date', 'type' => 'date', 'required' => true, 'enabled' => true],
                    ['name' => 'reservation_time', 'label' => 'Time', 'type' => 'time', 'required' => true, 'enabled' => true],
                    ['name' => 'party_size', 'label' => 'Number of Guests', 'type' => 'number', 'required' => false, 'enabled' => true],
                    ['name' => 'notes', 'label' => 'Special Request', 'type' => 'textarea', 'required' => false, 'enabled' => true],
                ],
            ],
            'salon' => [
                'title' => 'Book an Appointment',
                'subtitle' => 'Expert beauty services tailored to your needs.',
                'fields' => [
                    ['name' => 'customer_name', 'label' => 'Full Name', 'type' => 'text', 'required' => true, 'enabled' => true],
                    ['name' => 'customer_email', 'label' => 'Email Address', 'type' => 'email', 'required' => true, 'enabled' => true],
                    ['name' => 'customer_phone', 'label' => 'Phone Number', 'type' => 'tel', 'required' => true, 'enabled' => true],
                    ['name' => 'stylist', 'label' => 'Preferred Stylist', 'type' => 'select', 'required' => false, 'enabled' => true, 'options' => []],
                    ['name' => 'reservation_date', 'label' => 'Appointment Date', 'type' => 'date', 'required' => true, 'enabled' => true],
                    ['name' => 'reservation_time', 'label' => 'Appointment Time', 'type' => 'time', 'required' => true, 'enabled' => true],
                    ['name' => 'notes', 'label' => 'Special Requests', 'type' => 'textarea', 'required' => false, 'enabled' => true],
                ],
            ],
            'hotel' => [
                'title' => 'Book Your Stay',
                'subtitle' => 'Experience luxury and comfort at its finest.',
                'fields' => [
                    ['name' => 'customer_name', 'label' => 'Full Name', 'type' => 'text', 'required' => true, 'enabled' => true],
                    ['name' => 'customer_email', 'label' => 'Email Address', 'type' => 'email', 'required' => true, 'enabled' => true],
                    ['name' => 'customer_phone', 'label' => 'Phone Number', 'type' => 'tel', 'required' => true, 'enabled' => true],
                    ['name' => 'check_in', 'label' => 'Check-in Date', 'type' => 'date', 'required' => true, 'enabled' => true],
                    ['name' => 'check_out', 'label' => 'Check-out Date', 'type' => 'date', 'required' => true, 'enabled' => true],
                    ['name' => 'guests', 'label' => 'Number of Guests', 'type' => 'number', 'required' => true, 'enabled' => true],
                    ['name' => 'room_type', 'label' => 'Room Type', 'type' => 'select', 'required' => true, 'enabled' => true, 'options' => []],
                    ['name' => 'notes', 'label' => 'Special Requests', 'type' => 'textarea', 'required' => false, 'enabled' => true],
                ],
            ],
        ];

        return $all[$type] ?? $all['restaurant'];
    }
}
