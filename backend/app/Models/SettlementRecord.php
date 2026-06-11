<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SettlementRecord extends Model
{
    protected $fillable = [
        'date',
        'opening_balance',
        'closing_balance',
        'cash_collected',
        'card_collected',
        'tips_collected',
        'expenses_total',
        'net_total',
        'discrepancy',
        'notes',
        'staff_profile_id'
    ];

    public function staff()
    {
        return $this->belongsTo(StaffProfile::class, 'staff_profile_id');
    }
}
