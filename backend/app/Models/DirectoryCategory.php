<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DirectoryCategory extends Model
{
    protected $fillable = ['name', 'slug', 'icon', 'description'];

    public function listings(): HasMany
    {
        return $this->hasMany(DirectoryListing::class, 'category_id');
    }
}
