<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TenantBlog extends Model
{
    protected $table = 'tenant_blog_posts';

    protected $fillable = [
        'title',
        'slug',
        'content',
        'excerpt',
        'image_url',
        'author',
        'category',
        'published_at',
        'is_published',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_published' => 'boolean',
    ];

    protected static function booted()
    {
        static::creating(function ($post) {
            if (!$post->slug) {
                $post->slug = Str::slug($post->title);
            }
        });
    }
}
