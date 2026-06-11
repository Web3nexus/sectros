<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceLog extends Model
{
    protected $fillable = [
        'staff_profile_id',
        'shift_id',
        'check_in',
        'check_out',
        'break_start',
        'break_end',
        'total_hours'
    ];

    public function staff()
    {
        return $this->belongsTo(StaffProfile::class, 'staff_profile_id');
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }
}
