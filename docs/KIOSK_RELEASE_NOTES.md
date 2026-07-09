# Self-Service Kiosk Mode

## What It Is
Kiosk Mode turns any iPad or tablet into a self-service ordering kiosk for your restaurant or cafe. Customers walk up, select a dining option (Dine In / Takeaway), pick their table, browse the menu with addons, and submit their order — without any staff intervention.

## Who Can Use It
Available on **Pro** and **Enterprise** plans. Free plans can upgrade to unlock.

## How to Enable

### Via Admin Panel
1. Go to **Tenants** → select your tenant → **Module Access Control**
2. Toggle **Self-Service Kiosk** on
3. Save

### Direct URL
Once enabled, your kiosk is live at:
```
https://sectrosweb.test/kiosk/{tenantId}
```

Replace `{tenantId}` with your tenant ID (found in the admin panel or your subdomain prefix).

## Customer Experience Flow

1. **Splash Screen** — Tap "Start Ordering" to begin
2. **Dining Option** — Choose Dine In or Takeaway
3. **Table Selection** (Dine In only) — Pick an available table
4. **Menu Browsing** — Browse categories, items, and addons
   - Items show name, description (first ~80 chars), and price
   - Tap to expand and see addon options
5. **Cart & Checkout** — Review items, adjust quantities, enter your name
6. **Confirmation** — Order is submitted; kitchen receives it immediately

The kiosk automatically returns to the splash screen after 60 seconds of inactivity.

## Things to Know
- **Touch-optimized** — all buttons are 48px+ with generous spacing
- **No keyboard needed** — customer name entry uses an on-screen numeric pad
- **Prices are server-validated** — addon prices are fetched from your menu, never from the client
- **Orders appear instantly** — they use the same order system as staff-placed orders
- **Table availability is protected** — no double-booking even under high traffic
- **No browser chrome** — the kiosk runs fullscreen with navigation locked

## Setup Checklist
- [ ] Menu items and categories created in the admin panel
- [ ] Addon groups and options configured (if using addons)
- [ ] At least one table created (for Dine In mode)
- [ ] Kiosk Mode toggled on in Module Access Control
- [ ] Test the URL on your target device before going live

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| 404 or "Not available" on kiosk URL | Kiosk Mode not enabled or tenant inactive | Check Module Access Control toggle and tenant status |
| No menu items shown | Categories/items not created or not active | Create menu items in the admin panel |
| No tables shown | No tables created | Add tables in Restaurant → Tables |
| "Unable to place order" | Server validation failed | Check your menu/addon configurations for issues |
| Kiosk not loading on device | Network or URL issue | Verify the device can reach your domain; check tenant ID is correct |
