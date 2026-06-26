<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoiceAgentPhoneNumber extends Model
{
    protected $connection = 'platform';

    protected $fillable = [
        'tenant_id',
        'provider',
        'phone_number',
        'phone_number_source',
        'external_phone_number_id',
        'external_agent_id',
        'status',
        'assigned_at',
        'released_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'released_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    public function scopeAvailable($query)
    {
        return $query->whereNull('tenant_id')->where('status', 'available');
    }

    public function scopeAssigned($query)
    {
        return $query->whereNotNull('tenant_id')->whereIn('status', ['assigned', 'active']);
    }

    public function assignToTenant(string $tenantId): void
    {
        $this->tenant_id = $tenantId;
        $this->status = 'assigned';
        $this->assigned_at = now();
        $this->save();
    }

    public function release(): void
    {
        $this->tenant_id = null;
        $this->status = 'available';
        $this->external_agent_id = null;
        $this->released_at = now();
        $this->save();
    }
}
