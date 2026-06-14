<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuCategory extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = ['tenant_id', 'name', 'description', 'image_url', 'sort_order', 'is_active'];

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }
}
