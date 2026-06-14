<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    protected $connection = 'platform';
    protected $fillable = [
        'slug',
        'subject',
        'content',
        'variables',
    ];

    protected $casts = [
        'variables' => 'array',
    ];
}
