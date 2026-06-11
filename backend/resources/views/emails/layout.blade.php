<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>{{ $subject ?? 'Notification' }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
            background-color: #f4f5f7;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 100% !important;
            -webkit-text-size-adjust: none;
        }

        .wrapper {
            background-color: #f4f5f7;
            padding: 40px 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .header {
            background-color: #1D1934;
            padding: 48px 40px;
            text-align: center;
        }

        .header img {
            max-height: 40px;
            margin-bottom: 24px;
        }

        .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            line-height: 1.3;
        }

        .content {
            padding: 48px 40px;
            color: #42526e;
            font-size: 16px;
            line-height: 1.6;
        }

        .content h2 {
            color: #172b4d;
            font-size: 20px;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 16px;
        }

        .footer {
            padding: 40px 20px;
            text-align: center;
            color: #6b778c;
            font-size: 14px;
        }

        .footer .social-links {
            margin-bottom: 24px;
        }

        .footer .social-links a {
            display: inline-block;
            margin: 0 12px;
            text-decoration: none;
        }

        .footer .social-links img {
            width: 24px;
            height: 24px;
            opacity: 0.8;
        }

        .footer .social-links img:hover {
            opacity: 1;
        }

        .footer p {
            margin: 8px 0;
        }

        .button {
            display: inline-block;
            background-color: #0052cc;
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 24px;
        }

        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                border-radius: 0;
            }
            .header, .content {
                padding: 32px 24px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                @if($logo)
                    <img src="{{ $logo }}" alt="{{ $platform_name }}">
                @else
                    <div style="color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 24px;">{{ $platform_name }}</div>
                @endif
                <h1>{{ $subject }}</h1>
            </div>
            
            <div class="content">
                @yield('content')
            </div>
        </div>

        <div class="footer">
            <div class="social-links">
                @if($facebook_url)
                    <a href="{{ $facebook_url }}"><img src="https://img.icons8.com/ios-filled/50/6b778c/facebook-new.png" alt="Facebook"></a>
                @endif
                @if($twitter_url)
                    <a href="{{ $twitter_url }}"><img src="https://img.icons8.com/ios-filled/50/6b778c/twitter.png" alt="Twitter"></a>
                @endif
                @if($instagram_url)
                    <a href="{{ $instagram_url }}"><img src="https://img.icons8.com/ios-filled/50/6b778c/instagram-new.png" alt="Instagram"></a>
                @endif
            </div>
            <p>&copy; {{ date('Y') }} {{ $platform_name }}. All rights reserved.</p>
            <p>You are receiving this because you are a registered user of {{ $platform_name }}.</p>
        </div>
    </div>
</body>
</html>
