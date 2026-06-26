<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SitemapEntry extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'tenant_id',
        'path',
        'priority',
        'changefreq',
        'is_active',
        'lastmod',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'lastmod' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }
}
