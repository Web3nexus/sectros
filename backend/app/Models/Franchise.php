<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Franchise extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'name',
        'owner_name',
        'contact_email',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }
}
