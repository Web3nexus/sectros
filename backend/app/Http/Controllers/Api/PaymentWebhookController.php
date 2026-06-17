<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SaaSSetting;
use App\Models\SubscriptionPlan;
use App\Services\TenantResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class PaymentWebhookController extends Controller
{
    public function handleStripe(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        
        // Get webhook secret from SaaS settings
        $webhookSecret = SaaSSetting::where('key', 'stripe_webhook_secret')->value('value');

        if (!$webhookSecret) {
            Log::error("Stripe Webhook Secret not configured in SaaS settings.");
            return response()->json(['message' => 'Webhook secret missing'], 500);
        }

        try {
            // Verify and construct the event
            $event = Webhook::constructEvent(
                $payload, $sig_header, $webhookSecret
            );
            
            if ($event->type === 'checkout.session.completed') {
                $session = $event->data->object;
                
                // Determine if this is a subscription or a one-time theme purchase
                $type = $session->metadata->type ?? 'subscription';
                $tenantId = $session->metadata->tenant_id ?? $session->client_reference_id;

                if ($type === 'theme_purchase') {
                    $templateId = $session->metadata->template_id ?? null;
                    if ($tenantId && $templateId) {
                        $this->fulfillThemePurchase($tenantId, $templateId, $session->amount_total / 100);
                    }
                } elseif ($type === 'addon_purchase') {
                    $addonId = $session->metadata->addon_id ?? null;
                    $quantity = $session->metadata->quantity ?? 1;
                    if ($tenantId && $addonId) {
                        $this->fulfillAddonPurchase($tenantId, $addonId, (int) $quantity);
                    }
                } elseif ($type === 'reservation_deposit') {
                    $reservationId = $session->metadata->reservation_id ?? null;
                    if ($tenantId && $reservationId) {
                        $this->fulfillReservationDeposit($tenantId, $reservationId, $session->id, 'stripe');
                    }
                } else {
                    $planSlug = $session->metadata->plan_slug ?? null;
                    $subscriptionId = $session->subscription;
                    if ($tenantId && $planSlug) {
                        $this->updateTenantSubscription($tenantId, 'stripe', $subscriptionId, $planSlug);
                    }
                }
            }

            return response()->json(['status' => 'success']);
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            Log::error("Stripe Webhook Invalid Payload: " . $e->getMessage());
            return response()->json(['message' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            // Invalid signature
            Log::error("Stripe Webhook Invalid Signature: " . $e->getMessage());
            return response()->json(['message' => 'Invalid signature'], 401);
        } catch (\Exception $e) {
            Log::error("Stripe Webhook Error: " . $e->getMessage());
            return response()->json(['message' => 'Webhook handling failed'], 400);
        }
    }

    public function handlePaystack(Request $request)
    {
        $secretKey = SaaSSetting::where('key', 'paystack_secret_key')->value('value');
        $signature = $request->header('x-paystack-signature');

        if (!$signature || $signature !== hash_hmac('sha512', $request->getContent(), $secretKey)) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');
        if ($event === 'charge.success') {
            $data = $request->input('data');
            $tenantId = $data['metadata']['tenant_id'] ?? null;
            $type = $data['metadata']['type'] ?? 'subscription';
            
            if ($type === 'theme_purchase') {
                $templateId = $data['metadata']['template_id'] ?? null;
                if ($tenantId && $templateId) {
                    $this->fulfillThemePurchase($tenantId, $templateId, $data['amount'] / 100);
                }
            } elseif ($type === 'addon_purchase') {
                $addonId = $data['metadata']['addon_id'] ?? null;
                $quantity = $data['metadata']['quantity'] ?? 1;
                if ($tenantId && $addonId) {
                    $this->fulfillAddonPurchase($tenantId, $addonId, (int) $quantity);
                }
            } elseif ($type === 'reservation_deposit') {
                $reservationId = $data['metadata']['reservation_id'] ?? null;
                if ($tenantId && $reservationId) {
                    $this->fulfillReservationDeposit($tenantId, $reservationId, $data['reference'], 'paystack');
                }
            } else {
                $planSlug = $data['metadata']['plan_slug'] ?? null;
                $reference = $data['reference'];
                if ($tenantId && $planSlug) {
                    $this->updateTenantSubscription($tenantId, 'paystack', $reference, $planSlug);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }

    public function handleFlutterwave(Request $request)
    {
        $secretHash = SaaSSetting::where('key', 'flutterwave_encryption_key')->value('value');
        $signature = $request->header('verif-hash');

        if (!$secretHash || $signature !== $secretHash) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $status = $request->input('status');
        if ($status === 'successful') {
            $data = $request->input('data');
            $tenantId = $data['meta']['tenant_id'] ?? null;
            $type = $data['meta']['type'] ?? 'subscription';
            
            if ($type === 'theme_purchase') {
                $templateId = $data['meta']['template_id'] ?? null;
                if ($tenantId && $templateId) {
                    $this->fulfillThemePurchase($tenantId, $templateId, $data['amount']);
                }
            } elseif ($type === 'addon_purchase') {
                $addonId = $data['meta']['addon_id'] ?? null;
                $quantity = $data['meta']['quantity'] ?? 1;
                if ($tenantId && $addonId) {
                    $this->fulfillAddonPurchase($tenantId, $addonId, (int) $quantity);
                }
            } elseif ($type === 'reservation_deposit') {
                $reservationId = $data['meta']['reservation_id'] ?? null;
                if ($tenantId && $reservationId) {
                    $this->fulfillReservationDeposit($tenantId, $reservationId, $data['id'], 'flutterwave');
                }
            } else {
                $planSlug = $data['meta']['plan_slug'] ?? null;
                $txRef = $data['tx_ref'];
                if ($tenantId && $planSlug) {
                    $this->updateTenantSubscription($tenantId, 'flutterwave', $txRef, $planSlug);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }

    public function handleDodo(Request $request)
    {
        $webhookSecret = SaaSSetting::where('key', 'dodo_webhook_secret')->value('value');
        $signature = $request->header('webhook-signature');
        $timestamp = $request->header('webhook-timestamp');
        $payload = $request->getContent();

        if (!$webhookSecret) {
            Log::error("Dodo Webhook Secret not configured.");
            return response()->json(['message' => 'Webhook secret missing'], 500);
        }

        if (!$signature || !$timestamp) {
            Log::error("Dodo Webhook missing required headers");
            return response()->json(['message' => 'Missing signature headers'], 401);
        }

        $signedPayload = "{$timestamp}.{$payload}";
        $expected = base64_encode(hash_hmac('sha256', $signedPayload, $webhookSecret, true));

        $parts = explode(',', $signature);
        $actual = trim(end($parts));

        if (!hash_equals($expected, $actual)) {
            Log::error("Dodo Webhook Invalid Signature");
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');
        if ($event === 'payment.completed') {
            $data = $request->input('data');
            $metadata = $data['metadata'] ?? [];
            $tenantId = $metadata['tenant_id'] ?? null;
            $type = $metadata['type'] ?? 'subscription';

            if ($type === 'theme_purchase') {
                $templateId = $metadata['template_id'] ?? null;
                if ($tenantId && $templateId) {
                    $this->fulfillThemePurchase($tenantId, $templateId, $data['amount'] / 100);
                }
            } elseif ($type === 'addon_purchase') {
                $addonId = $metadata['addon_id'] ?? null;
                $quantity = $metadata['quantity'] ?? 1;
                if ($tenantId && $addonId) {
                    $this->fulfillAddonPurchase($tenantId, $addonId, (int) $quantity);
                }
            } elseif ($type === 'reservation_deposit') {
                $reservationId = $metadata['reservation_id'] ?? null;
                if ($tenantId && $reservationId) {
                    $this->fulfillReservationDeposit($tenantId, $reservationId, $data['payment_id'], 'dodo');
                }
            } else {
                $planSlug = $metadata['plan_slug'] ?? null;
                $paymentId = $data['payment_id'] ?? null;
                if ($tenantId && $planSlug) {
                    $this->updateTenantSubscription($tenantId, 'dodo', $paymentId, $planSlug);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }

    private function updateTenantSubscription($tenantId, $provider, $subscriptionId, $planSlug)
    {
        $tenant = Tenant::find($tenantId);
        if ($tenant) {
            $tenant->plan = $planSlug;
            $tenant->subscription_id = $subscriptionId;
            $tenant->subscription_provider = $provider;
            $tenant->subscription_status = 'active';
            $tenant->subscription_ends_at = now()->addMonth(); // Simplified
            $tenant->save();
            
            Log::info("Tenant {$tenantId} subscription updated via {$provider} to plan {$planSlug}");

            // Send Payment Success Email
            $template = \App\Models\EmailTemplate::where('slug', 'payment_success')->first();
            if ($template) {
                $platformName = \App\Models\SaaSSetting::get('platform_name', config('app.name'));
                $plan = \App\Models\SubscriptionPlan::where('slug', $planSlug)->first();
                
                $planName = $plan ? $plan->name : 'Premium';

                try {
                    \Illuminate\Support\Facades\Mail::to($tenant->owner_email)->send(new \App\Mail\SystemMail($template->subject, $template->content, [
                        'business_name' => $tenant->business_name,
                        'plan_name' => $planName,
                        'invoice_id' => $subscriptionId,
                        'amount' => 'Check Dashboard',
                        'platform_name' => $platformName
                    ]));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Failed to send payment success email to tenant {$tenantId}: " . $e->getMessage());
                }
            }
        }
    }

    private function fulfillThemePurchase($tenantId, $templateId, $amount)
    {
        $tenant = Tenant::find($tenantId);
        $template = \App\Models\WebsiteTemplate::find($templateId);

        if ($tenant && $template) {
            TenantResolver::set($tenant);
            \App\Models\TenantTheme::updateOrCreate(
                ['tenant_id' => $tenantId, 'website_template_id' => $templateId],
                ['purchased_at' => now(), 'price_paid' => $amount]
            );

            Log::info("Tenant {$tenantId} successfully purchased theme: {$template->name} ({$templateId})");

            // Optional: Send Theme Purchase Confirmation Email
            try {
                $platformName = \App\Models\SaaSSetting::get('platform_name', config('app.name'));
                $subject = "Theme Unlocked: Access your new design";
                $content = "Great news! You have successfully unlocked the '{$template->name}' theme in your {$platformName} Website Builder. It is now permanently available for all your business pages.";
                
                \Illuminate\Support\Facades\Mail::to($tenant->owner_email)->send(new \App\Mail\SystemMail($subject, $content));
            } catch (\Exception $e) {
                Log::error("Failed to send theme purchase email: " . $e->getMessage());
            }
        }
    }

    private function fulfillAddonPurchase($tenantId, $addonId, int $quantity)
    {
        $tenant = Tenant::find($tenantId);
        $addon = \App\Models\Addon::find($addonId);

        if ($tenant && $addon) {
            TenantResolver::set($tenant);
            $wasAlreadyActive = \App\Models\TenantAddon::where('tenant_id', $tenantId)
                ->where('addon_id', $addonId)
                ->where('status', 'active')
                ->exists();

            \App\Models\TenantAddon::updateOrCreate(
                ['tenant_id' => $tenantId, 'addon_id' => $addonId],
                [
                    'quantity' => $quantity,
                    'status' => 'active',
                    'started_at' => now(),
                ]
            );

            $features = $addon->features ?? [];
            $currentFeatures = $tenant->features ?? [];
            foreach ($features as $feature) {
                if (!in_array($feature, $currentFeatures)) {
                    $currentFeatures[] = $feature;
                }
            }
            $tenant->features = $currentFeatures;
            $tenant->save();

            Log::info("Tenant {$tenantId} purchased add-on: {$addon->name} ({$addonId})");

            if (!$wasAlreadyActive) {
                try {
                    $platformName = \App\Models\SaaSSetting::get('platform_name', config('app.name'));
                    $subject = "Add-on Activated: {$addon->name}";
                    $content = "Your {$addon->name} add-on has been activated on your {$platformName} account.";
                    \Illuminate\Support\Facades\Mail::to($tenant->owner_email)->send(new \App\Mail\SystemMail($subject, $content));
                } catch (\Exception $e) {
                    Log::error("Failed to send add-on purchase email: " . $e->getMessage());
                }
            }
        }
    }

    private function fulfillReservationDeposit($tenantId, $reservationId, $paymentId, $provider = 'stripe')
    {
        $tenant = Tenant::find($tenantId);
        if (!$tenant) return;

        // Switch to tenant context to update the reservation
        $tenant->run(function () use ($reservationId, $paymentId, $provider) {
            $reservation = \App\Models\Reservation::find($reservationId);
            if ($reservation) {
                $reservation->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed',
                    'stripe_payment_id' => $paymentId,
                    'payment_method' => $provider
                ]);

                Log::info("Reservation {$reservationId} deposit fulfilled for tenant " . tenant('id'));

                // Notify guest
                // (Logic for automated confirmation email/SMS could go here)
            }
        });
    }
}
