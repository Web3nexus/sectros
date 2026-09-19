<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaddleSubscription extends Model
{
    protected $connection = 'platform';
    protected $table = 'paddle_subscriptions';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'customer_id',
        'tenant_id',
        'status',
        'price_id',
        'product_id',
        'plan_slug',
        'billing_interval',
        'scheduled_change_action',
        'scheduled_change_at',
        'current_billing_period_starts_at',
        'current_billing_period_ends_at',
        'canceled_at',
    ];

    protected $casts = [
        'scheduled_change_at' => 'datetime',
        'current_billing_period_starts_at' => 'datetime',
        'current_billing_period_ends_at' => 'datetime',
        'canceled_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(PaddleCustomer::class, 'customer_id', 'id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_slug', 'slug');
    }

    /**
     * Determine if this Paddle subscription grants paid access.
     * Grants access if status is 'active' or 'trialing'.
     * Preserves access during scheduled_change (cancel at period end) until status is 'canceled'.
     */
    public function hasPaidAccess(): bool
    {
        return in_array($this->status, ['active', 'trialing']);
    }
}

