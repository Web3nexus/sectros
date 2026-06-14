<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NavigationMenu extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = ['tenant_id', 'name', 'links'];

    protected $casts = [
        'links' => 'json'
    ];
}
