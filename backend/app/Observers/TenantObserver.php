<?php

namespace App\Observers;

use App\Models\Tenant;
use App\Models\SubscriptionPlan;

class TenantObserver
{
    public function saving(Tenant $tenant)
    {
        if ($tenant->isDirty('plan') || !$tenant->exists) {
            $plan = SubscriptionPlan::where('slug', $tenant->plan)->first();
            if ($plan) {
                $tenant->features = $plan->features;
            }
        }
    }

    public function updated(Tenant $tenant): void
    {
        \App\Services\TenantResolver::forgetCache($tenant->id);
    }

    public function deleted(Tenant $tenant): void
    {
        \App\Services\TenantResolver::forgetCache($tenant->id);
    }
}
