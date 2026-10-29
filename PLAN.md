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

Checkout only offers cash on delivery (Medusa's `pp_system_default`, no online
charge). UPI and Card show as "Coming soon".

- [ ] Online payment provider for India (Razorpay plugin or Stripe)
- [ ] Enable UPI / Card in `client/src/sections/checkout/checkout-dialog.tsx`

## Emails

Needs a notification provider (Resend planned) plus subscribers.

- [ ] Order confirmation on `order.placed`
- [ ] Password reset link on `auth.password_reset` (see above)
- [ ] Email verification link on `auth.verification_requested` (see above)

## Other open items

- [x] Wire the storefront checkout to the Medusa Store API (guest and signed-in)
- [x] Local Postgres for development to avoid Neon latency (see server/README.md)
