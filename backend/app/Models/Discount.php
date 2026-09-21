<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'code',
        'description',
        'type',
        'value',
        'currency_code',
        'min_subtotal',
        'max_discount',
        'restrict_to',
        'usage_limit',
        'usage_count',
        'per_customer_limit',
        'starts_at',
        'expires_at',
        'is_active',
        'is_recurring',
        'maximum_recurring_intervals',
        'paddle_id',
        'stripe_coupon_id',
    ];

    protected $casts = [
        'value' => 'float',
        'min_subtotal' => 'float',
        'max_discount' => 'float',
        'restrict_to' => 'array',
        'usage_count' => 'integer',
        'is_active' => 'boolean',
        'is_recurring' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function redemptions()
    {
        return $this->hasMany(DiscountRedemption::class, 'discount_id');
    }

    public function scopes(): array
    {
        return (array) ($this->restrict_to['scopes'] ?? []);
    }

    public function planSlugs(): array
    {
        return (array) ($this->restrict_to['plan_slugs'] ?? []);
    }

    public function addonIds(): array
    {
        return (array) ($this->restrict_to['addon_ids'] ?? []);
    }

    public function templateIds(): array
    {
        return (array) ($this->restrict_to['template_ids'] ?? []);
    }

    public function isUsableNow(): bool
    {
        if (!$this->is_active) return false;
        if ($this->starts_at && $this->starts_at->isFuture()) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->usage_limit !== null && $this->usage_count >= $this->usage_limit) return false;
        return true;
    }

    public function display(): string
    {
        if ($this->type === 'fixed') {
            return ($this->currency_code ?: 'USD') . ' ' . number_format($this->value, 2);
        }
        return rtrim(rtrim(number_format($this->value, 2, '.', ''), '0'), '.') . '%';
    }
}