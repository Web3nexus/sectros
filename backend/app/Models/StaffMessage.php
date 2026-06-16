<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffMessage extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $connection = 'tenant';

    protected $fillable = [
        'sender_id',
        'staff_profile_id',
        'to_all',
        'subject',
        'body',
    ];

    protected $casts = [
        'to_all' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient()
    {
        return $this->belongsTo(StaffProfile::class, 'staff_profile_id');
    }
}
