<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blacklist extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $table = 'blacklist';

    protected $fillable = [
        'tenant_id',
        'email',
        'phone',
        'customer_name',
        'reason'
    ];
}
