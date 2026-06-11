<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BuilderPage extends Model
{
    protected $fillable = ['slug', 'title', 'sections_json', 'html_content', 'css_content', 'settings', 'is_published'];
}
