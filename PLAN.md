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

## Other open items

- [ ] Wire the storefront cart and checkout to the Medusa Store API (guest checkout)
- [ ] Real payment provider for India (Razorpay or Stripe)
- [ ] Order confirmation email on `order.placed`
- [ ] Multi-pack discount rule (pending decision)
- [ ] Promotions (when needed)
- [ ] Local Postgres for development to avoid Neon latency
