<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class Payslip extends Model
{
    use BelongsToTenant;

    protected $table = 'payslips';
    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'staff_profile_id',
        'period_month',
        'gross_amount',
        'net_amount',
        'deductions',
        'hours_worked',
        'file_url',
        'signature_data',
        'signed_at',
        'status',
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'deductions' => 'decimal:2',
        'hours_worked' => 'decimal:2',
        'signed_at' => 'datetime',
    ];

    public function staffProfile()
    {
        return $this->belongsTo(StaffProfile::class, 'staff_profile_id');
    }
}

