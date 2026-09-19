<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaddleCustomer extends Model
{
    protected $connection = 'platform';
    protected $table = 'paddle_customers';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_id',
        'email',
        'name',
        'locale',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(PaddleSubscription::class, 'customer_id', 'id');
    }
}

