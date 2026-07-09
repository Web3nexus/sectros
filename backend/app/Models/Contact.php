<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'name',
        'phone',
        'email',
        'external_id',
        'channel_type',
        'avatar_url',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
