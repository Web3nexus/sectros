<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebsiteTemplate extends Model
{
    protected $connection = 'mysql'; // Central database

    protected $fillable = [
        'name',
        'slug',
        'category',
        'html_content',
        'css_content',
        'sections_json',
        'theme_json',
        'preview_image_url',
        'is_free',
        'price',
        'required_plan_id',
        'is_active',
    ];

    protected $casts = [
        'is_free' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'sections_json' => 'array',
        'theme_json' => 'array',
    ];

    /**
     * Get the plan that this template is free for.
     */
    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'required_plan_id');
    }
}
