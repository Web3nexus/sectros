<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactLead extends Model
{
    protected $fillable = [
        'name',
        'email',
        'business',
        'business_type',
        'locations',
        'message',
        'status',
        'ip_address',
    ];
}
