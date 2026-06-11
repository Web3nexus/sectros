<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Waitlist extends Model
{
    protected $fillable = [
        'customer_name',
        'customer_phone',
        'customer_email',
        'party_size',
        'estimated_wait_minutes',
        'status',
        'notified_at',
        'notes'
    ];

    protected $casts = [
        'notified_at' => 'datetime'
    ];
}
