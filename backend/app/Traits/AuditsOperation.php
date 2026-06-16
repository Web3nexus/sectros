<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

trait AuditsOperation
{
    protected function audit(string $action, array $details = [], ?string $tenantId = null): void
    {
        $user = Request::user();

        AuditLog::create([
            'tenant_id' => $tenantId ?? (function_exists('tenant') ? tenant('id') : null),
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'action' => $action,
            'details' => $details,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
