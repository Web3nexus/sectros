<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>{{ $subject ?? 'Notification' }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        body {
            background-color: #eef1f6;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 100% !important;
            -webkit-text-size-adjust: none;
            color: #374151;
        }

        .wrapper {
            background-color: #eef1f6;
            padding: 40px 16px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
            border: 1px solid #e5e7eb;
        }

        .accent-bar {
            height: 6px;
            background: linear-gradient(90deg, #10b981 0%, #34d399 45%, #0071e3 100%);
        }

        .header {
            background-color: #ffffff;
            padding: 40px 40px 24px;
            text-align: center;
            border-bottom: 1px solid #f1f5f9;
        }

        .header .brand {
            margin-bottom: 18px;
        }

        .header .brand img {
            max-height: 44px;
            max-width: 220px;
            display: block;
            margin: 0 auto;
        }

        .header .brand-name {
            color: #10b981;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            margin-bottom: 12px;
        }

        .header h1 {
            color: #0f172a;
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            line-height: 1.35;
            letter-spacing: -0.01em;
        }

        .header .subtitle {
            color: #6b7280;
            font-size: 14px;
            margin-top: 10px;
            line-height: 1.5;
        }

        .content {
            padding: 36px 40px 40px;
            color: #374151;
            font-size: 15px;
            line-height: 1.65;
        }

        .content h2 {
            color: #0f172a;
            font-size: 18px;
            font-weight: 800;
            margin: 0 0 6px;
            letter-spacing: -0.01em;
        }

        .content p {
            margin: 0 0 16px;
        }

        .content strong {
            color: #0f172a;
        }

        /* Helper components used by template content */
        .lead {
            font-size: 15px;
            color: #374151;
            margin: 0 0 24px;
        }

        .card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px 24px;
            margin: 0 0 24px;
        }

        .card-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #10b981;
            margin: 0 0 14px;
        }

        .row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 6px 0;
            border-bottom: 1px dashed #e2e8f0;
        }

        .row:last-child {
            border-bottom: none;
        }

        .row .label {
            color: #6b7280;
            font-size: 13px;
            font-weight: 500;
        }

        .row .value {
            color: #0f172a;
            font-size: 14px;
            font-weight: 700;
            text-align: right;
        }

        .btn {
            display: inline-block;
            background-color: #10b981;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 30px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            letter-spacing: 0.01em;
            margin: 8px 0 4px;
        }

        .btn-secondary {
            display: inline-block;
            background-color: #f1f5f9;
            color: #0f172a !important;
            text-decoration: none;
            padding: 13px 28px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            margin: 8px 0 4px;
        }

        .code {
            display: inline-block;
            background-color: #ecfdf5;
            border: 1px dashed #10b981;
            color: #047857;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.14em;
            padding: 10px 18px;
            border-radius: 8px;
            margin: 10px 0;
        }

        .badge {
            display: inline-block;
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            color: #047857;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 999px;
        }

        .badge-blue {
            display: inline-block;
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #1d4ed8;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 999px;
        }

        .note {
            font-size: 13px;
            color: #6b7280;
            margin: 4px 0 20px;
        }

        .divider {
            height: 1px;
            background-color: #f1f5f9;
            margin: 24px 0;
        }

        .center {
            text-align: center;
        }

        .footer {
            padding: 32px 20px 40px;
            text-align: center;
            color: #9ca3af;
            font-size: 13px;
            background-color: #0f172a;
        }

        .footer .social-links {
            margin-bottom: 20px;
        }

        .footer .social-links a {
            display: inline-block;
            margin: 0 8px;
            text-decoration: none;
            background-color: #1f2937;
            border-radius: 50%;
            width: 34px;
            height: 34px;
            line-height: 34px;
            text-align: center;
        }

        .footer .social-links img {
            width: 16px;
            height: 16px;
            vertical-align: middle;
            opacity: 0.9;
        }

        .footer p {
            margin: 6px 0;
        }

        .footer .footer-brand {
            color: #34d399;
            font-weight: 800;
            letter-spacing: 0.08em;
            font-size: 14px;
        }

        @media only screen and (max-width: 600px) {
            .wrapper {
                padding: 16px 0;
            }
            .container {
                width: 100% !important;
                border-radius: 0;
                border: none;
            }
            .header, .content {
                padding-left: 24px;
                padding-right: 24px;
            }
            .row {
                display: block;
            }
            .row .value {
                text-align: left;
                margin-top: 2px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="accent-bar"></div>
            <div class="header">
                <div class="brand">
                    @if($email_logo)
                        <img src="{{ $email_logo }}" alt="{{ $platform_name }}">
                    @elseif($logo)
                        <img src="{{ $logo }}" alt="{{ $platform_name }}">
                    @else
                        <div class="brand-name">{{ $platform_name }}</div>
                    @endif
                </div>
                <h1>{{ $subject }}</h1>
            </div>

            <div class="content">
                @yield('content')
            </div>
        </div>

        <div class="footer">
            <div class="social-links">
                @if($facebook_url)
                    <a href="{{ $facebook_url }}"><img src="https://img.icons8.com/ios-filled/50/34d399/facebook-new.png" alt="Facebook"></a>
                @endif
                @if($twitter_url)
                    <a href="{{ $twitter_url }}"><img src="https://img.icons8.com/ios-filled/50/34d399/twitter.png" alt="Twitter"></a>
                @endif
                @if($instagram_url)
                    <a href="{{ $instagram_url }}"><img src="https://img.icons8.com/ios-filled/50/34d399/instagram-new.png" alt="Instagram"></a>
                @endif
                @if(isset($youtube_url) && $youtube_url)
                    <a href="{{ $youtube_url }}"><img src="https://img.icons8.com/ios-filled/50/34d399/youtube-play.png" alt="YouTube"></a>
                @endif
                @if(isset($tiktok_url) && $tiktok_url)
                    <a href="{{ $tiktok_url }}"><img src="https://img.icons8.com/ios-filled/50/34d399/tiktok.png" alt="TikTok"></a>
                @endif
            </div>
            <div class="footer-brand">{{ $platform_name }}</div>
            <p>&copy; {{ date('Y') }} {{ $platform_name }}. All rights reserved.</p>
            <p>You are receiving this because you are a registered user of {{ $platform_name }}.</p>
        </div>
    </div>
</body>
</html>