<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DirectoryReview extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'listing_id',
        'customer_name',
        'customer_email',
        'rating',
        'comment',
        'is_verified_customer',
        'is_published'
    ];

    protected $casts = [
        'is_verified_customer' => 'boolean',
        'is_published' => 'boolean',
    ];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(DirectoryListing::class, 'listing_id');
    }
}
