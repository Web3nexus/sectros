<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class SystemMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public $subjectStr;
    public $contentHtml;

    public function __construct(string $subject, string $content, array $variables = [])
    {
        $this->subjectStr = $this->replaceVariables($subject, $variables);
        $this->contentHtml = $this->replaceVariables($content, $variables);
    }

    private function replaceVariables(string $text, array $variables): string
    {
        foreach ($variables as $key => $value) {
            $text = str_replace('{' . $key . '}', $value, $text);
        }
        return $text;
    }

    public function build()
    {
        $platformName = \App\Models\SaaSSetting::get('platform_name') ?? config('app.name');
        $fromAddress = \App\Models\SaaSSetting::get('from_address') ?? ('noreply@' . (\App\Models\SaaSSetting::get('central_domain') ?? 'sectros.com'));
        $logo = \App\Models\SaaSSetting::get('platform_logo_url');
        
        // Ensure logo is absolute URL if it exists
        if ($logo && !str_starts_with($logo, 'http')) {
            $logo = config('app.url') . '/' . ltrim($logo, '/');
        }

        return $this->from($fromAddress, $platformName)
                    ->subject($this->subjectStr)
                    ->view('emails.system', [
                        'subject' => $this->subjectStr,
                        'content' => $this->contentHtml,
                        'platform_name' => $platformName,
                        'logo' => $logo,
                        'facebook_url' => \App\Models\SaaSSetting::get('facebook_url'),
                        'twitter_url' => \App\Models\SaaSSetting::get('twitter_url'),
                        'instagram_url' => \App\Models\SaaSSetting::get('instagram_url'),
                        'youtube_url' => \App\Models\SaaSSetting::get('youtube_url'),
                        'tiktok_url' => \App\Models\SaaSSetting::get('tiktok_url'),
                    ])
                    ->text('emails.system_text', [
                        'subject' => $this->subjectStr,
                        'content' => $this->contentHtml,
                        'platform_name' => $platformName,
                    ]);
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
