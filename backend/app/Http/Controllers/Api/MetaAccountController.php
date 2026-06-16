<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConnectedAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MetaAccountController extends Controller
{
    /**
     * List all connected Meta accounts (Facebook pages + Instagram) for the current tenant.
     */
    public function index(Request $request)
    {
        $tenant = tenant();

        $accounts = ConnectedAccount::forTenant($tenant->id)
            ->whereIn('channel', ['facebook', 'instagram'])
            ->orderBy('channel')
            ->orderBy('page_name')
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'channel' => $account->channel,
                    'page_id' => $account->page_id,
                    'page_name' => $account->page_name,
                    'instagram_business_account_id' => $account->instagram_business_account_id,
                    'instagram_username' => $account->instagram_username,
                    'status' => $account->status,
                    'webhook_subscribed' => $account->webhook_subscribed,
                    'created_at' => $account->created_at,
                ];
            });

        $metaUser = ConnectedAccount::forTenant($tenant->id)
            ->where('channel', 'meta_user')
            ->first();

        return response()->json([
            'accounts' => $accounts,
            'meta_connected' => $metaUser && $metaUser->isActive(),
            'meta_user_id' => $metaUser?->meta_user_id,
            'token_expires_at' => $metaUser?->token_expires_at,
        ]);
    }

    /**
     * Disconnect (delete) a single connected account.
     */
    public function disconnect($id)
    {
        $tenant = tenant();

        $account = ConnectedAccount::forTenant($tenant->id)
            ->whereIn('channel', ['facebook', 'instagram'])
            ->find($id);

        if (!$account) {
            return response()->json(['error' => 'Account not found.'], 404);
        }

        $account->delete();

        Log::info('Meta account disconnected', [
            'tenant_id' => $tenant->id,
            'channel' => $account->channel,
            'page_id' => $account->page_id,
        ]);

        return response()->json(['message' => 'Account disconnected successfully.']);
    }

    /**
     * Disconnect all Meta accounts for this tenant.
     */
    public function disconnectAll(Request $request)
    {
        $tenant = tenant();

        ConnectedAccount::forTenant($tenant->id)
            ->whereIn('channel', ['facebook', 'instagram', 'meta_user'])
            ->delete();

        Log::info('All Meta accounts disconnected', ['tenant_id' => $tenant->id]);

        return response()->json(['message' => 'All Meta accounts disconnected.']);
    }
}
