<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class TenantTheme extends Model
{
    use BelongsToTenant;

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
}
