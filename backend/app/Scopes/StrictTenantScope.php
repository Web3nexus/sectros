<?php

namespace App\Scopes;

use App\Services\TenantResolver;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use RuntimeException;

class StrictTenantScope implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        $tenantId = TenantResolver::resolve()?->id;

        if (!$tenantId) {
            throw new RuntimeException(
                'Tenant context could not be resolved for ' . get_class($model) .
                '. Ensure TenantResolver can resolve a tenant before querying tenant-scoped models.'
            );
        }

        $builder->where($model->getTable() . '.tenant_id', $tenantId);
    }
}
