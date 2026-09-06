<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class TaxAdvisor extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'tax_advisors';
    protected $connection = 'platform';

    protected $fillable = [
        'name',
        'email',
        'password',
        'company_name',
        'phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function clientAccesses()
    {
        return $this->hasMany(TaxAdvisorAccess::class, 'tax_advisor_id');
    }

    public function bills()
    {
        return $this->hasMany(AdvisorBill::class, 'tax_advisor_id');
    }
}

