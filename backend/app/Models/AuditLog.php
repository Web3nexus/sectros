<?php

namespace App\Models;

use App\Services\TenantResolver;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $connection = 'mysql';

    protected $fillable = [
        'tenant_id',
        'user_id',
        'user_email',
        'action',
        'details',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'details' => 'array',
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
