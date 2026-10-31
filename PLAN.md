# Plan

Work agreed on but not started yet.

## Customer accounts: claim guest orders on sign-up

A guest who signs up or signs in with an email they already ordered with should
verify that email, set a password, and then see their earlier orders.

Medusa stores each guest order on a guest customer record (`has_account = false`,
one per email). Instead of creating a new customer on sign-up, upgrade that
record to `has_account = true` so its orders come with it.

Flow (native Medusa email verification, link-based):

1. Customer enters email + password → `POST /auth/customer/emailpass/register`
   returns `verification_required`.
2. `POST /auth/verification/request` emits `auth.verification_requested`; a
   subscriber emails a link `…/?verify=<token>` (15 min expiry).
3. Link opens the storefront → `POST /auth/verification/confirm` (works logged out,
   so another device is fine).
4. Customer signs in → custom `POST /store/customers/claim` upgrades the guest
   record, or creates a new customer if none exists.
5. `GET /store/orders` now shows the old guest orders.

Server:

- [ ] Email provider: Resend (notification module provider)
- [ ] Require verification for customers via
      `projectConfig.http.authVerificationsPerActor` (verify the exact config shape)
- [ ] Subscriber on `auth.verification_requested` that sends the link
- [ ] `POST /store/customers/claim` route + workflow (replaces `POST /store/customers`)
- [ ] Optional: `order.placed` subscriber that attaches guest orders to an existing
      account with the same email

- [ ] Subscriber on `auth.password_reset` that emails a link
      `<storefront>/?reset_token=<token>` (the client already handles this link)

Client:

- [x] Sign-in, sign-up, forgot-password and reset-password screens (account sheet)
- [x] Account section with profile and order history
- [ ] "Check your inbox" verify step after sign-up
- [ ] Same "verify your email" response whether or not the email has orders
      (no email enumeration)

## Discounts and promo codes (backend)

The storefront's mock discounts were removed; every price is now the plain
per-grip price. Set these up as Medusa promotions so the cart and order totals
come from the server.

- [ ] Multi-pack discount (the mock was 15% off every box after the first);
      the rule needs a decision, since the server only sees grips, not boxes
- [ ] Promo codes (the mock had APEX10 / SUPER10 for 10% off)
- [ ] Storefront: promo code field on the cart, and show discounts and totals
      from the Medusa cart instead of computing them in the browser

## Payments

Every order is paid online through Razorpay (`pp_razorpay_razorpay`,
`server/src/modules/razorpay`). The storefront has no cash on delivery option;
`pp_system_default` is still enabled on the region.

- [x] Razorpay payment provider (server), enabled for the India region by the seed
- [x] Storefront: "Proceed to Pay" → confirm → Razorpay Checkout → order placed
      (`client/src/api/checkout.ts`, `client/src/sections/checkout/checkout-dialog.tsx`)
- [x] Test the storefront flow end to end with Razorpay test payments
      (success, failed card, tab closed mid-payment)
- [x] Webhook: `<server>/hooks/payment/razorpay_razorpay` with events
      `payment.authorized` and `order.paid`; set `RAZORPAY_WEBHOOK_SECRET`
      (tested locally through a Cloudflare quick tunnel)
- [x] Auto-capture is on in the Razorpay dashboard
- [ ] Test refunds from the Medusa admin
- [ ] Go live: live keys, live webhook (long random secret) pointing at the
      deployed server, seed run on the production DB, one small real order

## Emails

Needs a notification provider (Resend planned) plus subscribers.

- [ ] Order confirmation on `order.placed`
- [ ] Password reset link on `auth.password_reset` (see above)
- [ ] Email verification link on `auth.verification_requested` (see above)

## Invoices

Medusa has no invoice module. Build a custom one in `server/src/modules/invoice`,
linked to orders.

Decisions first:

- [ ] GST registered? Registered → tax invoice with GSTIN, HSN code and the
      CGST + SGST (same state) or IGST (other state) split. Not registered →
      bill of supply without tax lines
- [ ] Seller details on the invoice: legal name, address, GSTIN, HSN code for grips
- [ ] Number format, e.g. `AG/2026-27/0001`: sequential with no gaps, restarting
      each financial year (April–March)

Server:

- [ ] Invoice module: invoice record (number, order id, issued date, totals and
      tax breakup at issue time) linked to the order
- [ ] Set GST rates on the India tax region, so orders carry the tax amounts
      the invoice shows (prices stay tax-inclusive)
- [ ] Issue the invoice on `order.placed` (subscriber + workflow); numbering must
      be safe when two orders are placed at the same moment
- [ ] Generate the PDF (e.g. pdfmake) from the stored invoice, not the live order
- [ ] `GET /store/orders/:id/invoice` for the order's customer and
      `GET /admin/orders/:id/invoice` for the admin
- [ ] Refunds and cancellations: credit note (decide when GST is decided)

Admin and storefront:

- [ ] Admin widget on the order page: invoice number + "Download invoice"
- [ ] Storefront order history: "Download invoice" link
- [ ] Attach the PDF to the order confirmation email (after Emails)

## Production deployment

Hosting isn't chosen yet. The server needs a long-running Node host (Railway,
Render, Fly.io, a VPS); the storefront is a static Vite build (Cloudflare Pages,
Vercel, Netlify). Pick hosts close to India.

Decisions:

- [ ] Server host and storefront host
- [ ] Domains, e.g. `apexgrips.in` (storefront) and `api.apexgrips.in` (server + admin)
- [ ] Redis provider (Upstash, Redis Cloud or the server host's own)

Server code and config (`server/medusa-config.ts`):

- [ ] Pass `redisUrl` in `projectConfig`; today `REDIS_URL` is set in `.env` but
      never read, so Medusa uses a fake in-memory Redis
- [ ] Production modules on Redis: event bus (`@medusajs/medusa/event-bus-redis`),
      workflow engine (`@medusajs/medusa/workflow-engine-redis`), locking
      (`@medusajs/medusa/locking-redis`), caching. The in-memory defaults lose
      events and workflow state on restart and break with more than one instance
- [ ] `workerMode` from `MEDUSA_WORKER_MODE` (`shared` for a single instance;
      `server` + `worker` if split later)
- [ ] `admin.backendUrl` from `MEDUSA_BACKEND_URL` so the admin calls the public URL
- [ ] Add `"predeploy": "medusa db:migrate"` to `server/package.json` scripts
- [ ] Build and start: `npx medusa build`, then in `.medusa/server`:
      `npm install --omit=dev`, `npm run predeploy` (runs migrations), `npm run start`
- [ ] Health check path: `/health`

Server environment variables (set on the host, never committed):

- [ ] `DATABASE_URL`: Neon Singapore **pooled** URL (host contains `-pooler`)
- [ ] `REDIS_URL`
- [ ] `JWT_SECRET`, `COOKIE_SECRET`: new long random values
      (`openssl rand -hex 32`); the local ones are still the `supersecret` default
- [ ] `STORE_CORS`: the storefront URL (e.g. `https://apexgrips.in`)
- [ ] `ADMIN_CORS`: the server URL (e.g. `https://api.apexgrips.in`)
- [ ] `AUTH_CORS`: storefront URL and server URL
- [ ] `MEDUSA_BACKEND_URL`: the public server URL
- [ ] `AUTH_MFA_ENCRYPTION_KEY`: new random value
- [ ] `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: **live** keys (`rzp_live_…`)
- [ ] `RAZORPAY_WEBHOOK_SECRET`: the live webhook's secret, long and random
- [ ] `NODE_ENV=production`
- [ ] Later: email provider key (Resend) and the storefront URL used in email links

Database (Neon Singapore):

- [ ] Migrations run on deploy (`predeploy`); first time only, seed:
      `npx medusa exec ./src/scripts/seed-apex-catalog.ts` with the Razorpay keys
      set, so the India region gets `pp_razorpay_razorpay`, then
      `remove-demo-data.ts`
- [ ] Remove test orders, customers and carts left from development
- [ ] Admin user with a strong password: `npx medusa user -e <email> -p <password>`
- [ ] Copy the production publishable key (Admin → Settings → Publishable API Keys)
- [ ] Optional: delete the leftover Europe region, warehouse and shipping options
- [ ] Confirm Neon backups / point-in-time restore retention

Razorpay (live mode):

- [ ] Webhook → `https://<server>/hooks/payment/razorpay_razorpay`, events
      `payment.authorized` and `order.paid`, secret = `RAZORPAY_WEBHOOK_SECRET`
- [ ] Auto-capture on in live mode (it's a separate setting from test mode)
- [ ] Business name, logo and support details shown in Checkout
- [ ] Test a refund from the Medusa admin (still untested; do it in test mode first)

Storefront (`client/`):

- [ ] Build env (`client/.env.production` or the host's settings):
      `VITE_MEDUSA_BACKEND_URL` (public server URL), `VITE_MEDUSA_PUBLISHABLE_KEY`
      (production key), `VITE_MEDUSA_REGION_COUNTRY=in`
- [ ] `npm run build`, deploy `client/dist`; single page, so no rewrites needed
      beyond `index.html`

Launch checks:

- [ ] HTTPS on both domains
- [ ] Storefront loads the catalog from the production server
- [ ] Sign up, sign in, password reset (once emails exist)
- [ ] One small real order paid with Razorpay; order shows in admin and Razorpay;
      webhook deliveries show 200; refund it
- [ ] Error monitoring / uptime check on `/health` (optional)

## Other open items

- [x] Wire the storefront checkout to the Medusa Store API (guest and signed-in)
- [x] Local Postgres for development to avoid Neon latency (see server/README.md)
