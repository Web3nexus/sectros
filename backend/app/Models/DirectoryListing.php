<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DirectoryListing extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'business_type',
        'category_id',
        'description',
        'address',
        'city',
        'country',
        'latitude',
        'longitude',
        'phone',
        'email',
        'website',
        'logo',
        'cover_image',
        'opening_hours',
        'services',
        'is_verified',
        'is_featured',
        'is_published',
        'rating_avg',
        'review_count',
        'price_range'
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'services' => 'array',
        'is_verified' => 'boolean',
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'rating_avg' => 'decimal:2',
        'price_range' => 'decimal:1',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(DirectoryCategory::class, 'category_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(DirectoryReview::class, 'listing_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }
}
