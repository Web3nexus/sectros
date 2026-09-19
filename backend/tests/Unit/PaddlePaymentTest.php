<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\SaaSSetting;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use App\Models\PaddleCustomer;
use App\Models\PaddleSubscription;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\PaymentWebhookController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class PaddlePaymentTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Shared sqlite database file for all connections during test
        $dbFile = __DIR__ . '/test_paddle.sqlite';
        if (file_exists($dbFile)) {
            @unlink($dbFile);
        }
        touch($dbFile);

        config([
            'cache.default' => 'array',
            'database.default' => 'platform',
            'tenancy.database.central_connection' => 'platform',
            'database.connections.sqlite' => [
                'driver' => 'sqlite',
                'database' => $dbFile,
                'prefix' => '',
            ],
            'database.connections.platform' => [
                'driver' => 'sqlite',
                'database' => $dbFile,
                'prefix' => '',
            ],
            'database.connections.mysql' => [
                'driver' => 'sqlite',
                'database' => $dbFile,
                'prefix' => '',
            ],
            'database.connections.tenant' => [
                'driver' => 'sqlite',
                'database' => $dbFile,
                'prefix' => '',
            ],
        ]);
        DB::purge('sqlite');
        DB::purge('platform');
        DB::purge('mysql');
        DB::purge('tenant');
        DB::purge();

        $conn = 'platform';

        Schema::connection($conn)->dropIfExists('saa_s_settings');
        Schema::connection($conn)->dropIfExists('tenants');
        Schema::connection($conn)->dropIfExists('subscription_plans');
        Schema::connection($conn)->dropIfExists('paddle_customers');
        Schema::connection($conn)->dropIfExists('paddle_subscriptions');
        Schema::connection($conn)->dropIfExists('domains');
        Schema::connection($conn)->dropIfExists('email_templates');

        Schema::connection($conn)->create('saa_s_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        Schema::connection($conn)->create('tenants', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('business_name')->nullable();
            $table->string('owner_email')->nullable();
            $table->string('plan')->nullable();
            $table->string('subscription_id')->nullable();
            $table->string('subscription_provider')->nullable();
            $table->string('subscription_status')->default('active');
            $table->timestamp('subscription_ends_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->boolean('is_testing')->default(false);
            $table->timestamp('testing_ends_at')->nullable();
            $table->json('features')->nullable();
            $table->json('data')->nullable();
            $table->timestamps();
        });

        Schema::connection($conn)->create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('monthly_price', 8, 2)->default(0);
            $table->decimal('yearly_price', 8, 2)->default(0);
            $table->string('paddle_product_id')->nullable();
            $table->string('paddle_monthly_price_id')->nullable();
            $table->string('paddle_yearly_price_id')->nullable();
            $table->string('stripe_monthly_price_id')->nullable();
            $table->string('stripe_yearly_price_id')->nullable();
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::connection($conn)->create('paddle_customers', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->nullable()->index();
            $table->string('email')->index();
            $table->string('name')->nullable();
            $table->string('locale', 10)->nullable();
            $table->timestamps();
        });

        Schema::connection($conn)->create('paddle_subscriptions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('customer_id')->index();
            $table->string('tenant_id')->nullable()->index();
            $table->string('status', 50)->index();
            $table->string('price_id')->nullable()->index();
            $table->string('product_id')->nullable()->index();
            $table->string('plan_slug', 100)->nullable()->index();
            $table->string('billing_interval', 20)->nullable();
            $table->string('scheduled_change_action', 50)->nullable();
            $table->timestamp('scheduled_change_at')->nullable();
            $table->timestamp('current_billing_period_starts_at')->nullable();
            $table->timestamp('current_billing_period_ends_at')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->timestamps();
        });

        Schema::connection($conn)->create('domains', function (Blueprint $table) {
            $table->id();
            $table->string('domain')->unique();
            $table->string('tenant_id');
            $table->timestamps();
        });

        Schema::connection($conn)->create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('subject');
            $table->text('content');
            $table->timestamps();
        });
    }

    public function test_paddle_gateway_selection()
    {
        SaaSSetting::updateOrCreate(['key' => 'paddle_enabled'], ['value' => 'true']);
        SaaSSetting::updateOrCreate(['key' => 'stripe_enabled'], ['value' => 'false']);
        SaaSSetting::updateOrCreate(['key' => 'paystack_enabled'], ['value' => 'false']);
        SaaSSetting::updateOrCreate(['key' => 'flutterwave_enabled'], ['value' => 'false']);
        SaaSSetting::updateOrCreate(['key' => 'dodo_enabled'], ['value' => 'false']);

        $gateway = PaymentService::getGateway('US');
        $this->assertEquals('paddle', $gateway);

        // Preferred override
        $gatewayPreferred = PaymentService::getGateway('US', 'paddle');
        $this->assertEquals('paddle', $gatewayPreferred);
    }

    public function test_paddle_webhook_rejects_invalid_signature()
    {
        SaaSSetting::updateOrCreate(['key' => 'paddle_webhook_secret'], ['value' => 'pdl_ntfset_secret_abc']);

        $ts = time();
        $payload = json_encode(['event_type' => 'subscription.created']);
        $badSignature = "ts={$ts};h1=invalid_hmac_hash";

        $request = Request::create('/central-api/webhooks/paddle', 'POST', [], [], [], [
            'HTTP_PADDLE_SIGNATURE' => $badSignature,
            'CONTENT_TYPE' => 'application/json',
        ], $payload);

        $controller = new PaymentWebhookController();
        $response = $controller->handlePaddle($request);

        $this->assertEquals(401, $response->getStatusCode());
    }

    public function test_paddle_webhook_rejects_expired_timestamp()
    {
        $secret = 'pdl_ntfset_secret_abc';
        SaaSSetting::updateOrCreate(['key' => 'paddle_webhook_secret'], ['value' => $secret]);

        $ts = time() - 400; // Older than 300 seconds
        $payload = json_encode(['event_type' => 'subscription.created']);
        $h1 = hash_hmac('sha256', "{$ts}:{$payload}", $secret);
        $signature = "ts={$ts};h1={$h1}";

        $request = Request::create('/central-api/webhooks/paddle', 'POST', [], [], [], [
            'HTTP_PADDLE_SIGNATURE' => $signature,
            'CONTENT_TYPE' => 'application/json',
        ], $payload);

        $controller = new PaymentWebhookController();
        $response = $controller->handlePaddle($request);

        $this->assertEquals(401, $response->getStatusCode());
    }

    public function test_customer_created_and_updated_mirroring()
    {
        $secret = 'pdl_ntfset_secret_cust';
        SaaSSetting::updateOrCreate(['key' => 'paddle_webhook_secret'], ['value' => $secret]);

        $tenant = Tenant::withoutEvents(function () {
            return Tenant::create([
                'id' => 'tenant_cust_123',
                'business_name' => 'Bistro Paris',
                'owner_email' => 'owner@bistro.com',
                'plan' => 'starter',
            ]);
        });

        // 1. customer.created
        $ts = time();
        $payloadData = [
            'event_type' => 'customer.created',
            'data' => [
                'id' => 'ctm_01h8abc123',
                'email' => 'owner@bistro.com',
                'name' => 'Bistro Owner',
                'locale' => 'en',
                'custom_data' => ['tenant_id' => $tenant->id],
            ],
        ];
        $rawPayload = json_encode($payloadData);
        $h1 = hash_hmac('sha256', "{$ts}:{$rawPayload}", $secret);

        $request = Request::create('/central-api/webhooks/paddle', 'POST', [], [], [], [
            'HTTP_PADDLE_SIGNATURE' => "ts={$ts};h1={$h1}",
            'CONTENT_TYPE' => 'application/json',
        ], $rawPayload);

        $controller = new PaymentWebhookController();
        $response = $controller->handlePaddle($request);

        $this->assertEquals(200, $response->getStatusCode());

        $customer = PaddleCustomer::find('ctm_01h8abc123');
        $this->assertNotNull($customer);
        $this->assertEquals('owner@bistro.com', $customer->email);
        $this->assertEquals($tenant->id, $customer->tenant_id);

        // 2. customer.updated (idempotent upsert)
        $payloadData['event_type'] = 'customer.updated';
        $payloadData['data']['name'] = 'Bistro Owner Updated';
        $rawPayload2 = json_encode($payloadData);
        $h1_2 = hash_hmac('sha256', "{$ts}:{$rawPayload2}", $secret);

        $request2 = Request::create('/central-api/webhooks/paddle', 'POST', [], [], [], [
            'HTTP_PADDLE_SIGNATURE' => "ts={$ts};h1={$h1_2}",
            'CONTENT_TYPE' => 'application/json',
        ], $rawPayload2);

        $response2 = $controller->handlePaddle($request2);
        $this->assertEquals(200, $response2->getStatusCode());

        $customer->refresh();
        $this->assertEquals('Bistro Owner Updated', $customer->name);
        $this->assertEquals(1, PaddleCustomer::where('id', 'ctm_01h8abc123')->count());
    }

    public function test_subscription_created_with_dynamic_plan_resolution_by_price_id()
    {
        $secret = 'pdl_ntfset_secret_sub';
        SaaSSetting::updateOrCreate(['key' => 'paddle_webhook_secret'], ['value' => $secret]);

        // Create a custom plan in DB with Paddle price IDs
        SubscriptionPlan::create([
            'name' => 'Growth Tier',
            'slug' => 'growth',
            'monthly_price' => 49.00,
            'yearly_price' => 490.00,
            'paddle_product_id' => 'pro_growth_123',
            'paddle_monthly_price_id' => 'pri_growth_monthly_999',
            'paddle_yearly_price_id' => 'pri_growth_yearly_999',
        ]);

        $tenant = Tenant::withoutEvents(function () {
            return Tenant::create([
                'id' => 'tenant_sub_test',
                'business_name' => 'Growth Cafe',
                'owner_email' => 'growth@cafe.com',
                'plan' => 'free',
            ]);
        });

        // Webhook comes with price ID, but NO plan_slug in custom_data
        $ts = time();
        $endsAt = now()->addMonth()->toIso8601String();
        $payloadData = [
            'event_type' => 'subscription.created',
            'data' => [
                'id' => 'sub_growth_abc',
                'customer_id' => 'ctm_growth_user',
                'status' => 'active',
                'items' => [
                    [
                        'price' => [
                            'id' => 'pri_growth_monthly_999',
                            'product_id' => 'pro_growth_123',
                            'billing_cycle' => ['interval' => 'month'],
                        ],
                    ],
                ],
                'custom_data' => [
                    'tenant_id' => $tenant->id,
                ],
                'current_billing_period' => [
                    'starts_at' => now()->toIso8601String(),
                    'ends_at' => $endsAt,
                ],
            ],
        ];

        $rawPayload = json_encode($payloadData);
        $h1 = hash_hmac('sha256', "{$ts}:{$rawPayload}", $secret);

        $request = Request::create('/central-api/webhooks/paddle', 'POST', [], [], [], [
            'HTTP_PADDLE_SIGNATURE' => "ts={$ts};h1={$h1}",
            'CONTENT_TYPE' => 'application/json',
        ], $rawPayload);

        $controller = new PaymentWebhookController();
        $response = $controller->handlePaddle($request);

        $this->assertEquals(200, $response->getStatusCode());

        // Assert mirrored subscription
        $sub = PaddleSubscription::find('sub_growth_abc');
        $this->assertNotNull($sub);
        $this->assertEquals('pri_growth_monthly_999', $sub->price_id);
        $this->assertEquals('growth', $sub->plan_slug); // Dynamically resolved!
        $this->assertEquals('active', $sub->status);

        // Assert tenant state synchronized
        $tenant->refresh();
        $this->assertEquals('growth', $tenant->plan);
        $this->assertEquals('sub_growth_abc', $tenant->subscription_id);
        $this->assertEquals('paddle', $tenant->subscription_provider);
        $this->assertEquals('active', $tenant->subscription_status);
        $this->assertTrue(hasPaidAccess($tenant));
    }

    public function test_subscription_updated_scheduled_cancellation_grace_period()
    {
        $secret = 'pdl_ntfset_secret_cancel';
        SaaSSetting::updateOrCreate(['key' => 'paddle_webhook_secret'], ['value' => $secret]);

        $tenant = Tenant::withoutEvents(function () {
            return Tenant::create([
                'id' => 'tenant_grace_test',
                'business_name' => 'Grace Lounge',
                'owner_email' => 'grace@lounge.com',
                'plan' => 'pro',
                'subscription_id' => 'sub_grace_123',
                'subscription_provider' => 'paddle',
                'subscription_status' => 'active',
                'subscription_ends_at' => now()->addDays(20),
            ]);
        });

        PaddleSubscription::create([
            'id' => 'sub_grace_123',
            'customer_id' => 'ctm_grace_123',
            'tenant_id' => $tenant->id,
            'status' => 'active',
            'plan_slug' => 'pro',
            'billing_interval' => 'month',
        ]);

        // User schedules cancellation in Paddle -> subscription.updated with scheduled_change.action = 'cancel'
        // Status remains 'active' until period ends!
        $ts = time();
        $payloadData = [
            'event_type' => 'subscription.updated',
            'data' => [
                'id' => 'sub_grace_123',
                'customer_id' => 'ctm_grace_123',
                'status' => 'active', // still active!
                'scheduled_change' => [
                    'action' => 'cancel',
                    'effective_at' => now()->addDays(20)->toIso8601String(),
                ],
                'custom_data' => ['tenant_id' => $tenant->id, 'plan_slug' => 'pro'],
                'current_billing_period' => [
                    'starts_at' => now()->subDays(10)->toIso8601String(),
                    'ends_at' => now()->addDays(20)->toIso8601String(),
                ],
            ],
        ];

        $rawPayload = json_encode($payloadData);
        $h1 = hash_hmac('sha256', "{$ts}:{$rawPayload}", $secret);

        $request = Request::create('/central-api/webhooks/paddle', 'POST', [], [], [], [
            'HTTP_PADDLE_SIGNATURE' => "ts={$ts};h1={$h1}",
            'CONTENT_TYPE' => 'application/json',
        ], $rawPayload);

        $controller = new PaymentWebhookController();
        $response = $controller->handlePaddle($request);
        $this->assertEquals(200, $response->getStatusCode());

        $sub = PaddleSubscription::find('sub_grace_123');
        $this->assertEquals('cancel', $sub->scheduled_change_action);
        $this->assertEquals('active', $sub->status);

        $tenant->refresh();
        $this->assertEquals('active', $tenant->subscription_status);

        // Crucial requirement: paid access MUST NOT be revoked during cancellation grace period!
        $this->assertTrue(hasPaidAccess($tenant));

        // When period ends and subscription.canceled arrives:
        $payloadData['event_type'] = 'subscription.canceled';
        $payloadData['data']['status'] = 'canceled';
        $payloadData['data']['canceled_at'] = now()->toIso8601String();

        $rawPayloadCanceled = json_encode($payloadData);
        $h1_canceled = hash_hmac('sha256', "{$ts}:{$rawPayloadCanceled}", $secret);

        $requestCanceled = Request::create('/central-api/webhooks/paddle', 'POST', [], [], [], [
            'HTTP_PADDLE_SIGNATURE' => "ts={$ts};h1={$h1_canceled}",
            'CONTENT_TYPE' => 'application/json',
        ], $rawPayloadCanceled);

        $responseCanceled = $controller->handlePaddle($requestCanceled);
        $this->assertEquals(200, $responseCanceled->getStatusCode());

        $sub->refresh();
        $this->assertEquals('canceled', $sub->status);

        $tenant->refresh();
        $this->assertEquals('canceled', $tenant->subscription_status);

        // Now paid access is revoked
        $this->assertFalse(hasPaidAccess($tenant));
    }

    public function test_has_paid_access_logic_across_gateways()
    {
        // 1. Stripe active tenant
        $stripeTenant = Tenant::withoutEvents(function () {
            return Tenant::create([
                'id' => 'tenant_stripe',
                'business_name' => 'Stripe Cafe',
                'plan' => 'pro',
                'subscription_provider' => 'stripe',
                'subscription_status' => 'active',
            ]);
        });
        $this->assertTrue(hasPaidAccess($stripeTenant));

        // 2. Paystack trialing tenant
        $paystackTenant = Tenant::withoutEvents(function () {
            return Tenant::create([
                'id' => 'tenant_paystack',
                'business_name' => 'Paystack Hub',
                'plan' => 'enterprise',
                'subscription_provider' => 'paystack',
                'subscription_status' => 'trialing',
            ]);
        });
        $this->assertTrue(hasPaidAccess($paystackTenant));

        // 3. Past due tenant
        $pastDueTenant = Tenant::withoutEvents(function () {
            return Tenant::create([
                'id' => 'tenant_past_due',
                'business_name' => 'Past Due Bar',
                'plan' => 'starter',
                'subscription_provider' => 'dodo',
                'subscription_status' => 'past_due',
            ]);
        });
        $this->assertFalse(hasPaidAccess($pastDueTenant));

        // 4. Testing mode grace period
        $testingTenant = Tenant::withoutEvents(function () {
            return Tenant::create([
                'id' => 'tenant_testing',
                'business_name' => 'Testing Restaurant',
                'plan' => 'starter',
                'subscription_status' => 'canceled',
                'is_testing' => true,
                'testing_ends_at' => now()->addDays(7),
            ]);
        });
        $this->assertTrue(hasPaidAccess($testingTenant));
    }

    public function test_customer_portal_session_resolves_mirrored_customer_id()
    {
        SaaSSetting::updateOrCreate(['key' => 'paddle_api_key'], ['value' => 'padd_live_test_apikey']);
        SaaSSetting::updateOrCreate(['key' => 'paddle_environment'], ['value' => 'sandbox']);

        $tenant = Tenant::withoutEvents(function () {
            return Tenant::create([
                'id' => 'tenant_portal_test',
                'business_name' => 'Portal Cafe',
                'owner_email' => 'portal@cafe.com',
                'plan' => 'pro',
                'subscription_id' => 'sub_portal_abc',
                'subscription_provider' => 'paddle',
                'subscription_status' => 'active',
            ]);
        });

        // Store mirrored customer and subscription
        PaddleCustomer::create([
            'id' => 'ctm_portal_xyz',
            'tenant_id' => $tenant->id,
            'email' => 'portal@cafe.com',
        ]);

        PaddleSubscription::create([
            'id' => 'sub_portal_abc',
            'customer_id' => 'ctm_portal_xyz',
            'tenant_id' => $tenant->id,
            'status' => 'active',
        ]);

        Http::fake([
            'https://sandbox-api.paddle.com/customers/ctm_portal_xyz/portal-sessions' => Http::response([
                'data' => [
                    'id' => 'ps_123456',
                    'urls' => [
                        'general' => [
                            'overview' => 'https://sandbox-paddle.com/portal/overview-link',
                        ],
                    ],
                ],
            ], 200),
        ]);

        $paymentService = new PaymentService();
        $portalUrl = $paymentService->createPaddlePortalSession($tenant);

        $this->assertEquals('https://sandbox-paddle.com/portal/overview-link', $portalUrl);
    }

    protected function tearDown(): void
    {
        DB::disconnect('platform');
        DB::disconnect('mysql');
        DB::disconnect('tenant');
        $dbFile = __DIR__ . '/test_paddle.sqlite';
        if (file_exists($dbFile)) {
            @unlink($dbFile);
        }
        parent::tearDown();
    }
}
