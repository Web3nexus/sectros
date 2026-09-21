<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    protected $connection = 'platform';
    
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'plan',
            'business_name',
            'business_type',
            'owner_name',
            'owner_email',
            'status',
            'trial_ends_at',
            'is_testing',
            'testing_ends_at',
            'ai_credits_used',
            'ai_credits_topup',
            'ai_credits_reset_at',
            'sms_credits_used',
            'sms_credits_topup',
            'sms_credits_reset_at',
            'voice_credits_used',
            'voice_credits_topup',
            'voice_credits_reset_at',
            'features',
            'country',
            'subscription_id',
            'subscription_provider',
            'subscription_status',
            'subscription_ends_at',
            'created_at',
            'updated_at',
        ];
    }

    protected $casts = [
        'features' => 'array',
        'ai_credits_used' => 'integer',
        'ai_credits_topup' => 'integer',
        'ai_credits_reset_at' => 'datetime',
        'sms_credits_used' => 'integer',
        'sms_credits_topup' => 'integer',
        'sms_credits_reset_at' => 'datetime',
        'voice_credits_used' => 'integer',
        'voice_credits_topup' => 'integer',
        'voice_credits_reset_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'is_testing' => 'boolean',
        'testing_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
    ];

    /**
     * The tenant's public-facing website domain, preferring a verified
     * business-owned domain (custom or NameSilo-registered) over the
     * platform subdomain created at registration. Returns null when the
     * tenant has no attached domains.
     */
    public function publicWebsiteDomain(): ?string
    {
        // Business-owned domain that the tenant has verified ownership of.
        $business = $this->domains()
            ->whereIn('type', ['custom', 'registered'])
            ->where('is_verified', true)
            ->orderBy('id')
            ->first();

        if ($business) {
            return rtrim((string) $business->domain, '.');
        }

        // Primary platform subdomain (created at registration).
        $primary = $this->domains()->orderBy('id')->first();

        return $primary ? rtrim((string) $primary->domain, '.') : null;
    }

    public function paddleSubscriptions()
    {
        return $this->hasMany(PaddleSubscription::class, 'tenant_id', 'id');
    }

    public function paddleCustomer()
    {
        return $this->hasOne(PaddleCustomer::class, 'tenant_id', 'id');
    }

    /**
     * Determine if this tenant has paid subscription access across any gateway.
     * Grants access if testing/trial is active, or status is active/trialing.
     * Preserves access during scheduled_change (cancellation at period end).
     */
    public function hasPaidAccess(): bool
    {
        if ($this->is_testing && $this->testing_ends_at && $this->testing_ends_at->isFuture()) {
            return true;
        }
        if ($this->trial_ends_at && $this->trial_ends_at->isFuture()) {
            return true;
        }

        // Check Paddle mirrored subscription if provider is paddle
        if ($this->subscription_provider === 'paddle' && $this->subscription_id) {
            $paddleSub = PaddleSubscription::find($this->subscription_id);
            if ($paddleSub) {
                return $paddleSub->hasPaidAccess();
            }
        }

        return in_array($this->subscription_status, ['active', 'trialing']);
    }
}

