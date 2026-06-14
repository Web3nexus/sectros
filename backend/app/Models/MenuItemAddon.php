<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItemAddon extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = ['tenant_id', 'menu_item_id', 'name', 'price', 'is_required'];

    public function item(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }
}
