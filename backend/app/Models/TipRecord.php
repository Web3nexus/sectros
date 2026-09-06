<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class TipRecord extends Model
{
    use BelongsToTenant;

    protected $table = 'tip_records';
    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'staff_profile_id',
        'shift_id',
        'date',
        'amount',
        'payout_status',
        'payout_method',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function staffProfile()
    {
        return $this->belongsTo(StaffProfile::class, 'staff_profile_id');
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class, 'shift_id');
    }
}

