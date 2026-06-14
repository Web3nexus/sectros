<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BuilderPage extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = ['tenant_id', 'slug', 'title', 'sections_json', 'html_content', 'css_content', 'settings', 'is_published'];
}
