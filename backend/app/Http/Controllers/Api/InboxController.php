<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\AiReplyLog;
use App\Services\Messaging\MessagingProviderManager;
use App\Services\SocialMessengerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InboxController extends Controller
{
    protected MessagingProviderManager $providerManager;

    public function __construct(MessagingProviderManager $providerManager)
    {
        $this->providerManager = $providerManager;
    }

    public function conversations(Request $request): JsonResponse
    {
        $tenantId = tenant('id');

        $query = Conversation::forTenant($tenantId)
            ->with(['contact', 'latestMessage'])
            ->orderBy('last_message_at', 'desc');

        if ($request->channel_type) {
            $query->where('channel_type', $request->channel_type);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->assigned_to) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $conversations = $this->paginate($query, 50);

        $conversations->getCollection()->transform(function ($conv) {
            $lastMessage = $conv->latestMessage;

            return [
                'id' => $conv->id,
                'channel_type' => $conv->channel_type,
                'channel_id' => $conv->channel_id,
                'contact' => $conv->contact ? [
                    'id' => $conv->contact->id,
                    'name' => $conv->contact->name,
                    'phone' => $conv->contact->phone,
                    'avatar_url' => $conv->contact->avatar_url,
                ] : null,
                'status' => $conv->status,
                'assigned_to' => $conv->assigned_to,
                'ai_active' => $conv->ai_active,
                'human_taken_over' => $conv->human_taken_over,
                'unread_count' => $conv->unread_count,
                'last_message' => $lastMessage ? [
                    'text' => $lastMessage->text,
                    'message_type' => $lastMessage->message_type,
                    'direction' => $lastMessage->direction,
                    'created_at' => $lastMessage->created_at->toIso8601String(),
                ] : null,
                'last_message_at' => $conv->last_message_at?->toIso8601String(),
                'created_at' => $conv->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'conversations' => $conversations->items(),
            'meta' => [
                'current_page' => $conversations->currentPage(),
                'last_page' => $conversations->lastPage(),
                'per_page' => $conversations->perPage(),
                'total' => $conversations->total(),
            ],
        ]);
    }

    public function conversationMessages(Request $request, $id): JsonResponse
    {
        $tenantId = tenant('id');
        $conversation = Conversation::forTenant($tenantId)->findOrFail($id);

        $messages = Message::forTenant($tenantId)
            ->where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'asc')
            ->paginate(min((int) request('per_page', 50), 100));

        $conversation->update(['unread_count' => 0]);

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'contact' => $conversation->contact,
                'channel_type' => $conversation->channel_type,
                'channel_id' => $conversation->channel_id,
                'status' => $conversation->status,
                'ai_active' => $conversation->ai_active,
                'human_taken_over' => $conversation->human_taken_over,
                'assigned_to' => $conversation->assigned_to,
            ],
            'messages' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    public function sendReply(Request $request, $conversationId): JsonResponse
    {
        $tenantId = tenant('id');
        $request->validate(['message' => 'required|string|max:4096']);

        $conversation = Conversation::forTenant($tenantId)->findOrFail($conversationId);
        $channel = Channel::forTenant($tenantId)
            ->where('external_account_id', $conversation->channel_id)
            ->first();

        if (!$channel || !$channel->isConnected()) {
            return response()->json(['error' => 'Channel not connected'], 400);
        }

        $messageText = $request->message;
        $contact = $conversation->contact;

        $lastIncoming = Message::forTenant($tenantId)
            ->where('conversation_id', $conversation->id)
            ->where('direction', 'incoming')
            ->orderBy('created_at', 'desc')
            ->first();

        $recipientId = $lastIncoming?->sender_id ?? $contact?->external_id;
        if (!$recipientId) {
            return response()->json(['error' => 'No recipient found'], 400);
        }

        try {
            if ($channel->integration_mode === 'partner') {
                $messenger = new SocialMessengerService();
                $metaData = ['tenant_id' => $tenantId];

                if ($channel->channel_type === 'whatsapp') {
                    $metaData['phone_number_id'] = $channel->phone_number_id;
                } elseif ($channel->channel_type === 'facebook') {
                    $metaData['page_token'] = $channel->access_token;
                } elseif ($channel->channel_type === 'instagram') {
                    $metaData['page_token'] = $channel->access_token;
                    $metaData['instagram_id'] = $channel->instagram_account_id;
                }

                $sent = $messenger->sendMessage(
                    ucfirst($channel->channel_type),
                    $recipientId,
                    $messageText,
                    $metaData
                );

                if (!$sent) {
                    return response()->json(['error' => 'Failed to send via partner mode'], 500);
                }
            } else {
                $adapter = $this->providerManager->resolveForChannel($channel);
                $result = $adapter->sendMessage($channel, $recipientId, $messageText);

                if (!$result['success']) {
                    return response()->json(['error' => $result['error'] ?? 'Failed to send message'], 500);
                }
            }

            $message = Message::create([
                'tenant_id' => $tenantId,
                'conversation_id' => $conversation->id,
                'contact_id' => $contact?->id,
                'channel_id' => $channel->external_account_id,
                'channel_type' => $channel->channel_type,
                'integration_mode' => $channel->integration_mode,
                'provider_name' => $channel->provider_name,
                'sender_id' => $channel->external_account_id,
                'recipient_id' => $recipientId,
                'direction' => 'outgoing',
                'message_type' => 'text',
                'text' => $messageText,
            ]);

            $conversation->update([
                'last_message_at' => now(),
                'human_taken_over' => true,
            ]);

            if (!empty($result['external_message_id'] ?? null)) {
                $message->update(['external_message_id' => $result['external_message_id']]);
            }

            return response()->json([
                'message' => 'Reply sent',
                'data' => $message,
            ]);
        } catch (\Exception $e) {
            Log::error('Send reply failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateConversation(Request $request, $id): JsonResponse
    {
        $tenantId = tenant('id');
        $conversation = Conversation::forTenant($tenantId)->findOrFail($id);

        $validated = $request->validate([
            'status' => 'nullable|in:active,archived,closed',
            'assigned_to' => 'nullable|string|max:255',
            'ai_active' => 'nullable|boolean',
            'human_taken_over' => 'nullable|boolean',
        ]);

        $conversation->update($validated);

        return response()->json(['message' => 'Conversation updated']);
    }

    public function contacts(Request $request): JsonResponse
    {
        $tenantId = tenant('id');
        $contacts = Contact::forTenant($tenantId)
            ->orderBy('created_at', 'desc')
            ->paginate(min((int) request('per_page', 25), 50));

        return response()->json([
            'contacts' => $contacts->items(),
            'meta' => [
                'current_page' => $contacts->currentPage(),
                'last_page' => $contacts->lastPage(),
                'total' => $contacts->total(),
            ],
        ]);
    }

    public function getAiSettings(): JsonResponse
    {
        $tenantId = tenant('id');
        $settings = \App\Models\AiSetting::forTenant($tenantId)->get();

        $defaults = [
            'auto_reply_enabled' => false,
            'suggested_replies_enabled' => true,
            'ai_tone' => 'Professional',
            'custom_instructions' => '',
        ];

        $grouped = [];
        foreach ($settings as $setting) {
            $grouped[$setting->channel_id] = $setting;
        }

        return response()->json([
            'settings' => $grouped,
            'defaults' => $defaults,
        ]);
    }

    public function updateAiSettings(Request $request): JsonResponse
    {
        $tenantId = tenant('id');

        $validated = $request->validate([
            'channel_id' => 'nullable|string',
            'auto_reply_enabled' => 'nullable|boolean',
            'suggested_replies_enabled' => 'nullable|boolean',
            'ai_tone' => 'nullable|string|max:255',
            'custom_instructions' => 'nullable|string',
            'business_rules' => 'nullable|array',
        ]);

        $setting = \App\Models\AiSetting::updateOrCreate(
            [
                'tenant_id' => $tenantId,
                'channel_id' => $validated['channel_id'] ?? null,
            ],
            $validated
        );

        return response()->json(['message' => 'AI settings updated', 'setting' => $setting]);
    }

    public function getAiReplyLogs(Request $request): JsonResponse
    {
        $tenantId = tenant('id');

        $query = AiReplyLog::forTenant($tenantId)->orderBy('created_at', 'desc');

        if ($request->conversation_id) {
            $query->where('conversation_id', $request->conversation_id);
        }

        if ($request->action) {
            $query->where('action', $request->action);
        }

        $logs = $query->paginate(min((int) request('per_page', 25), 50));

        return response()->json([
            'logs' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    public function getChannels(): JsonResponse
    {
        $tenantId = tenant('id');
        $channels = Channel::forTenant($tenantId)->where('connection_status', 'connected')->get()->map(function ($ch) {
            return [
                'id' => $ch->id,
                'channel_type' => $ch->channel_type,
                'integration_mode' => $ch->integration_mode,
                'provider_name' => $ch->provider_name,
                'page_name' => $ch->page_name,
                'display_phone_number' => $ch->display_phone_number,
                'instagram_username' => $ch->instagram_username,
                'connection_status' => $ch->connection_status,
            ];
        });

        return response()->json(['channels' => $channels]);
    }
}
