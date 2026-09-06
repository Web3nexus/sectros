<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class ProcurementList extends Model
{
    use BelongsToTenant;

    protected $table = 'procurement_lists';
    protected $connection = 'tenant';

    protected $fillable = [
        'tenant_id',
        'title',
        'department',
        'status',
        'total_estimated_cost',
    ];

    protected $casts = [
        'total_estimated_cost' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(ProcurementItem::class, 'procurement_list_id');
    }
}

