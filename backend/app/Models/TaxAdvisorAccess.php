<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaxAdvisorAccess extends Model
{
    protected $table = 'tax_advisor_accesses';
    protected $connection = 'platform';

    protected $fillable = [
        'tax_advisor_id',
        'tenant_id',
        'permissions',
        'status',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function taxAdvisor()
    {
        return $this->belongsTo(TaxAdvisor::class, 'tax_advisor_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }
}

