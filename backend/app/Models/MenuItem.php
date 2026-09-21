<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuItem extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'menu_category_id', 
        'name', 
        'description', 
        'price', 
        'image_url', 
        'is_available', 
        'is_kiosk_available', 
        'sort_order'
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'is_kiosk_available' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id');
    }

    public function addons(): HasMany
    {
        return $this->hasMany(MenuItemAddon::class);
    }
}
