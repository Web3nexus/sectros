<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantReview extends Model
{
    protected $fillable = [
        'customer_name',
        'customer_avatar',
        'rating',
        'text',
        'location',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_published' => 'boolean',
        'sort_order' => 'integer',
    ];
}
