<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use App\Services\TenantResolver;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        $tenantId = TenantResolver::resolve()?->id;
        if ($tenantId) {
            $builder->where($model->getTable() . '.tenant_id', $tenantId);
        }
    }
}
