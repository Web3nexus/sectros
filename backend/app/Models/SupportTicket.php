<?php

namespace App\Models;

use App\Services\TenantResolver;
use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'tenant_id',
        'subject',
        'message',
        'status',
        'priority',
        'category',
        'submitter_name',
        'submitter_email',
        'dismissed_at',
    ];

    protected $casts = [
        'dismissed_at' => 'datetime',
    ];

    public function scopeForTenant($query, $tenantId = null)
    {
        $tenantId = $tenantId ?? TenantResolver::id();
        if ($tenantId) {
            return $query->where('tenant_id', $tenantId);
        }
        return $query;
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }
}
