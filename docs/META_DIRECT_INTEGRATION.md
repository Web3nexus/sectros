# Meta Direct Integration Setup Guide

This guide covers the complete setup for Sectros's Meta Direct integration — WhatsApp Cloud API (via Embedded Signup), Facebook Messenger, and Instagram Messaging — all connected directly to Meta without third-party BSPs.

## Table of Contents

1. [Create a Meta App](#1-create-a-meta-app)
2. [Configure Meta App Settings](#2-configure-meta-app-settings)
3. [Configure the Admin Panel](#3-configure-the-admin-panel)
4. [Webhook Setup](#4-webhook-setup)
5. [WhatsApp Embedded Signup](#5-whatsapp-embedded-signup)
6. [Facebook Messenger Setup](#6-facebook-messenger-setup)
7. [Instagram Messaging Setup](#7-instagram-messaging-setup)
8. [App Review Process](#8-app-review-process)
9. [WhatsApp Coexistence (Optional)](#9-whatsapp-coexistence-optional)
10. [Testing & Troubleshooting](#10-testing--troubleshooting)

---

## 1. Create a Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/) and log in.
2. Click **My Apps** → **Create App**.
3. Choose **Business** as the app type.
4. Enter:
   - **App Name**: `Sectros Messaging` (or your preferred name)
   - **Contact Email**: Your admin email
   - **Business Account**: Link your Meta Business Manager
5. Click **Create App**.

## 2. Configure Meta App Settings

### 2.1 Basic Settings
- **App ID**: Copy from the dashboard — this is your `meta_app_id`.
- **App Secret**: Click **Show** and copy — this is your `meta_app_secret`.
- In the Meta App Dashboard → **Settings** → **Basic**:
  - **App Domains**: Add `sectrosweb.test` (dev) and `sectros.com` (production)
  - **Privacy Policy URL**: `https://sectros.com/privacy`
  - **Terms of Service URL**: `https://sectros.com/terms`
  - **Data Deletion Callback URL**: `https://sectros.com/api/data-deletion`
  - **Category**: Choose **Business and Pages**

### 2.2 OAuth Redirect URIs

Add these URLs in **Meta App Dashboard** → **Facebook Login** → **Settings** → **Valid OAuth Redirect URIs**:

```
https://sectrosweb.test/central-api/auth/direct/callback
https://sectrosweb.test/central-api/auth/whatsapp/callback
https://sectrosweb.test/api/auth/direct/callback
https://sectrosweb.test/api/auth/whatsapp/callback
```

Replace `sectrosweb.test` with your production domain when deploying.

### 2.3 Platform Settings

In **Meta App Dashboard** → **Settings** → **Advanced**:

- **Native or Desktop App?**: No
- **Server IP Whitelist**: Leave empty

## 3. Configure the Admin Panel

### 3.1 Navigate to Messaging Integration

In the super admin panel, go to **Messaging Integration** (or `/securegate/messaging-integration`).

### 3.2 Fill in Meta App Credentials

| Setting | Value | Source |
|---------|-------|--------|
| Meta App ID | `1234567890123456` | Meta App Dashboard |
| Meta App Secret | `abc123...` | Meta App Dashboard (click Show) |
| Meta Business ID | `987654321098765` | Meta Business Manager (optional) |
| OAuth Redirect URL | `https://sectrosweb.test/central-api/auth/direct/callback` | Custom URL |
| Webhook Verify Token | `sectros_secure_token` | Choose a random string |
| Webhook Callback URL | `/central-api/social/webhook` | Default (nginx proxies to backend) |
| Required Permissions | `pages_messaging,pages_manage_metadata,instagram_basic,instagram_manage_messages` | Default |

### 3.3 Privacy & Compliance URLs

| Setting | Example Value |
|---------|---------------|
| Privacy Policy URL | `https://example.com/privacy` |
| Terms of Service URL | `https://example.com/terms` |
| Data Deletion Callback URL | `https://example.com/data-deletion` |

### 3.4 App Review & Platform Status

Use these dropdowns to track your review progress. These are manual tracking fields:

| Status Field | Values |
|-------------|--------|
| App Review | `not_submitted`, `submitted`, `approved`, `rejected` |
| Facebook Messenger | `not_configured`, `submitted`, `approved`, `rejected` |
| Instagram Messaging | `not_configured`, `submitted`, `approved`, `rejected` |
| WhatsApp Cloud API | `not_configured`, `submitted`, `approved`, `rejected` |
| Embedded Signup | `not_configured`, `configured`, `approved` |
| Coexistence | `not_configured`, `pending_review`, `approved`, `rejected` |

**Click Save** after filling in all settings.

## 4. Webhook Setup

Webhooks are how Meta sends messages and events to your app.

### 4.1 Configure Webhooks in Meta App Dashboard

1. Go to **Meta App Dashboard** → **Webhooks**.
2. Click **Add Webhook** → Select **Page**, **Instagram**, and **WhatsApp Account**.
3. For each:
   - **Callback URL**: `https://sectros.com/central-api/social/webhook`
   - **Verify Token**: The same value you set in `meta_webhook_verify_token`
4. For **Page** webhook, subscribe to:
   - `messages`, `message_deliveries`, `messaging_optins`, `messaging_postbacks`, `message_reads`
5. For **Instagram** webhook, subscribe to:
   - `messages`, `message_deliveries`, `messaging_optins`, `messaging_postbacks`, `message_reads`
6. For **WhatsApp Account**, the subscription happens automatically via API when a tenant connects.

### 4.2 Verify Webhook Receipt

1. Go to the super admin **Messaging Integration** page.
2. Click **Refresh Health** to see all webhook subscriptions.
3. The **Webhook Errors** section shows any channels with failed webhook subscriptions.
4. Click the retry button to resubscribe failed channels.

## 5. WhatsApp Embedded Signup

WhatsApp Embedded Signup (also called SaaS Embedded Signup) allows each tenant to connect their own WhatsApp Business Account (WABA) through Meta's signup flow.

### 5.1 Enable Embedded Signup in Meta App Dashboard

1. **Meta App Dashboard** → **WhatsApp** → **Embedded Signup**.
2. Set **Redirect URI**: `https://sectrosweb.test/central-api/auth/whatsapp/callback`
3. Upload your **Privacy Policy URL** and **Terms of Service URL**.
4. Add required business verticals (e.g., "Food & Beverage", "Retail", "Services").
5. Click **Save**.

### 5.2 Tenant Connection Flow

1. Tenant user goes to **Workspace Channels** → **Connected Channels**.
2. Clicks **WhatsApp Business** card.
3. Meta's Embedded Signup popup opens with the Facebook login dialog.
4. Tenant logs in and selects their WhatsApp Business Account.
5. Meta redirects back to `https://sectrosweb.test/central-api/auth/whatsapp/callback`.
6. The backend automatically:
   - Exchanges the auth code for a long-lived token
   - Fetches all WABAs and phone numbers
   - Creates Channel records for each phone number
   - Subscribes each phone number to webhooks
7. The page refreshes and shows the new connected channel.

### 5.3 Manual Connection

For advanced users who already have a WABA setup, admins can allow manual entry of phone_number_id and waba_id (via the `POST /channels/whatsapp/connect` API).

## 6. Facebook Messenger Setup

### 6.1 Add Facebook Login Product

1. **Meta App Dashboard** → **Add Product** → **Facebook Login**.
2. **Settings** → **Valid OAuth Redirect URIs**:
   - `https://sectrosweb.test/central-api/auth/direct/callback`

### 6.2 Add Webhooks Product

1. **Meta App Dashboard** → **Add Product** → **Webhooks**.
2. Configure **Page** webhook as described in [Section 4](#4-webhook-setup).

### 6.3 Tenant Connection Flow

1. Tenant goes to **Workspace Channels**.
2. Clicks **Facebook Page**.
3. Facebook OAuth dialog opens — tenant selects the Page they want to connect.
4. Sectros requests `pages_messaging` and `pages_manage_metadata` permissions.
5. After authorization, Meta redirects to `/central-api/auth/direct/callback`.
6. Backend exchanges code for token, fetches connected Pages, and creates Channel records.
7. Each Page is subscribed to Messenger webhooks.

## 7. Instagram Messaging Setup

### 7.1 Requirements

- A Facebook Page connected to the Instagram Business/Creator account.
- Instagram Business account (not personal).
- The Facebook Page must be the one linked to the Instagram account.

### 7.2 Add Instagram Product

1. **Meta App Dashboard** → **Add Product** → **Instagram**.
2. **Settings** → **Valid OAuth Redirect URIs**:
   - `https://sectrosweb.test/central-api/auth/direct/callback`

### 7.3 Tenant Connection Flow

1. Tenant goes to **Workspace Channels**.
2. Clicks **Instagram**.
3. Facebook OAuth dialog opens — tenant selects the Facebook Page linked to their Instagram Business account.
4. Sectros requests `instagram_basic` and `instagram_manage_messages` permissions.
5. After authorization, Meta redirects to `/central-api/auth/direct/callback`.
6. Backend exchanges code, fetches connected Instagram accounts, and creates Channel records.
7. Each Instagram account is subscribed to messaging webhooks.

## 8. App Review Process

Before going live with real users, Meta requires App Review for certain permissions.

### 8.1 Permissions Requiring Review

| Permission | Purpose |
|------------|---------|
| `pages_messaging` | Send/receive Facebook Messenger messages |
| `pages_manage_metadata` | Manage Page metadata |
| `instagram_basic` | Read Instagram account data |
| `instagram_manage_messages` | Send/receive Instagram messages |
| `whatsapp_business_management` | Manage WhatsApp Business Accounts |
| `whatsapp_business_messaging` | Send/receive WhatsApp messages |

### 8.2 Preparing for Review

1. **For WhatsApp Embedded Signup**: Record a screen recording showing:
   - User clicking "Connect WhatsApp Business"
   - Meta Embedded Signup popup appearing
   - User completing signup with a test WABA
   - Successful connection showing in the dashboard
   - Sending and receiving a test message

2. **For Facebook/Instagram**: Record a screen recording showing:
   - User clicking "Connect Facebook Page" / "Connect Instagram"
   - OAuth dialog appearing
   - User selecting a Page/account
   - Successful connection in the dashboard
   - Sending and receiving a test message

3. **Provide Policies**:
   - Privacy Policy URL must be accessible from your app
   - Data Deletion instructions must be clear
   - WhatsApp Business Solution Terms must be displayed

4. **Test Users**: Create test users in **Meta App Dashboard** → **Roles** → **Test Users** for internal testing before review.

### 8.3 Submitting for Review

1. **Meta App Dashboard** → **App Review** → **Permissions and Features**.
2. Find each permission and click **Submit**.
3. Provide detailed instructions (step-by-step with screenshots).
4. Submit for review.
5. Review typically takes 3–14 business days.

## 9. WhatsApp Coexistence (Optional)

WhatsApp Coexistence allows migration from a third-party BSP to Meta Direct while keeping existing phone numbers active.

### 9.1 Enable Coexistence

1. Check **Enable WhatsApp Coexistence** in the admin panel.
2. Submit the Coexistence request in Meta App Dashboard.
3. Meta will review and approve Coexistence for your app.
4. Once approved, set **Coexistence Status** to `approved`.

### 9.2 Migration Process

1. Existing BSP-connected channels remain active.
2. Tenant initiates Meta Direct connection via Embedded Signup.
3. Meta handles the migration of the phone number from the BSP to direct.
4. Both connections remain active during the transition period.
5. After migration completes, disconnect the old BSP channel.

## 10. Testing & Troubleshooting

### 10.1 During Development

- All OAuth works without review for test users added in Meta App Dashboard.
- Test phone numbers (provided by Meta) work for WhatsApp testing.
- Use `sectrosweb.test` as your domain during development.

### 10.2 Common Issues

| Issue | Likely Cause | Solution |
|-------|-------------|----------|
| OAuth popup shows "Invalid redirect URI" | Redirect URI not added to Meta dashboard | Add the exact URI to Valid OAuth Redirect URIs |
| "Insufficient permissions" error | Missing permissions in Meta App | Add required products and permissions in Meta dashboard |
| Webhook verification fails | Verify token mismatch | Ensure the token in Meta dashboard matches `meta_webhook_verify_token` |
| Channel shows "Error" status | Token expired or webhook subscription failed | Click retry webhook in admin panel, or reconnect the channel |
| "App not reviewed" error | Permission not yet approved | Use test users during development, submit for review for production |
| WhatsApp Embedded Signup shows blank page | Embedded Signup not enabled | Enable Embedded Signup in Meta App Dashboard → WhatsApp → Embedded Signup |
| Token expired | Token not refreshed | OAuth tokens typically last 60 days; refresh via the Meta token exchange |

### 10.3 Health Dashboard

The super admin **Messaging Integration** page provides:
- **Integration Health**: Connected workspaces, WhatsApp numbers, Facebook Pages, Instagram accounts
- **Expiring Tokens**: Tokens expiring within 7 days (need re-authentication)
- **Webhook Errors**: Failed webhook subscriptions that need retry
- **Connected Workspaces List**: Which workspaces have which channels

### 10.4 Key API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/central-api/admin/messaging/settings` | GET/POST | Get/update integration settings |
| `/central-api/admin/messaging/health` | GET | Get integration health stats |
| `/central-api/admin/messaging/health/refresh` | POST | Refresh health data |
| `/central-api/admin/messaging/channels/{id}/retry-webhook` | POST | Retry webhook subscription |
| `/central-api/admin/messaging/legacy-providers` | GET | View legacy BSP providers (read-only) |
| `/tenant-api/channels/whatsapp/initiate` | POST | Start WhatsApp Embedded Signup |
| `/tenant-api/channels/whatsapp/connect` | POST | Manual WhatsApp connection |
| `/tenant-api/channels/facebook/initiate` | POST | Start Facebook OAuth |
| `/tenant-api/channels/instagram/initiate` | POST | Start Instagram OAuth |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Sectros Super Admin                    │
│  AdminMessagingIntegrationView.jsx                      │
│  - Meta App Settings                                    │
│  - App Review Status                                    │
│  - Integration Health Dashboard                         │
│  - Connected Workspaces                                 │
│  - Expiring Tokens / Webhook Errors                     │
└────────────────────┬────────────────────────────────────┘
                     │ /central-api/saas/messaging/*
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    AdminMessagingController              │
│  - getSettings() / updateSettings()                     │
│  - getHealth() / refreshHealth()                        │
│  - retryWebhook()                                       │
│  - getLegacyProviders()                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                     SaaS Settings                        │
│  (meta_app_id, meta_app_secret, meta_webhook_*, etc.)   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Workspace Tenant                      │
│  WorkspaceChannelsView.jsx                              │
│  - Connect WhatsApp (Embedded Signup)                   │
│  - Connect Facebook (OAuth)                             │
│  - Connect Instagram (OAuth)                            │
│  - View / Disconnect Channels                           │
└────────────────────┬────────────────────────────────────┘
                     │ /tenant-api/channels/*
                     ▼
┌─────────────────────────────────────────────────────────┐
│                WorkspaceChannelController                │
│  - initiateWhatsAppEmbeddedSignup()                     │
│  - initiateFacebookOAuth()                              │
│  - initiateInstagramOAuth()                             │
│  - handleOAuthCallback() (FB+IG)                        │
│  - handleWhatsAppCallback() (Embedded Signup)           │
│  - connectWhatsApp() (manual)                           │
│  - disconnect() / status()                              │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
┌─────────────────┐  ┌─────────────────────┐
│  Facebook Graph  │  │  Meta WhatsApp API  │
│  (FB/IG Msgs)   │  │  (WA Cloud API)     │
└─────────────────┘  └─────────────────────┘

```
