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
                'content'   => "<p class='lead'>Hello {name},</p><p>Your security verification code is:</p><div class='center'><span class='code'>{code}</span></div><p class='note'>This code will expire in 10 minutes. If you did not request this, please secure your account immediately.</p>",
                'variables' => ['name', 'code'],
            ],
            [
                'slug'      => 'welcome_email',
                'subject'   => 'Welcome to {platform_name}!',
                'content'   => "<p class='lead'>Hi {name},</p><p>Welcome to <strong>{platform_name}</strong>! Your account has been successfully created. You can now access your dashboard and start managing your business.</p><div class='center'><span class='badge'>Account Active</span></div><p class='note'>If you have any questions, just reply to this email.</p>",
                'variables' => ['name', 'platform_name'],
            ],
            [
                'slug'      => 'password_reset',
                'subject'   => 'Reset Your Password',
                'content'   => "<p class='lead'>Hello {name},</p><p>You are receiving this email because we received a password reset request for your account.</p><div class='center'><a class='btn' href='{reset_link}'>Reset Password</a></div><p class='note'>If the button does not work, copy and paste this link into your browser:<br><span style='font-size:13px;color:#6b7280'>{reset_link}</span></p><p class='note'>If you did not request a password reset, no further action is required.</p>",
                'variables' => ['name', 'reset_link'],
            ],
            [
                'slug'      => 'new_reservation',
                'subject'   => 'New Booking – {customer_name}',
                'content'   => "<p class='lead'>You have a new booking request at <strong>{business_name}</strong>.</p><div class='badge'>{source_label}</div><p class='note' style='margin-top:10px'>{added_by}</p><div class='card'><div class='card-title'>Booking Details</div><div class='row'><span class='label'>Reference</span><span class='value'>#{reservation_id}</span></div><div class='row'><span class='label'>Guest</span><span class='value'>{customer_name}</span></div><div class='row'><span class='label'>Date</span><span class='value'>{reservation_date}</span></div><div class='row'><span class='label'>Time</span><span class='value'>{reservation_time}</span></div><div class='row'><span class='label'>Guests</span><span class='value'>{guest_count}</span></div>{customer_phone_row}</div><p class='note'>Please check your reservation hub to confirm or decline this booking.</p>",
                'variables' => ['reservation_id', 'customer_name', 'reservation_date', 'reservation_time', 'guest_count', 'business_name', 'source', 'source_label', 'added_by', 'customer_phone'],
            ],
            [
                'slug'      => 'reservation_request_confirmation',
                'subject'   => 'Confirm your booking – {business_name}',
                'content'   => "<p class='lead'>Hello {customer_name},</p><p>Thanks for booking at <strong>{business_name}</strong>. Please confirm your request to finalize your reservation.</p><div class='card'><div class='card-title'>Your Booking</div><div class='row'><span class='label'>Date</span><span class='value'>{reservation_date}</span></div><div class='row'><span class='label'>Time</span><span class='value'>{reservation_time}</span></div><div class='row'><span class='label'>Guests</span><span class='value'>{guest_count}</span></div></div><div class='center'><a class='btn' href='{confirm_link}'>Confirm My Booking</a></div><p class='note'>Or present this code when you arrive:</p><div class='center'><span class='code'>{confirmation_code}</span></div><p class='note'>Your reservation is final once confirmed. If you did not arrange this booking, please contact {business_name}.</p>",
                'variables' => ['customer_name', 'business_name', 'reservation_date', 'reservation_time', 'guest_count', 'confirm_link', 'confirmation_code'],
            ],
            [
                'slug'      => 'reservation_arranged',
                'subject'   => 'A booking has been arranged for you – {business_name}',
                'content'   => "<p class='lead'>Hello {customer_name},</p><p><strong>{business_name}</strong> has arranged a booking on your behalf. Please confirm it using the options below.</p><div class='card'><div class='card-title'>Your Booking</div><div class='row'><span class='label'>Date</span><span class='value'>{reservation_date}</span></div><div class='row'><span class='label'>Time</span><span class='value'>{reservation_time}</span></div><div class='row'><span class='label'>Guests</span><span class='value'>{guest_count}</span></div></div><div class='center'><a class='btn' href='{confirm_link}'>Confirm My Booking</a></div><p class='note'>Or present this code when you arrive:</p><div class='center'><span class='code'>{confirmation_code}</span></div><p class='note'>If you did not arrange this booking, please contact {business_name}.</p>",
                'variables' => ['customer_name', 'business_name', 'reservation_date', 'reservation_time', 'guest_count', 'confirm_link', 'confirmation_code'],
            ],
            [
                'slug'      => 'reservation_confirmed',
                'subject'   => 'Your booking is confirmed – {business_name}',
                'content'   => "<p class='lead'>Hello {customer_name},</p><p>Great news! Your booking at <strong>{business_name}</strong> has been confirmed.</p><div class='card'><div class='card-title'>Confirmed Booking</div><div class='row'><span class='label'>Date</span><span class='value'>{reservation_date}</span></div><div class='row'><span class='label'>Time</span><span class='value'>{reservation_time}</span></div><div class='row'><span class='label'>Guests</span><span class='value'>{guest_count}</span></div></div>{code_block}<p class='note'>We look forward to welcoming you. If you need to make changes, please contact {business_name}.</p>",
                'variables' => ['customer_name', 'business_name', 'reservation_date', 'reservation_time', 'guest_count', 'confirmation_code'],
            ],
            [
                'slug'      => 'new_order',
                'subject'   => 'New Order Received! – {order_number}',
                'content'   => "<p class='lead'>A new order has been received at <strong>{business_name}</strong>.</p><div class='card'><div class='card-title'>Order Summary</div><div class='row'><span class='label'>Order</span><span class='value'>#{order_number}</span></div><div class='row'><span class='label'>Items</span><span class='value'>{items_count}</span></div><div class='row'><span class='label'>Total</span><span class='value'>{total_amount}</span></div><div class='row'><span class='label'>Source</span><span class='value'>{source}</span></div></div><p class='note'>Please prepare the order for processing.</p>",
                'variables' => ['order_number', 'total_amount', 'business_name', 'items_count', 'source'],
            ],
            [
                'slug'      => 'staff_registration',
                'subject'   => 'Welcome to the Team, {name}',
                'content'   => "<p class='lead'>Welcome aboard, {name}!</p><p>Your staff account for <strong>{business_name}</strong> at <strong>{platform_name}</strong> is ready.</p><div class='card'><div class='card-title'>Your Login Details</div><div class='row'><span class='label'>Email</span><span class='value'>{email}</span></div><div class='row'><span class='label'>Temporary Password</span><span class='value'>{password}</span></div></div><div class='center'><a class='btn' href='{login_url}'>Open Dashboard</a></div><p class='note'>After logging in, please change your password from the Profile section.</p>",
                'variables' => ['name', 'business_name', 'platform_name', 'login_url', 'email', 'password'],
            ],
            [
                'slug'      => 'new_message',
                'subject'   => 'New Message from {customer_name}',
                'content'   => "<p class='lead'>You have a new message via <span class='badge-blue'>{source}</span>:</p><div class='card'><p style='margin:0'>“{message_preview}”</p></div><p class='note'>Please reply from your communication hub.</p>",
                'variables' => ['customer_name', 'source', 'message_preview'],
            ],
            [
                'slug'      => 'high_load_alert',
                'subject'   => 'Critical System Alert: High Infrastructure Load',
                'content'   => "<p class='lead'>Warning: <strong>{node_name}</strong> is experiencing critical load levels.</p><div class='card'><div class='card-title'>Resource Usage</div><div class='row'><span class='label'>CPU Usage</span><span class='value'>{cpu_percent}%</span></div><div class='row'><span class='label'>Memory Usage</span><span class='value'>{mem_percent}%</span></div></div><p class='note'>Please check server logs immediately.</p>",
                'variables' => ['node_name', 'cpu_percent', 'mem_percent'],
            ],
            [
                'slug'      => 'payment_success',
                'subject'   => 'Subscription Activated – {business_name}',
                'content'   => "<p class='lead'>Success!</p><p>Your payment for the <strong>{plan_name}</strong> plan has been processed.</p><div class='card'><div class='card-title'>Payment Details</div><div class='row'><span class='label'>Invoice ID</span><span class='value'>{invoice_id}</span></div><div class='row'><span class='label'>Amount</span><span class='value'>{amount}</span></div></div><p class='note'>Thank you for choosing <strong>{platform_name}</strong>!</p>",
                'variables' => ['business_name', 'plan_name', 'invoice_id', 'amount', 'platform_name'],
            ],
            [
                'slug'      => 'trial_started',
                'subject'   => 'Welcome to {platform_name} – Your {trial_days}-Day Trial Has Begun!',
                'content'   => "<p class='lead'>Hi {name},</p><p>Welcome to <strong>{platform_name}</strong>! Your <strong>{trial_days}-day</strong> free trial is now active.</p><h2>Here's what you can do during your trial</h2><div class='card' style='padding:12px 24px'><p style='margin:8px 0'>• Set up your business profile and floor plan</p><p style='margin:8px 0'>• Explore the full feature set with no restrictions</p><p style='margin:8px 0'>• Invite your team members</p></div><p>Your trial ends on <strong>{trial_end_date}</strong>. No credit card required.</p><p class='note'>If you have any questions, just reply to this email.</p><p>Best regards,<br><strong>The {platform_name} Team</strong></p>",
                'variables' => ['name', 'platform_name', 'trial_days', 'trial_end_date'],
            ],
            [
                'slug'      => 'trial_midpoint',
                'subject'   => 'Halfway Through Your {platform_name} Trial – How Is It Going?',
                'content'   => "<p class='lead'>Hi {name},</p><p>You're halfway through your <strong>{trial_days}-day</strong> free trial of {platform_name}! You have <strong>{days_remaining} days</strong> remaining.</p><h2>Things you can try if you haven't already</h2><div class='card' style='padding:12px 24px'><p style='margin:8px 0'>• Set up online reservations and share your booking link</p><p style='margin:8px 0'>• Configure your floor plan and table layout</p><p style='margin:8px 0'>• Explore our analytics dashboard</p></div><p>When you're ready to upgrade, choose a plan that fits your needs and unlock the full power of {platform_name}.</p><p class='note'>Questions? We're here to help.</p><p>Best regards,<br><strong>The {platform_name} Team</strong></p>",
                'variables' => ['name', 'platform_name', 'trial_days', 'days_remaining'],
            ],
            [
                'slug'      => 'email_verification',
                'subject'   => 'Verify Your Email – {platform_name}',
                'content'   => "<p class='lead'>Welcome to {platform_name}, {name}!</p><p>Thank you for registering. Please verify your email address by clicking the button below:</p><div class='center'><a class='btn' href='{verify_url}'>Verify Email Address</a></div><p class='note'>Or copy and paste this link in your browser:<br><span style='font-size:13px;color:#6b7280'>{verify_url}</span></p><p class='note'>If you did not create this account, please ignore this email.</p>",
                'variables' => ['name', 'platform_name', 'verify_url'],
            ],
            [
                'slug'      => 'email_verified',
                'subject'   => 'Welcome to {platform_name} – Getting Started Guide',
                'content'   => "<p class='lead'>Welcome to {platform_name}, {name}!</p><p>Your email has been verified successfully. Here's what to do next:</p><div class='card' style='padding:12px 24px'><p style='margin:8px 0'><strong>Log in</strong> to your dashboard and complete your business profile</p><p style='margin:8px 0'><strong>Set up your menu</strong> (if applicable to your business type)</p><p style='margin:8px 0'><strong>Configure your staff</strong> and assign roles</p><p style='margin:8px 0'><strong>Customize your website</strong> using the built-in builder</p><p style='margin:8px 0'><strong>Connect your domain</strong> for a professional online presence</p></div><p>If you need any help, contact our support team at <a href='mailto:{support_email}' style='color:#10b981;font-weight:600'>{support_email}</a>.</p><p>Welcome aboard!</p>",
                'variables' => ['name', 'platform_name', 'support_email'],
            ],
            [
                'slug'      => 'trial_ending',
                'subject'   => 'Last Day of Your {platform_name} Trial – Don\'t Miss Out!',
                'content'   => "<p class='lead'>Hi {name},</p><p>This is your last day to try {platform_name} for free! Your trial ends today (<strong>{trial_end_date}</strong>).</p><p>Don't lose access to your venue's data and settings. Upgrade now to keep everything running smoothly.</p><h2>Here's what you get with a paid plan</h2><div class='card' style='padding:12px 24px'><p style='margin:8px 0'>• Unlimited reservations</p><p style='margin:8px 0'>• Staff management</p><p style='margin:8px 0'>• Advanced analytics and reporting</p><p style='margin:8px 0'>• Priority support</p></div><div class='center'><a class='btn' href='{pricing_url}'>Subscribe Now</a></div><p class='note'>If you have any questions or need help choosing a plan, just reply to this email.</p><p>Thank you for trying {platform_name}!</p><p><strong>The {platform_name} Team</strong></p>",
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