<?php

namespace App\Contracts;

interface VoiceProviderInterface
{
    public function testConnection(): array;
    public function createAgent(array $config): array;
    public function updateAgent(string $agentId, array $config): array;
    public function deactivateAgent(string $agentId): array;
    public function createTestCall(string $agentId, string $phoneNumber): array;
    public function parseWebhookPayload(array $payload): array;
    public function getProviderName(): string;
    public function getProviderKey(): string;
    public function getVoices(): array;
}
