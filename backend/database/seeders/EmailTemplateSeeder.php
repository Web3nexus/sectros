<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'slug'      => '2fa_code',
                'subject'   => 'Your Security Code',
                'content'   => "Hello {name},\n\nYour security verification code is: {code}\n\nThis code will expire in 10 minutes. If you did not request this, please secure your account immediately.",
                'variables' => ['name', 'code'],
            ],
            [
                'slug'      => 'welcome_email',
                'subject'   => 'Welcome to {platform_name}!',
                'content'   => "Hi {name},\n\nWelcome to {platform_name}! Your account has been successfully created. You can now access your dashboard and start managing your business.",
                'variables' => ['name', 'platform_name'],
            ],
            [
                'slug'      => 'password_reset',
                'subject'   => 'Reset Your Password',
                'content'   => "Hello {name},\n\nYou are receiving this email because we received a password reset request for your account.\n\nYour reset link: {reset_link}\n\nIf you did not request a password reset, no further action is required.",
                'variables' => ['name', 'reset_link'],
            ],
            [
                'slug'      => 'new_reservation',
                'subject'   => 'New Reservation Alert – {reservation_id}',
                'content'   => "Notification: You have a new booking from {customer_name}.\n\nDate: {reservation_date}\nTime: {reservation_time}\nGuests: {guest_count}\n\nPlease check your reservation hub for details.",
                'variables' => ['reservation_id', 'customer_name', 'reservation_date', 'reservation_time', 'guest_count'],
            ],
            [
                'slug'      => 'new_order',
                'subject'   => 'New Order Received! – {order_number}',
                'content'   => "System Node: A new order of {total_amount} has been logged for {business_name}.\n\nItems: {items_count}\nSource: {source}\n\nPlease prepare the order for processing.",
                'variables' => ['order_number', 'total_amount', 'business_name', 'items_count', 'source'],
            ],
            [
                'slug'      => 'staff_registration',
                'subject'   => 'Welcome to the Team, {name}',
                'content'   => "Welcome aboard!\n\nYour staff account for {business_name} at {platform_name} is ready.\n\nLogin URL: {login_url}\nYour email: {email}\nTemporary password: {password}\n\nAfter logging in, please change your password from the Profile section.",
                'variables' => ['name', 'business_name', 'platform_name', 'login_url', 'email', 'password'],
            ],
            [
                'slug'      => 'new_message',
                'subject'   => 'New Message from {customer_name}',
                'content'   => "You have a new message via {source}:\n\n\"{message_preview}\"\n\nPlease reply from your communication hub.",
                'variables' => ['customer_name', 'source', 'message_preview'],
            ],
            [
                'slug'      => 'high_load_alert',
                'subject'   => 'Critical System Alert: High Infrastructure Load',
                'content'   => "Warning: {node_name} is experiencing critical load levels.\n\nCPU Usage: {cpu_percent}%\nMemory Usage: {mem_percent}%\n\nPlease check server logs immediately.",
                'variables' => ['node_name', 'cpu_percent', 'mem_percent'],
            ],
            [
                'slug'      => 'payment_success',
                'subject'   => 'Subscription Activated – {business_name}',
                'content'   => "Success! Your payment for the {plan_name} plan has been processed.\n\nInvoice ID: {invoice_id}\nAmount: {amount}\n\nThank you for choosing {platform_name}!",
                'variables' => ['business_name', 'plan_name', 'invoice_id', 'amount', 'platform_name'],
            ],
            [
                'slug'      => 'trial_started',
                'subject'   => 'Welcome to {platform_name} – Your {trial_days}-Day Trial Has Begun!',
                'content'   => "Hi {name},\n\nWelcome to {platform_name}! Your {trial_days}-day free trial is now active.\n\nHere's what you can do during your trial:\n• Set up your business profile and floor plan\n• Explore the full feature set with no restrictions\n• Invite your team members\n\nYour trial ends on {trial_end_date}. No credit card required.\n\nIf you have any questions, just reply to this email.\n\nCheers,\nThe {platform_name} Team",
                'variables' => ['name', 'platform_name', 'trial_days', 'trial_end_date'],
            ],
            [
                'slug'      => 'trial_midpoint',
                'subject'   => 'Halfway Through Your {platform_name} Trial – How Is It Going?',
                'content'   => "Hi {name},\n\nYou're halfway through your {trial_days}-day free trial of {platform_name}! You have {days_remaining} days remaining.\n\nHere are a few things you can try if you haven't already:\n• Set up online reservations and share your booking link\n• Configure your floor plan and table layout\n• Explore our analytics dashboard\n\nWhen you're ready to upgrade, choose a plan that fits your needs and unlock the full power of {platform_name}.\n\nQuestions? We're here to help.\n\nBest regards,\nThe {platform_name} Team",
                'variables' => ['name', 'platform_name', 'trial_days', 'days_remaining'],
            ],
            [
                'slug'      => 'email_verification',
                'subject'   => 'Verify Your Email – {platform_name}',
                'content'   => "<h2>Welcome to {platform_name}, {name}!</h2><p>Thank you for registering with {platform_name}. Please verify your email address by clicking the button below:</p><p style='text-align:center'><a href='{verify_url}' style='display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold'>Verify Email Address</a></p><p>Or copy and paste this link in your browser:<br>{verify_url}</p><p>If you did not create this account, please ignore this email.</p>",
                'variables' => ['name', 'platform_name', 'verify_url'],
            ],
            [
                'slug'      => 'email_verified',
                'subject'   => 'Welcome to {platform_name} – Getting Started Guide',
                'content'   => "<h2>Welcome to {platform_name}, {name}!</h2><p>Your email has been verified successfully. Here's what to do next:</p><ul><li><strong>Log in</strong> to your dashboard and complete your business profile</li><li><strong>Set up your menu</strong> (if applicable to your business type)</li><li><strong>Configure your staff</strong> and assign roles</li><li><strong>Customize your website</strong> using the built-in builder</li><li><strong>Connect your domain</strong> for a professional online presence</li></ul><p>If you need any help, contact our support team at <a href='mailto:{support_email}'>{support_email}</a>.</p><p>Welcome aboard!</p>",
                'variables' => ['name', 'platform_name', 'support_email'],
            ],
            [
                'slug'      => 'trial_ending',
                'subject'   => 'Last Day of Your {platform_name} Trial – Don\'t Miss Out!',
                'content'   => "Hi {name},\n\nThis is your last day to try {platform_name} for free! Your trial ends today ({trial_end_date}).\n\nDon't lose access to your venue's data and settings. Upgrade now to keep everything running smoothly.\n\nHere's what you get with a paid plan:\n• Unlimited reservations\n• Staff management\n• Advanced analytics and reporting\n• Priority support\n\n👉 Subscribe now: {pricing_url}\n\nIf you have any questions or need help choosing a plan, just reply to this email.\n\nThank you for trying {platform_name}!\n\nThe {platform_name} Team",
                'variables' => ['name', 'platform_name', 'trial_end_date', 'pricing_url'],
            ]
        ];

        foreach ($templates as $data) {
            \App\Models\EmailTemplate::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }
}
