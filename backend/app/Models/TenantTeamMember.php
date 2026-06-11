<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantTeamMember extends Model
{
    protected $fillable = [
        'name',
        'role',
        'bio',
        'image_url',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
