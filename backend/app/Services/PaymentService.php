<?php

namespace App\Services;

use App\Models\SaaSSetting;
use App\Models\Tenant;
use App\Models\Addon;
use App\Models\SubscriptionPlan;
use App\Models\WebsiteTemplate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Get the appropriate payment gateway based on country and availability.
     */
    public static function getGateway(?string $country = null)
    {
        $country = strtoupper($country ?? 'US');
        
        $stripeEnabled = SaaSSetting::where('key', 'stripe_enabled')->first()?->value === 'true';
        $paystackEnabled = SaaSSetting::where('key', 'paystack_enabled')->first()?->value === 'true';
        $flutterwaveEnabled = SaaSSetting::where('key', 'flutterwave_enabled')->first()?->value === 'true';
        $dodoEnabled = SaaSSetting::where('key', 'dodo_enabled')->first()?->value === 'true';

        // Paystack is great for NG, GH, ZA, KE
        $paystackCountries = ['NG', 'GH', 'ZA', 'KE'];
        if ($paystackEnabled && in_array($country, $paystackCountries)) {
            return 'paystack';
        }

        // Flutterwave for rest of Africa or if specifically requested
        $africanCountries = ['EG', 'MA', 'CI', 'SN', 'UG', 'TZ', 'RW', 'CM'];
        if ($flutterwaveEnabled && in_array($country, $africanCountries)) {
            return 'flutterwave';
        }

        // Dodo Payments for emerging markets (Asia, LatAm, parts of Africa/MENA)
        $dodoCountries = ['IN', 'ID', 'BR', 'MX', 'CO', 'PE', 'CL', 'PH', 'VN', 'TH', 'BD', 'PK', 'MY', 'SG', 'AE', 'SA', 'TR', 'ZA', 'KE', 'EG', 'NG', 'GH'];
        if ($dodoEnabled && in_array($country, $dodoCountries)) {
            return 'dodo';
        }

        // Default to Stripe if enabled
        if ($stripeEnabled) {
            return 'stripe';
        }

        // Fallback to whatever is enabled if the primary choice isn't
        if ($paystackEnabled) return 'paystack';
        if ($flutterwaveEnabled) return 'flutterwave';
        if ($dodoEnabled) return 'dodo';

        return null;
    }

    /**
     * Initialize a checkout/subscription session.
     */
    public function initializePayment(Tenant $tenant, SubscriptionPlan $plan, string $interval = 'monthly')
    {
        $gateway = self::getGateway($tenant->country);
        $amount = $interval === 'yearly' ? $plan->yearly_price : $plan->monthly_price;
        $currency = SaaSSetting::where('key', 'default_currency')->first()?->value ?? 'USD';

        if (!$gateway) {
            throw new \Exception("No payment gateway available for this region.");
        }

        return match($gateway) {
            'stripe' => $this->initStripe($tenant, $plan, $amount, $currency, $interval),
            'paystack' => $this->initPaystack($tenant, $plan, $amount, $currency, $interval),
            'flutterwave' => $this->initFlutterwave($tenant, $plan, $amount, $currency, $interval),
            'dodo' => $this->initDodo($tenant, $plan, $amount, $currency, $interval),
            default => throw new \Exception("Unsupported gateway."),
        };
    }

    /**
     * Initialize a payment session for a Reservation Deposit.
     */
    public function initializeReservationDeposit(Tenant $tenant, \App\Models\Reservation $reservation, string $successUrl, string $cancelUrl)
    {
        $gateway = self::getGateway($tenant->country);

        if (!$gateway) {
            throw new \Exception("No payment gateway available for this region.");
        }

        return match($gateway) {
            'stripe' => $this->initStripeDeposit($tenant, $reservation, $successUrl, $cancelUrl),
            'paystack' => $this->initPaystackDeposit($tenant, $reservation, $successUrl, $cancelUrl),
            'flutterwave' => $this->initFlutterwaveDeposit($tenant, $reservation, $successUrl, $cancelUrl),
            'dodo' => $this->initDodoDeposit($tenant, $reservation, $successUrl, $cancelUrl),
            default => throw new \Exception("Unsupported gateway for reservation deposit."),
        };
    }

    /**
     * Initialize a one-time payment session for a Website Theme.
     */
    public function initializeThemePurchase(Tenant $tenant, WebsiteTemplate $template)
    {
        $gateway = self::getGateway($tenant->country);
        $amount = $template->price;
        $currency = SaaSSetting::where('key', 'default_currency')->first()?->value ?? 'USD';

        if (!$gateway) {
            throw new \Exception("No payment gateway available for this region.");
        }

        return match($gateway) {
            'stripe' => $this->initStripeTheme($tenant, $template, $amount, $currency),
            'paystack' => $this->initPaystackTheme($tenant, $template, $amount, $currency),
            'flutterwave' => $this->initFlutterwaveTheme($tenant, $template, $amount, $currency),
            'dodo' => $this->initDodoTheme($tenant, $template, $amount, $currency),
            default => throw new \Exception("Unsupported gateway for theme purchase."),
        };
    }

    /**
     * Initialize a one-time or recurring payment for an Add-on.
     */
    public function initializeAddonPurchase(Tenant $tenant, Addon $addon, int $quantity, float $total, string $country)
    {
        $gateway = self::getGateway($country);
        $currency = SaaSSetting::where('key', 'default_currency')->first()?->value ?? 'USD';

        if (!$gateway) {
            throw new \Exception("No payment gateway available for this region.");
        }

        $isRecurring = $addon->billing_type === 'recurring';

        return match($gateway) {
            'stripe' => $this->initStripeAddon($tenant, $addon, $total, $currency, $quantity, $isRecurring),
            'paystack' => $this->initPaystackAddon($tenant, $addon, $total, $currency, $quantity),
            'flutterwave' => $this->initFlutterwaveAddon($tenant, $addon, $total, $currency, $quantity),
            'dodo' => $this->initDodoAddon($tenant, $addon, $total, $currency, $quantity),
            default => throw new \Exception("Unsupported gateway for add-on purchase."),
        };
    }

    private function initStripeAddon($tenant, $addon, $amount, $currency, $quantity, $isRecurring)
    {
        $secretKey = SaaSSetting::where('key', 'stripe_secret_key')->first()?->value;

        $lineItem = [
            'price_data' => [
                'currency' => strtolower($currency),
                'product_data' => [
                    'name' => "Add-on: {$addon->name}" . ($quantity > 1 ? " (x{$quantity})" : ''),
                    'description' => $addon->description ?? "Sectros add-on",
                ],
                'unit_amount' => (int) round($amount * 100),
            ],
            'quantity' => 1,
        ];

        if ($isRecurring) {
            $lineItem['price_data']['recurring'] = ['interval' => 'month'];
        }

        $response = Http::withToken($secretKey)->post('https://api.stripe.com/v1/checkout/sessions', [
            'payment_method_types' => ['card'],
            'line_items' => [$lineItem],
            'mode' => $isRecurring ? 'subscription' : 'payment',
            'success_url' => config('app.url') . "/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}",
            'cancel_url' => config('app.url') . "/dashboard/billing?canceled=true",
            'client_reference_id' => $tenant->id,
            'customer_email' => $tenant->data['email'] ?? null,
            'metadata' => [
                'type' => 'addon_purchase',
                'addon_id' => $addon->id,
                'addon_slug' => $addon->slug,
                'tenant_id' => $tenant->id,
                'quantity' => $quantity,
            ],
        ]);

        if ($response->failed()) {
            throw new \Exception("Stripe error: " . $response->body());
        }

        return [
            'url' => $response->json('url'),
            'provider' => 'stripe',
            'checkout_id' => $response->json('id')
        ];
    }

    private function initPaystackAddon($tenant, $addon, $amount, $currency, $quantity)
    {
        $secretKey = SaaSSetting::where('key', 'paystack_secret_key')->first()?->value;

        $response = Http::withToken($secretKey)->post('https://api.paystack.co/transaction/initialize', [
            'email' => $tenant->data['email'] ?? 'billing@' . $tenant->id . '.com',
            'amount' => $amount * 100,
            'currency' => $currency,
            'callback_url' => config('app.url') . "/dashboard/billing?vendor=paystack",
            'metadata' => [
                'type' => 'addon_purchase',
                'tenant_id' => $tenant->id,
                'addon_id' => $addon->id,
                'addon_slug' => $addon->slug,
                'quantity' => $quantity,
            ]
        ]);

        if ($response->failed()) throw new \Exception("Paystack error: " . ($response->json('message') ?? 'Unknown error'));

        return [
            'url' => $response->json('data.authorization_url'),
            'provider' => 'paystack',
            'reference' => $response->json('data.reference')
        ];
    }

    private function initFlutterwaveAddon($tenant, $addon, $amount, $currency, $quantity)
    {
        $secretKey = SaaSSetting::where('key', 'flutterwave_secret_key')->first()?->value;

        $response = Http::withToken($secretKey)->post('https://api.flutterwave.com/v3/payments', [
            'tx_ref' => 'addon_' . uniqid() . '_' . $tenant->id,
            'amount' => $amount,
            'currency' => $currency,
            'redirect_url' => config('app.url') . "/dashboard/billing?vendor=flutterwave",
            'customer' => [
                'email' => $tenant->data['email'] ?? 'billing@' . $tenant->id . '.com',
                'name' => $tenant->business_name,
            ],
            'meta' => [
                'type' => 'addon_purchase',
                'tenant_id' => $tenant->id,
                'addon_id' => $addon->id,
                'addon_slug' => $addon->slug,
                'quantity' => $quantity,
            ],
            'customizations' => [
                'title' => 'Sectros Add-on',
                'description' => $addon->name,
            ]
        ]);

        if ($response->failed()) throw new \Exception("Flutterwave error: " . ($response->json('message') ?? 'Unknown error'));

        return [
            'url' => $response->json('data.link'),
            'provider' => 'flutterwave',
            'tx_ref' => $response->json('data.tx_ref')
        ];
    }

    private function initStripeTheme($tenant, $template, $amount, $currency)
    {
        $secretKey = SaaSSetting::where('key', 'stripe_secret_key')->first()?->value;
        
        $response = Http::withToken($secretKey)->post('https://api.stripe.com/v1/checkout/sessions', [
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($currency),
                    'product_data' => [
                        'name' => "Theme: {$template->name}",
                        'description' => "Life-time unlock for Sectros Website Builder",
                    ],
                    'unit_amount' => $amount * 100,
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment', // One-time payment
            'success_url' => config('app.url') . "/dashboard/website?success=true&session_id={CHECKOUT_SESSION_ID}",
            'cancel_url' => config('app.url') . "/dashboard/website?canceled=true",
            'client_reference_id' => $tenant->id,
            'customer_email' => $tenant->data['email'] ?? null,
            'metadata' => [
                'type' => 'theme_purchase',
                'template_id' => $template->id,
                'tenant_id' => $tenant->id,
            ],
        ]);

        if ($response->failed()) {
            throw new \Exception("Stripe error: " . $response->body());
        }

        return [
            'url' => $response->json('url'),
            'provider' => 'stripe',
            'checkout_id' => $response->json('id')
        ];
    }

    private function initPaystackTheme($tenant, $template, $amount, $currency)
    {
        $secretKey = SaaSSetting::where('key', 'paystack_secret_key')->first()?->value;
        
        $response = Http::withToken($secretKey)->post('https://api.paystack.co/transaction/initialize', [
            'email' => $tenant->data['email'] ?? 'billing@' . $tenant->id . '.com',
            'amount' => $amount * 100,
            'currency' => $currency,
            'callback_url' => config('app.url') . "/dashboard/website?vendor=paystack",
            'metadata' => [
                'type' => 'theme_purchase',
                'tenant_id' => $tenant->id,
                'template_id' => $template->id,
            ]
        ]);

        if ($response->failed()) throw new \Exception("Paystack error: " . ($response->json('message') ?? 'Unknown error'));

        return [
            'url' => $response->json('data.authorization_url'),
            'provider' => 'paystack',
            'reference' => $response->json('data.reference')
        ];
    }

    private function initFlutterwaveTheme($tenant, $template, $amount, $currency)
    {
        $secretKey = SaaSSetting::where('key', 'flutterwave_secret_key')->first()?->value;
        
        $response = Http::withToken($secretKey)->post('https://api.flutterwave.com/v3/payments', [
            'tx_ref' => 'thme_' . uniqid() . '_' . $tenant->id,
            'amount' => $amount,
            'currency' => $currency,
            'redirect_url' => config('app.url') . "/dashboard/website?vendor=flutterwave",
            'customer' => [
                'email' => $tenant->data['email'] ?? 'billing@' . $tenant->id . '.com',
                'name' => $tenant->business_name,
            ],
            'meta' => [
                'type' => 'theme_purchase',
                'tenant_id' => $tenant->id,
                'template_id' => $template->id,
            ],
            'customizations' => [
                'title' => 'Sectros Theme Store',
                'description' => $template->name . " Theme Unlock",
            ]
        ]);

        if ($response->failed()) throw new \Exception("Flutterwave error: " . ($response->json('message') ?? 'Unknown error'));

        return [
            'url' => $response->json('data.link'),
            'provider' => 'flutterwave',
            'tx_ref' => $response->json('data.tx_ref')
        ];
    }

    private function initStripe($tenant, $plan, $amount, $currency, $interval)
    {
        $secretKey = SaaSSetting::where('key', 'stripe_secret_key')->first()?->value;
        
        $response = Http::withToken($secretKey)->post('https://api.stripe.com/v1/checkout/sessions', [
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($currency),
                    'product_data' => [
                        'name' => "{$plan->name} - Sectros Subscription",
                    ],
                    'unit_amount' => $amount * 100,
                    'recurring' => ['interval' => $interval === 'yearly' ? 'year' : 'month'],
                ],
                'quantity' => 1,
            ]],
            'mode' => 'subscription',
            'success_url' => config('app.url') . "/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}",
            'cancel_url' => config('app.url') . "/dashboard/billing?canceled=true",
            'client_reference_id' => $tenant->id,
            'customer_email' => $tenant->data['email'] ?? null,
            'metadata' => [
                'plan_slug' => $plan->slug,
                'tenant_id' => $tenant->id,
                'interval'  => $interval
            ],
        ]);

        if ($response->failed()) {
            Log::error("Stripe Initialization Failed: " . $response->body());
            throw new \Exception("Failed to initialize Stripe payment.");
        }

        return [
            'url' => $response->json('url'),
            'provider' => 'stripe',
            'checkout_id' => $response->json('id')
        ];
    }

    private function initPaystack($tenant, $plan, $amount, $currency, $interval)
    {
        $secretKey = SaaSSetting::where('key', 'paystack_secret_key')->first()?->value;
        
        $response = Http::withToken($secretKey)->post('https://api.paystack.co/transaction/initialize', [
            'email' => $tenant->data['email'] ?? 'billing@' . $tenant->id . '.com',
            'amount' => $amount * 100, // Paystack uses kobo
            'currency' => $currency,
            'callback_url' => config('app.url') . "/dashboard/billing?vendor=paystack",
            'metadata' => [
                'type' => 'subscription',
                'tenant_id' => $tenant->id,
                'plan_slug' => $plan->slug,
                'interval' => $interval
            ]
        ]);

        if ($response->failed()) {
            throw new \Exception("Paystack error: " . ($response->json('message') ?? 'Unknown error'));
        }

        return [
            'url' => $response->json('data.authorization_url'),
            'provider' => 'paystack',
            'reference' => $response->json('data.reference')
        ];
    }

    private function initFlutterwave($tenant, $plan, $amount, $currency, $interval)
    {
        $secretKey = SaaSSetting::where('key', 'flutterwave_secret_key')->first()?->value;
        
        $response = Http::withToken($secretKey)->post('https://api.flutterwave.com/v3/payments', [
            'tx_ref' => 'res_' . uniqid() . '_' . $tenant->id,
            'amount' => $amount,
            'currency' => $currency,
            'redirect_url' => config('app.url') . "/dashboard/billing?vendor=flutterwave",
            'payment_options' => 'card,account,ussd',
            'customer' => [
                'email' => $tenant->data['email'] ?? 'billing@' . $tenant->id . '.com',
                'name' => $tenant->business_name,
            ],
            'meta' => [
                'type' => 'subscription',
                'tenant_id' => $tenant->id,
                'plan_slug' => $plan->slug,
                'interval' => $interval
            ],
            'customizations' => [
                'title' => 'Sectros Subscription',
                'description' => $plan->name . " Plan",
            ]
        ]);

        if ($response->failed()) {
            throw new \Exception("Flutterwave error: " . ($response->json('message') ?? 'Unknown error'));
        }

        return [
            'url' => $response->json('data.link'),
            'provider' => 'flutterwave',
            'tx_ref' => $response->json('data.tx_ref')
        ];
    }

    private function initDodo($tenant, $plan, $amount, $currency, $interval)
    {
        $secretKey = SaaSSetting::where('key', 'dodo_secret_key')->first()?->value;
        if (!$secretKey) throw new \Exception("Dodo not configured.");

        $response = Http::withToken($secretKey)->timeout(30)->post('https://api.dodopayments.com/v1/payments', [
            'amount' => (int) round($amount * 100),
            'currency' => $currency,
            'description' => "{$plan->name} - Sectros Subscription",
            'success_url' => config('app.url') . "/dashboard/billing?success=true&provider=dodo",
            'cancel_url' => config('app.url') . "/dashboard/billing?canceled=true",
            'customer' => [
                'email' => $tenant->data['email'] ?? 'billing@' . $tenant->id . '.com',
                'name' => $tenant->business_name,
            ],
            'metadata' => [
                'type' => 'subscription',
                'tenant_id' => $tenant->id,
                'plan_slug' => $plan->slug,
                'interval' => $interval,
            ],
        ]);

        if ($response->failed()) {
            Log::error("Dodo Payment Init Failed: " . $response->body());
            throw new \Exception("Failed to initialize Dodo payment.");
        }

        return [
            'url' => $response->json('payment_link'),
            'provider' => 'dodo',
            'checkout_id' => $response->json('payment_id'),
        ];
    }

    private function initDodoTheme($tenant, $template, $amount, $currency)
    {
        $secretKey = SaaSSetting::where('key', 'dodo_secret_key')->first()?->value;
        if (!$secretKey) throw new \Exception("Dodo not configured.");

        $response = Http::withToken($secretKey)->timeout(30)->post('https://api.dodopayments.com/v1/payments', [
            'amount' => (int) round($amount * 100),
            'currency' => $currency,
            'description' => "Theme: {$template->name} - Sectros Website Builder",
            'success_url' => config('app.url') . "/dashboard/website?success=true&provider=dodo",
            'cancel_url' => config('app.url') . "/dashboard/website?canceled=true",
            'customer' => [
                'email' => $tenant->data['email'] ?? 'billing@' . $tenant->id . '.com',
                'name' => $tenant->business_name,
            ],
            'metadata' => [
                'type' => 'theme_purchase',
                'tenant_id' => $tenant->id,
                'template_id' => $template->id,
            ],
        ]);

        if ($response->failed()) {
            Log::error("Dodo Theme Purchase Init Failed: " . $response->body());
            throw new \Exception("Failed to initialize Dodo theme payment.");
        }

        return [
            'url' => $response->json('payment_link'),
            'provider' => 'dodo',
            'checkout_id' => $response->json('payment_id'),
        ];
    }

    private function initDodoAddon($tenant, $addon, $amount, $currency, $quantity)
    {
        $secretKey = SaaSSetting::where('key', 'dodo_secret_key')->first()?->value;
        if (!$secretKey) throw new \Exception("Dodo not configured.");

        $response = Http::withToken($secretKey)->timeout(30)->post('https://api.dodopayments.com/v1/payments', [
            'amount' => (int) round($amount * 100),
            'currency' => $currency,
            'description' => "Add-on: {$addon->name}" . ($quantity > 1 ? " (x{$quantity})" : ''),
            'success_url' => config('app.url') . "/dashboard/billing?success=true&provider=dodo",
            'cancel_url' => config('app.url') . "/dashboard/billing?canceled=true",
            'customer' => [
                'email' => $tenant->data['email'] ?? 'billing@' . $tenant->id . '.com',
                'name' => $tenant->business_name,
            ],
            'metadata' => [
                'type' => 'addon_purchase',
                'tenant_id' => $tenant->id,
                'addon_id' => $addon->id,
                'addon_slug' => $addon->slug,
                'quantity' => $quantity,
            ],
        ]);

        if ($response->failed()) {
            Log::error("Dodo Addon Purchase Init Failed: " . $response->body());
            throw new \Exception("Failed to initialize Dodo add-on payment.");
        }

        return [
            'url' => $response->json('payment_link'),
            'provider' => 'dodo',
            'checkout_id' => $response->json('payment_id'),
        ];
    }

    private function initStripeDeposit($tenant, $reservation, $successUrl, $cancelUrl)
    {
        $secretKey = SaaSSetting::where('key', 'stripe_secret_key')->first()?->value;
        if (!$secretKey) throw new \Exception("Stripe not configured.");
        $currency = SaaSSetting::where('key', 'default_currency')->first()?->value ?? 'USD';

        $response = Http::withToken($secretKey)->post('https://api.stripe.com/v1/checkout/sessions', [
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($currency),
                    'product_data' => [
                        'name' => 'Reservation Deposit',
                        'description' => "Deposit for reservation on {$reservation->reservation_time->format('M d, Y H:i')}",
                    ],
                    'unit_amount' => (int) round($reservation->deposit_amount * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => $successUrl . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $cancelUrl,
            'client_reference_id' => (string) $reservation->id,
            'customer_email' => $reservation->customer_email,
            'metadata' => [
                'type' => 'reservation_deposit',
                'reservation_id' => $reservation->id,
                'tenant_id' => $tenant->id,
            ],
        ]);

        if ($response->failed()) {
            Log::error("Stripe Deposit Init Failed: " . $response->body());
            throw new \Exception("Failed to initialize Stripe deposit.");
        }

        return [
            'url' => $response->json('url'),
            'provider' => 'stripe',
            'checkout_id' => $response->json('id'),
        ];
    }

    private function initPaystackDeposit($tenant, $reservation, $successUrl, $cancelUrl)
    {
        $secretKey = SaaSSetting::where('key', 'paystack_secret_key')->first()?->value;
        if (!$secretKey) throw new \Exception("Paystack not configured.");
        $currency = SaaSSetting::where('key', 'default_currency')->first()?->value ?? 'USD';

        $response = Http::withToken($secretKey)->post('https://api.paystack.co/transaction/initialize', [
            'email' => $reservation->customer_email,
            'amount' => (int) round($reservation->deposit_amount * 100),
            'currency' => $currency,
            'callback_url' => $successUrl . '?vendor=paystack',
            'metadata' => [
                'type' => 'reservation_deposit',
                'reservation_id' => $reservation->id,
                'tenant_id' => $tenant->id,
            ],
        ]);

        if ($response->failed()) {
            throw new \Exception("Paystack error: " . ($response->json('message') ?? 'Unknown error'));
        }

        return [
            'url' => $response->json('data.authorization_url'),
            'provider' => 'paystack',
            'reference' => $response->json('data.reference'),
        ];
    }

    private function initFlutterwaveDeposit($tenant, $reservation, $successUrl, $cancelUrl)
    {
        $secretKey = SaaSSetting::where('key', 'flutterwave_secret_key')->first()?->value;
        if (!$secretKey) throw new \Exception("Flutterwave not configured.");
        $currency = SaaSSetting::where('key', 'default_currency')->first()?->value ?? 'USD';

        $response = Http::withToken($secretKey)->post('https://api.flutterwave.com/v3/payments', [
            'tx_ref' => 'dep_' . uniqid() . '_' . $tenant->id,
            'amount' => $reservation->deposit_amount,
            'currency' => $currency,
            'redirect_url' => $successUrl . '?vendor=flutterwave',
            'customer' => [
                'email' => $reservation->customer_email,
                'name' => $reservation->customer_name,
            ],
            'meta' => [
                'type' => 'reservation_deposit',
                'reservation_id' => $reservation->id,
                'tenant_id' => $tenant->id,
            ],
            'customizations' => [
                'title' => 'Reservation Deposit',
                'description' => "Deposit for {$reservation->reservation_time->format('M d, Y H:i')}",
            ],
        ]);

        if ($response->failed()) {
            throw new \Exception("Flutterwave error: " . ($response->json('message') ?? 'Unknown error'));
        }

        return [
            'url' => $response->json('data.link'),
            'provider' => 'flutterwave',
            'tx_ref' => $response->json('data.tx_ref'),
        ];
    }

    private function initDodoDeposit($tenant, $reservation, $successUrl, $cancelUrl)
    {
        $secretKey = SaaSSetting::where('key', 'dodo_secret_key')->first()?->value;
        if (!$secretKey) throw new \Exception("Dodo not configured.");
        $currency = SaaSSetting::where('key', 'default_currency')->first()?->value ?? 'USD';

        $response = Http::withToken($secretKey)->timeout(30)->post('https://api.dodopayments.com/v1/payments', [
            'amount' => (int) round($reservation->deposit_amount * 100),
            'currency' => $currency,
            'description' => "Reservation deposit on {$reservation->reservation_time->format('M d, Y H:i')}",
            'success_url' => $successUrl . '?provider=dodo',
            'cancel_url' => $cancelUrl,
            'customer' => [
                'email' => $reservation->customer_email,
                'name' => $reservation->customer_name,
            ],
            'metadata' => [
                'type' => 'reservation_deposit',
                'reservation_id' => $reservation->id,
                'tenant_id' => $tenant->id,
            ],
        ]);

        if ($response->failed()) {
            Log::error("Dodo Deposit Init Failed: " . $response->body());
            throw new \Exception("Failed to initialize Dodo deposit.");
        }

        return [
            'url' => $response->json('payment_link'),
            'provider' => 'dodo',
            'checkout_id' => $response->json('payment_id'),
        ];
    }
}
