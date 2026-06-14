<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class TenantNotification extends Model
{
    use BelongsToTenant;

    protected $connection = 'tenant';

    protected $table = 'tenant_notifications';

    protected $fillable = [
        'tenant_id',
        'type',
        'title',
        'message',
        'icon',
        'status',
        'reference_id',
    ];

    protected $casts = [
        'tenant_id' => 'string',
    ];
}
