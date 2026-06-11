<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantGallery extends Model
{
    protected $fillable = [
        'title',
        'image_url',
        'caption',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
