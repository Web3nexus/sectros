# Meta App Review & Tech Provider Setup

## Required Scopes

The app requests these permissions during WhatsApp Embedded Signup:

| Scope | Purpose |
|-------|---------|
| `whatsapp_business_management` | Read & manage WhatsApp Business Accounts |
| `whatsapp_business_messaging` | Send/receive messages via WhatsApp Cloud API |

These scopes require Meta App Review before going live with real users.

## Tech Provider Setup

For SaaS Embedded Signup (each tenant connects their own WABA):

1. **Meta Business Settings** → **Business Assets** → **System Users**
   - Create a System User with `whatsapp_business_management` permission
   - Generate a long-lived token (never expires with proper permissions)
   - Store this as `meta_system_token` in the `saa_s_settings` table

2. **Meta App Dashboard** → **WhatsApp** → **Embedded Signup**
   - Enable Embedded Signup
   - Set your redirect URI: `https://sectros.com/central-api/whatsapp/callback`
   - Upload Privacy Policy URL
   - Upload Terms of Service URL
   - Add required business verticals

3. **Meta App Dashboard** → **App Review** → **Permissions and Features**
   - Submit `whatsapp_business_management` for review
   - Submit `whatsapp_business_messaging` for review
   - Provide detailed instructions: screen recording showing the entire signup flow
   - Screenshots showing: user clicking "Connect WhatsApp Business", Meta signup popup, successful connection

## Webhook Configuration

1. **Meta App Dashboard** → **WhatsApp** → **Configuration**
   - Callback URL: `https://sectros.com/central-api/social/webhook`
   - Verify token: Set via `social_verify_token` in `saa_s_settings`
   - Webhook fields: `messages`, `message_deliveries`, `message_reads`

2. **App Dashboard** → **Webhooks** → **WhatsApp Account**
   - Subscribe to: `messages`, `message_deliveries`, `message_reads`

## Privacy & Terms URLs

Before app review, set these in Meta App Dashboard:

- **Privacy Policy URL**: `https://sectros.com/privacy` (or your actual privacy page)
- **Terms of Service URL**: `https://sectros.com/terms` (or your actual TOS page)
- **User Data Deletion URL**: `https://sectros.com/data-deletion` (callback or web form)

## Required Meta Policies

1. **WhatsApp Business Solution Terms** — Must display WhatsApp branding guidelines
2. **Commerce Policy** — No prohibited content
3. **Data Privacy** — Must inform users about WhatsApp data handling

## Testing Before Review

During development, use Meta's test mode:

1. Add test users in **Meta App Dashboard** → **Roles** → **Test Users**
2. Test users can authorize the app without review
3. Use our existing developer/test WhatsApp number for initial testing
4. The current `SocialiteController` with `?tenant_id=` works for test users
