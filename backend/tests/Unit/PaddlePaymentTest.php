<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\SaaSSetting;
use App\Models\Tenant;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\PaymentWebhookController;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class PaddlePaymentTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        foreach (['platform', config('database.default')] as $conn) {
            Schema::connection($conn)->dropIfExists('saa_s_settings');
            Schema::connection($conn)->dropIfExists('tenants');
            Schema::connection($conn)->dropIfExists('subscription_plans');
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
                $table->json('data')->nullable();
                $table->timestamps();
            });

            Schema::connection($conn)->create('subscription_plans', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->decimal('monthly_price', 8, 2)->default(0);
                $table->decimal('yearly_price', 8, 2)->default(0);
                $table->json('features')->nullable();
                $table->boolean('is_active')->default(true);
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
    }
    public function test_paddle_gateway_selection()
    {
        // Mock SaaSSetting
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

    public function test_paddle_webhook_signature_verification_and_subscription_fulfillment()
    {
        $webhookSecret = 'pdl_ntfset_test_secret_123456';
        SaaSSetting::updateOrCreate(['key' => 'paddle_webhook_secret'], ['value' => $webhookSecret]);

        $tenantId = 'paddle_test_tenant_' . uniqid();
        $tenant = Tenant::withoutEvents(function () use ($tenantId) {
            return Tenant::create([
                'id' => $tenantId,
                'business_name' => 'Paddle Test Business',
                'owner_email' => 'owner@paddletest.com',
                'plan' => 'free',
                'subscription_status' => 'active',
            ]);
        });

        $payloadData = [
            'event_type' => 'transaction.completed',
            'data' => [
                'id' => 'txn_01h_test_123',
                'subscription_id' => 'sub_01h_paddle_sub_456',
                'status' => 'completed',
                'custom_data' => [
                    'type' => 'subscription',
                    'tenant_id' => $tenantId,
                    'plan_slug' => 'pro',
                    'interval' => 'monthly',
                ],
                'details' => [
                    'totals' => [
                        'total' => 2900,
                    ]
                ]
            ]
        ];

        $rawPayload = json_encode($payloadData);
        $ts = time();
        $signature = hash_hmac('sha256', "{$ts}:{$rawPayload}", $webhookSecret);
        $signatureHeader = "ts={$ts};h1={$signature}";

        $request = Request::create('/central-api/webhooks/paddle', 'POST', [], [], [], [
            'HTTP_PADDLE_SIGNATURE' => $signatureHeader,
            'CONTENT_TYPE' => 'application/json',
        ], $rawPayload);

        $controller = new PaymentWebhookController();
        $response = $controller->handlePaddle($request);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('success', $response->getData()->status);

        // Verify tenant was updated
        $freshTenant = Tenant::find($tenantId);
        $this->assertEquals('pro', $freshTenant->plan);
        $this->assertEquals('sub_01h_paddle_sub_456', $freshTenant->subscription_id);
        $this->assertEquals('paddle', $freshTenant->subscription_provider);
        $this->assertEquals('active', $freshTenant->subscription_status);
        $this->assertNotNull($freshTenant->subscription_ends_at);

        // Test subscription.canceled
        $cancelPayloadData = [
            'event_type' => 'subscription.canceled',
            'data' => [
                'id' => 'sub_01h_paddle_sub_456',
                'status' => 'canceled',
                'custom_data' => [
                    'tenant_id' => $tenantId,
                ]
            ]
        ];

        $rawCancelPayload = json_encode($cancelPayloadData);
        $tsCancel = time();
        $signatureCancel = hash_hmac('sha256', "{$tsCancel}:{$rawCancelPayload}", $webhookSecret);
        $headerCancel = "ts={$tsCancel};h1={$signatureCancel}";

        $cancelRequest = Request::create('/central-api/webhooks/paddle', 'POST', [], [], [], [
            'HTTP_PADDLE_SIGNATURE' => $headerCancel,
            'CONTENT_TYPE' => 'application/json',
        ], $rawCancelPayload);

        $cancelResponse = $controller->handlePaddle($cancelRequest);
        $this->assertEquals(200, $cancelResponse->getStatusCode());

        $freshTenantAfterCancel = Tenant::find($tenantId);
        $this->assertEquals('canceled', $freshTenantAfterCancel->subscription_status);

        // Clean up test tenant
        $tenant->delete();
    }

    public function test_paddle_webhook_rejects_invalid_signature()
    {
        $webhookSecret = 'pdl_ntfset_secret_valid';
        SaaSSetting::updateOrCreate(['key' => 'paddle_webhook_secret'], ['value' => $webhookSecret]);

        $payload = json_encode(['event_type' => 'transaction.completed']);
        $ts = time();
        $fakeSignature = 'invalid_hash_123456';
        $signatureHeader = "ts={$ts};h1={$fakeSignature}";

        $request = Request::create('/central-api/webhooks/paddle', 'POST', [], [], [], [
            'HTTP_PADDLE_SIGNATURE' => $signatureHeader,
            'CONTENT_TYPE' => 'application/json',
        ], $payload);

        $controller = new PaymentWebhookController();
        $response = $controller->handlePaddle($request);

        $this->assertEquals(401, $response->getStatusCode());
    }

    public function test_paddle_webhook_rejects_expired_timestamp()
    {
        $webhookSecret = 'pdl_ntfset_secret_valid';
        SaaSSetting::updateOrCreate(['key' => 'paddle_webhook_secret'], ['value' => $webhookSecret]);

        $payload = json_encode(['event_type' => 'transaction.completed']);
        // 10 minutes in the past
        $ts = time() - 600;
        $signature = hash_hmac('sha256', "{$ts}:{$payload}", $webhookSecret);
        $signatureHeader = "ts={$ts};h1={$signature}";

        $request = Request::create('/central-api/webhooks/paddle', 'POST', [], [], [], [
            'HTTP_PADDLE_SIGNATURE' => $signatureHeader,
            'CONTENT_TYPE' => 'application/json',
        ], $payload);

        $controller = new PaymentWebhookController();
        $response = $controller->handlePaddle($request);

        $this->assertEquals(401, $response->getStatusCode());
    }

    public function test_paddle_subscription_updated_event()
    {
        $webhookSecret = 'pdl_ntfset_test_secret_sync';
        SaaSSetting::updateOrCreate(['key' => 'paddle_webhook_secret'], ['value' => $webhookSecret]);

        $tenantId = 'paddle_sync_tenant_' . uniqid();
        $tenant = Tenant::withoutEvents(function () use ($tenantId) {
            return Tenant::create([
                'id' => $tenantId,
                'business_name' => 'Paddle Sync Business',
                'owner_email' => 'sync@paddletest.com',
                'plan' => 'pro',
                'subscription_id' => 'sub_paddle_sync_999',
                'subscription_provider' => 'paddle',
                'subscription_status' => 'past_due',
            ]);
        });

        $payloadData = [
            'event_type' => 'subscription.updated',
            'data' => [
                'id' => 'sub_paddle_sync_999',
                'status' => 'active',
                'current_billing_period' => [
                    'ends_at' => '2026-10-19T20:00:00Z',
                ],
                'custom_data' => [
                    'tenant_id' => $tenantId,
                ]
            ]
        ];

        $rawPayload = json_encode($payloadData);
        $ts = time();
        $signature = hash_hmac('sha256', "{$ts}:{$rawPayload}", $webhookSecret);
        $signatureHeader = "ts={$ts};h1={$signature}";

        $request = Request::create('/central-api/webhooks/paddle', 'POST', [], [], [], [
            'HTTP_PADDLE_SIGNATURE' => $signatureHeader,
            'CONTENT_TYPE' => 'application/json',
        ], $rawPayload);

        $controller = new PaymentWebhookController();
        $response = $controller->handlePaddle($request);

        $this->assertEquals(200, $response->getStatusCode());

        $fresh = Tenant::find($tenantId);
        $this->assertEquals('active', $fresh->subscription_status);
        $this->assertStringContainsString('2026-10-19', (string) $fresh->subscription_ends_at);

        $tenant->delete();
    }
}
