<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantTheme extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'tenant_id',
        'website_template_id',
        'purchased_at',
        'price_paid',
    ];

    protected $casts = [
        'purchased_at' => 'datetime',
        'price_paid' => 'decimal:2',
    ];

    public function template()
    {
        return $this->belongsTo(WebsiteTemplate::class, 'website_template_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }
}
