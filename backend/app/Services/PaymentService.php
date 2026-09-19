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
    public static function getGateway(?string $country = null, ?string $preferred = null)
    {
        $country = strtoupper($country ?? 'US');
        
        $paddleEnabled = SaaSSetting::where('key', 'paddle_enabled')->first()?->value === 'true';
        $stripeEnabled = SaaSSetting::where('key', 'stripe_enabled')->first()?->value === 'true';
        $paystackEnabled = SaaSSetting::where('key', 'paystack_enabled')->first()?->value === 'true';
        $flutterwaveEnabled = SaaSSetting::where('key', 'flutterwave_enabled')->first()?->value === 'true';
        $dodoEnabled = SaaSSetting::where('key', 'dodo_enabled')->first()?->value === 'true';

        // Explicit preference if supported and enabled
        if ($preferred === 'paddle' && $paddleEnabled) return 'paddle';
        if ($preferred === 'stripe' && $stripeEnabled) return 'stripe';
        if ($preferred === 'paystack' && $paystackEnabled) return 'paystack';
        if ($preferred === 'flutterwave' && $flutterwaveEnabled) return 'flutterwave';
        if ($preferred === 'dodo' && $dodoEnabled) return 'dodo';

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

        // Default to Paddle if enabled
        if ($paddleEnabled) {
            return 'paddle';
        }

        // Default to Stripe if enabled
        if ($stripeEnabled) {
            return 'stripe';
        }

        // Fallback to whatever is enabled if the primary choice isn't
        if ($paddleEnabled) return 'paddle';
        if ($paystackEnabled) return 'paystack';
        if ($flutterwaveEnabled) return 'flutterwave';
        if ($dodoEnabled) return 'dodo';
        if ($stripeEnabled) return 'stripe';

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
            'paddle' => $this->initPaddle($tenant, $plan, $amount, $currency, $interval),
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
            'paddle' => $this->initPaddleDeposit($tenant, $reservation, $successUrl, $cancelUrl),
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
            'paddle' => $this->initPaddleTheme($tenant, $template, $amount, $currency),
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
            'paddle' => $this->initPaddleAddon($tenant, $addon, $total, $currency, $quantity, $isRecurring),
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

    /**
     * Get Paddle API key from SaaS settings with env fallback.
     */
    private function getPaddleApiKey(): ?string
    {
        return SaaSSetting::where('key', 'paddle_api_key')->value('value') ?: env('PADDLE_API_KEY');
    }

    /**
     * Get Paddle API base URL according to the configured environment.
     */
    private function getPaddleBaseUrl(): string
    {
        $environment = SaaSSetting::where('key', 'paddle_environment')->value('value') ?: env('PADDLE_ENVIRONMENT', 'sandbox');
        return $environment === 'production' 
            ? 'https://api.paddle.com' 
            : 'https://sandbox-api.paddle.com';
    }

    /**
     * Retrieve or create a Paddle customer ID using customer email.
     */
    private function getOrCreatePaddleCustomer(string $apiKey, ?string $email, ?string $name = null): ?string
    {
        if (empty($email)) {
            return null;
        }

        $baseUrl = $this->getPaddleBaseUrl();

        try {
            // 1. Search for existing customer
            $searchRes = Http::withToken($apiKey)
                ->timeout(15)
                ->get("{$baseUrl}/customers", ['email' => $email]);

            if ($searchRes->successful()) {
                $customers = $searchRes->json('data');
                if (!empty($customers) && isset($customers[0]['id'])) {
                    return $customers[0]['id'];
                }
            }

            // 2. Create customer if not found
            $createRes = Http::withToken($apiKey)
                ->timeout(15)
                ->post("{$baseUrl}/customers", [
                    'email' => $email,
                    'name' => !empty($name) ? $name : 'Customer',
                ]);

            if ($createRes->successful()) {
                return $createRes->json('data.id');
            }

            Log::warning("Paddle customer creation failed: " . $createRes->body());
        } catch (\Throwable $e) {
            Log::warning("Paddle getOrCreateCustomer error: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Initialize Paddle subscription checkout transaction.
     */
    private function initPaddle($tenant, $plan, $amount, $currency, $interval)
    {
        $apiKey = $this->getPaddleApiKey();
        if (!$apiKey) {
            throw new \Exception("Paddle API Key not configured. Please add your Paddle credentials in SaaS Settings -> Payment Gateways.");
        }

        $baseUrl = $this->getPaddleBaseUrl();
        $email = $tenant->owner_email ?? ($tenant->data['email'] ?? null);
        $name = $tenant->business_name ?? $tenant->owner_name ?? 'Tenant';

        $customerId = $this->getOrCreatePaddleCustomer($apiKey, $email, $name);

        $catalogPriceId = ($interval === 'yearly') 
            ? ($plan->paddle_yearly_price_id ?? null) 
            : ($plan->paddle_monthly_price_id ?? null);

        if (!empty($catalogPriceId)) {
            $items = [
                [
                    'price_id' => $catalogPriceId,
                    'quantity' => 1,
                ],
            ];
        } else {
            $items = [
                [
                    'quantity' => 1,
                    'price' => [
                        'description' => "{$plan->name} - Sectros Subscription",
                        'name' => "{$plan->name} Plan",
                        'product' => [
                            'name' => "{$plan->name}",
                            'tax_category' => 'standard',
                        ],
                        'unit_price' => [
                            'amount' => (string) (int) round($amount * 100),
                            'currency_code' => strtoupper($currency),
                        ],
                        'billing_cycle' => [
                            'interval' => $interval === 'yearly' ? 'year' : 'month',
                            'frequency' => 1,
                        ],
                    ],
                ],
            ];
        }

        $payload = [
            'collection_mode' => 'automatic',
            'items' => $items,
            'custom_data' => [
                'type' => 'subscription',
                'tenant_id' => (string) $tenant->id,
                'plan_slug' => $plan->slug,
                'interval' => $interval,
            ],
        ];

        if ($customerId) {
            $payload['customer_id'] = $customerId;
        }

        $response = Http::withToken($apiKey)
            ->timeout(30)
            ->post("{$baseUrl}/transactions", $payload);

        if ($response->failed()) {
            Log::error("Paddle Subscription Init Failed: " . $response->body());
            $errorMsg = $response->json('error.detail') ?? $response->json('message') ?? 'Failed to initialize Paddle payment.';
            throw new \Exception("Paddle error: {$errorMsg}");
        }

        $checkoutUrl = $response->json('data.checkout.url');
        $transactionId = $response->json('data.id');

        return [
            'url' => $checkoutUrl,
            'checkout_url' => $checkoutUrl,
            'provider' => 'paddle',
            'checkout_id' => $transactionId,
            'transaction_id' => $transactionId,
        ];
    }

    /**
     * Initialize Paddle website theme purchase.
     */
    private function initPaddleTheme($tenant, $template, $amount, $currency)
    {
        $apiKey = $this->getPaddleApiKey();
        if (!$apiKey) {
            throw new \Exception("Paddle API Key not configured. Please add your Paddle credentials in SaaS Settings -> Payment Gateways.");
        }

        $baseUrl = $this->getPaddleBaseUrl();
        $email = $tenant->owner_email ?? ($tenant->data['email'] ?? null);
        $name = $tenant->business_name ?? $tenant->owner_name ?? 'Tenant';

        $customerId = $this->getOrCreatePaddleCustomer($apiKey, $email, $name);

        $payload = [
            'collection_mode' => 'automatic',
            'items' => [
                [
                    'quantity' => 1,
                    'price' => [
                        'description' => "Lifetime unlock for theme: {$template->name}",
                        'name' => "Theme: {$template->name}",
                        'product' => [
                            'name' => "Theme: {$template->name}",
                            'tax_category' => 'standard',
                        ],
                        'unit_price' => [
                            'amount' => (string) (int) round($amount * 100),
                            'currency_code' => strtoupper($currency),
                        ],
                        'billing_cycle' => null,
                    ],
                ],
            ],
            'custom_data' => [
                'type' => 'theme_purchase',
                'tenant_id' => (string) $tenant->id,
                'template_id' => (string) $template->id,
            ],
        ];

        if ($customerId) {
            $payload['customer_id'] = $customerId;
        }

        $response = Http::withToken($apiKey)
            ->timeout(30)
            ->post("{$baseUrl}/transactions", $payload);

        if ($response->failed()) {
            Log::error("Paddle Theme Init Failed: " . $response->body());
            $errorMsg = $response->json('error.detail') ?? $response->json('message') ?? 'Failed to initialize Paddle theme purchase.';
            throw new \Exception("Paddle error: {$errorMsg}");
        }

        return [
            'url' => $response->json('data.checkout.url'),
            'checkout_url' => $response->json('data.checkout.url'),
            'provider' => 'paddle',
            'checkout_id' => $response->json('data.id'),
        ];
    }

    /**
     * Initialize Paddle add-on purchase (one-time or recurring).
     */
    private function initPaddleAddon($tenant, $addon, $amount, $currency, $quantity, $isRecurring)
    {
        $apiKey = $this->getPaddleApiKey();
        if (!$apiKey) {
            throw new \Exception("Paddle API Key not configured. Please add your Paddle credentials in SaaS Settings -> Payment Gateways.");
        }

        $baseUrl = $this->getPaddleBaseUrl();
        $email = $tenant->owner_email ?? ($tenant->data['email'] ?? null);
        $name = $tenant->business_name ?? $tenant->owner_name ?? 'Tenant';

        $customerId = $this->getOrCreatePaddleCustomer($apiKey, $email, $name);
        $billingCycle = $isRecurring ? ['interval' => 'month', 'frequency' => 1] : null;

        $payload = [
            'collection_mode' => 'automatic',
            'items' => [
                [
                    'quantity' => $quantity,
                    'price' => [
                        'description' => "Add-on: {$addon->name}" . ($quantity > 1 ? " (x{$quantity})" : ''),
                        'name' => "Add-on: {$addon->name}",
                        'product' => [
                            'name' => "Add-on: {$addon->name}",
                            'tax_category' => 'standard',
                        ],
                        'unit_price' => [
                            'amount' => (string) (int) round($amount * 100),
                            'currency_code' => strtoupper($currency),
                        ],
                        'billing_cycle' => $billingCycle,
                    ],
                ],
            ],
            'custom_data' => [
                'type' => 'addon_purchase',
                'tenant_id' => (string) $tenant->id,
                'addon_id' => (string) $addon->id,
                'addon_slug' => $addon->slug,
                'quantity' => $quantity,
            ],
        ];

        if ($customerId) {
            $payload['customer_id'] = $customerId;
        }

        $response = Http::withToken($apiKey)
            ->timeout(30)
            ->post("{$baseUrl}/transactions", $payload);

        if ($response->failed()) {
            Log::error("Paddle Addon Init Failed: " . $response->body());
            $errorMsg = $response->json('error.detail') ?? $response->json('message') ?? 'Failed to initialize Paddle add-on purchase.';
            throw new \Exception("Paddle error: {$errorMsg}");
        }

        return [
            'url' => $response->json('data.checkout.url'),
            'checkout_url' => $response->json('data.checkout.url'),
            'provider' => 'paddle',
            'checkout_id' => $response->json('data.id'),
        ];
    }

    /**
     * Initialize Paddle reservation deposit.
     */
    private function initPaddleDeposit($tenant, $reservation, $successUrl, $cancelUrl)
    {
        $apiKey = $this->getPaddleApiKey();
        if (!$apiKey) {
            throw new \Exception("Paddle API Key not configured. Please add your Paddle credentials in SaaS Settings -> Payment Gateways.");
        }
        $currency = SaaSSetting::where('key', 'default_currency')->first()?->value ?? 'USD';

        $baseUrl = $this->getPaddleBaseUrl();
        $customerId = $this->getOrCreatePaddleCustomer(
            $apiKey,
            $reservation->customer_email,
            $reservation->customer_name
        );

        $payload = [
            'collection_mode' => 'automatic',
            'items' => [
                [
                    'quantity' => 1,
                    'price' => [
                        'description' => "Deposit for reservation on {$reservation->reservation_time->format('M d, Y H:i')}",
                        'name' => "Reservation Deposit",
                        'product' => [
                            'name' => "Reservation Deposit",
                            'tax_category' => 'standard',
                        ],
                        'unit_price' => [
                            'amount' => (string) (int) round($reservation->deposit_amount * 100),
                            'currency_code' => strtoupper($currency),
                        ],
                        'billing_cycle' => null,
                    ],
                ],
            ],
            'custom_data' => [
                'type' => 'reservation_deposit',
                'tenant_id' => (string) $tenant->id,
                'reservation_id' => (string) $reservation->id,
            ],
        ];

        if ($customerId) {
            $payload['customer_id'] = $customerId;
        }

        $response = Http::withToken($apiKey)
            ->timeout(30)
            ->post("{$baseUrl}/transactions", $payload);

        if ($response->failed()) {
            Log::error("Paddle Deposit Init Failed: " . $response->body());
            $errorMsg = $response->json('error.detail') ?? $response->json('message') ?? 'Failed to initialize Paddle deposit.';
            throw new \Exception("Paddle error: {$errorMsg}");
        }

        return [
            'url' => $response->json('data.checkout.url'),
            'checkout_url' => $response->json('data.checkout.url'),
            'provider' => 'paddle',
            'checkout_id' => $response->json('data.id'),
        ];
    }

    /**
     * Create an authenticated Paddle Customer Portal session URL.
     */
    public function createPaddlePortalSession(Tenant $tenant): ?string
    {
        $apiKey = $this->getPaddleApiKey();
        if (!$apiKey) return null;

        $baseUrl = $this->getPaddleBaseUrl();
        $email = $tenant->owner_email ?? ($tenant->data['email'] ?? null);
        // Resolve customer ID strictly from server-side mirrored state
        $customerId = null;
        if (!empty($tenant->subscription_id)) {
            $customerId = \App\Models\PaddleSubscription::where('id', $tenant->subscription_id)->value('customer_id');
        }
        if (!$customerId) {
            $customerId = \App\Models\PaddleSubscription::where('tenant_id', $tenant->id)->value('customer_id')
                ?? \App\Models\PaddleCustomer::where('tenant_id', $tenant->id)->value('id');
        }
        if (!$customerId && $email) {
            $customerId = \App\Models\PaddleCustomer::where('email', $email)->value('id');
        }
        if (!$customerId) {
            $customerId = $this->getOrCreatePaddleCustomer($apiKey, $email, $tenant->business_name);
        }
        if (!$customerId) return null;

        try {
            $subscriptionIds = $tenant->subscription_id ? [$tenant->subscription_id] : [];
            $response = Http::withToken($apiKey)
                ->timeout(15)
                ->post("{$baseUrl}/customers/{$customerId}/portal-sessions", [
                    'subscription_ids' => $subscriptionIds
                ]);

            if ($response->successful()) {
                return $response->json('data.urls.general.overview');
            }
        } catch (\Throwable $e) {
            Log::warning("Paddle portal session error: " . $e->getMessage());
        }

        return null;
    }
}
