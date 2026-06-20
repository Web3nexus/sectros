<?php

namespace App\Scopes;

use App\Services\TenantResolver;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class StrictTenantScope implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        $tenantId = TenantResolver::resolve()?->id;

        if ($tenantId) {
            $builder->where($model->getTable() . '.tenant_id', $tenantId);
        } else {
            $builder->whereRaw('1 = 0');
        }
    }
}
