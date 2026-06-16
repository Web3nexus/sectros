<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $connection = 'mysql';

    protected $fillable = [
        'tenant_id',
        'user_id',
        'user_email',
        'action',
        'details',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'details' => 'array',
    ];
}
