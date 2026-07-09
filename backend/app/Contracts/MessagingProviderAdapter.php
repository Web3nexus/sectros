<?php

namespace App\Contracts;

use App\Models\Channel;

interface MessagingProviderAdapter
{
    public function connectAccount(Channel $channel, array $config): array;
    public function handleWebhook(array $payload, array $headers): array;
    public function sendMessage(Channel $channel, string $recipientId, string $message, array $metadata = []): array;
    public function sendTemplate(Channel $channel, string $recipientId, array $templateData): array;
    public function getMessageStatus(Channel $channel, string $externalMessageId): array;
    public function disconnectAccount(Channel $channel): array;
    public function getProviderName(): string;
    public function getProviderKey(): string;
}
