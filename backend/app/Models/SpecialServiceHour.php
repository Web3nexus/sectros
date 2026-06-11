<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecialServiceHour extends Model
{
    protected $fillable = [
        'event_date',
        'name',
        'open_time',
        'close_time',
        'is_closed'
    ];

    protected $casts = [
        'event_date' => 'date',
        'is_closed' => 'boolean'
    ];
}
