<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Stancl\Tenancy\Database\Models\Domain;

class ProvisioningController extends Controller
{
    public function status(Tenant $tenant)
    {
        $domain = Domain::where('tenant_id', $tenant->id)->first();
        $dbExists = false;
        try {
            $dbExists = $tenant->database()->manager()->databaseExists();
        } catch (\Exception $e) {
            $dbExists = false;
        }

        $ownerExists = false;
        if ($dbExists) {
            $tenant->run(function () use (&$ownerExists) {
                $ownerExists = \App\Models\User::on('tenant')->where('role', 'owner')->exists();
            });
        }

        return response()->json([
            'tenant' => $tenant,
            'domain' => $domain?->domain,
            'database_created' => $dbExists,
            'owner_created' => $ownerExists,
            'migrations_run' => $dbExists,
        ]);
    }

    public function fullProvision(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|alpha_dash|unique:tenants,id',
            'business_name' => 'required|string|max:255',
            'business_type' => 'nullable|string|in:restaurant,cafe,salon,hotel',
            'domain' => 'required|string|alpha_dash',
            'plan' => 'nullable|string|exists:subscription_plans,slug',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|max:255',
            'owner_password' => 'required|string|min:8',
        ]);

        $centralDomain = config('tenancy.central_domains')[0] ?? 'sectrosweb.test';

        $tenant = Tenant::create([
            'id' => $validated['id'],
            'business_name' => $validated['business_name'],
            'business_type' => $validated['business_type'] ?? 'restaurant',
            'plan' => $validated['plan'] ?? 'free',
            'owner_name' => $validated['owner_name'],
            'owner_email' => $validated['owner_email'],
            'status' => 'active',
        ]);

        Domain::create([
            'tenant_id' => $tenant->id,
            'domain' => $validated['domain'] . '.' . $centralDomain,
        ]);

        $tenant->run(function () use ($validated) {
            $owner = \App\Models\User::on('tenant')->where('role', 'owner')->first();
            if ($owner) {
                $owner->password = Hash::make($validated['owner_password']);
                $owner->save();
            }
        });

        return response()->json([
            'message' => 'Tenant provisioned successfully.',
            'tenant' => $tenant,
            'domain' => $validated['domain'] . '.' . $centralDomain,
        ], 201);
    }
}
