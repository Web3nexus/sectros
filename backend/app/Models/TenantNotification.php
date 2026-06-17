<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantNotification extends Model
{
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
