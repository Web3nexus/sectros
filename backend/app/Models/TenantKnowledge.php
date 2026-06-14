<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantKnowledge extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'title',
        'content',
        'type',
        'file_path',
        'is_active',
    ];
}
