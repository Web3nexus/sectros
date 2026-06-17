<?php

namespace App\Traits;

use App\Models\Tenant;
use App\Scopes\StrictTenantScope;
use App\Scopes\TenantScope;
use App\Services\TenantResolver;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use RuntimeException;

trait BelongsToTenant
{
    public static function bootBelongsToTenant()
    {
        static::addGlobalScope(new StrictTenantScope);

        static::creating(function ($model) {
            if (!$model->tenant_id) {
                $resolved = TenantResolver::resolve();
                if ($resolved) {
                    $model->tenant_id = $resolved->id;
                } elseif (auth()->check() && auth()->user()->tenant_id) {
                    $model->tenant_id = auth()->user()->tenant_id;
                } else {
                    throw new RuntimeException(
                        'Cannot create ' . get_class($model) .
                        ' without tenant_id. Ensure tenant context is resolved.'
                    );
                }
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scopeAllTenants($query)
    {
        return $query->withoutGlobalScope(StrictTenantScope::class);
    }

    public function scopeForTenant($query, $tenantId)
    {
        return $query->where($this->getTable() . '.tenant_id', $tenantId);
    }
}
