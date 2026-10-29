import { medusaRequest } from "@/lib/medusa"

/** Customer login with email + password (Medusa's emailpass provider) */
const EMAILPASS = "/auth/customer/emailpass"

/** Client-side rule; Medusa itself doesn't enforce a minimum */
export const MIN_PASSWORD_LENGTH = 8

const ORDER_FIELDS = [
  "id",
  "display_id",
  "status",
  "payment_status",
  "fulfillment_status",
  "total",
  "currency_code",
  "created_at",
].join(",")

export type Customer = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
}

export type CustomerProfile = {
  first_name?: string
  last_name?: string
  phone?: string
}

export type OrderSummary = {
  id: string
  display_id: number
  status: string
  payment_status: string
  fulfillment_status: string
  total: number
  currency_code: string
  created_at: string
}

type TokenResponse = { token: string }

/** Creates the login (auth identity). The returned token has no customer yet. */
export async function registerIdentity(email: string, password: string) {
  const { token } = await medusaRequest<TokenResponse>(`${EMAILPASS}/register`, {
    method: "POST",
    body: { email, password },
  })
  return token
}

/** Returns a JWT for the customer */
export async function login(email: string, password: string) {
  const { token } = await medusaRequest<TokenResponse>(EMAILPASS, {
    method: "POST",
    body: { email, password },
  })
  return token
}

/** Creates the customer for a freshly registered login */
export async function createCustomer(token: string, email: string, profile: CustomerProfile) {
  const { customer } = await medusaRequest<{ customer: Customer }>("/store/customers", {
    method: "POST",
    token,
    body: { email, ...profile },
  })
  return customer
}

export async function getCustomer(token: string, signal?: AbortSignal) {
  const { customer } = await medusaRequest<{ customer: Customer }>("/store/customers/me", {
    token,
    signal,
  })
  return customer
}

export async function updateCustomer(token: string, profile: CustomerProfile) {
  const { customer } = await medusaRequest<{ customer: Customer }>("/store/customers/me", {
    method: "POST",
    token,
    body: profile,
  })
  return customer
}

export async function listOrders(token: string, signal?: AbortSignal) {
  const { orders } = await medusaRequest<{ orders: OrderSummary[] }>("/store/orders", {
    token,
    signal,
    query: { fields: ORDER_FIELDS, order: "-created_at", limit: 50 },
  })
  return orders
}

/**
 * Asks Medusa to issue a reset token. It always succeeds so it can't reveal
 * which emails have accounts; sending the email needs a server subscriber.
 */
export async function requestPasswordReset(email: string) {
  await medusaRequest(`${EMAILPASS}/reset-password`, {
    method: "POST",
    body: { identifier: email },
  })
}

/** Sets a new password using the token from the reset email */
export async function resetPassword(resetToken: string, password: string) {
  await medusaRequest(`${EMAILPASS}/update`, {
    method: "POST",
    token: resetToken,
    body: { password },
  })
}
