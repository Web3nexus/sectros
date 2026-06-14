<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'type',
        'title',
        'message',
        'icon',
        'status',
        'reference_id',
    ];
}
