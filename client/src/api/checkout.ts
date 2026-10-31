import { findSport, variantKey } from "@/catalog/selectors"
import { medusaRequest } from "@/lib/medusa"
import type { CartItem, Catalog } from "@/types"

/** Razorpay payment provider registered on the server */
const RAZORPAY_PROVIDER = "pp_razorpay_razorpay"

export type CheckoutAddress = {
  first_name: string
  last_name: string
  phone: string
  address_1: string
  address_2?: string
  city: string
  province: string
  postal_code: string
}

export type PrepareCheckoutInput = {
  catalog: Catalog
  /** Boxes in the storefront cart */
  boxes: CartItem[]
  email: string
  address: CheckoutAddress
  /** Signed-in customer's token, so the order lands in their account */
  token?: string
}

/** What the server's Razorpay provider stores on the payment session */
export type RazorpaySession = {
  key_id: string
  razorpay_order_id: string
  /** In paise */
  amount: number
  currency: string
}

export type PreparedCheckout = {
  cartId: string
  razorpay: RazorpaySession
}

export type PlacedOrder = {
  id: string
  display_id: number
  total: number
  currency_code: string
}

type LineItemInput = {
  variant_id: string
  quantity: number
  metadata: { box: number }
}

type PaymentCollectionResponse = {
  payment_collection: {
    payment_sessions?: { provider_id: string; data: Record<string, unknown> }[]
  }
}

type CompleteCartResponse =
  | { type: "order"; order: PlacedOrder }
  | { type: "cart"; error: { message: string } }

/**
 * Boxes only exist in the storefront. Each grip becomes a line item for its
 * SKU, tagged with its box number; the same SKU twice in a box is one line
 * with quantity 2.
 */
export function toLineItems(catalog: Catalog, boxes: CartItem[]): LineItemInput[] {
  const lines = new Map<string, LineItemInput>()

  boxes.forEach((box, index) => {
    const boxNumber = index + 1
    const sport = findSport(catalog, box.sport)
    for (const slot of box.slots) {
      const variantId = sport?.variantIds[variantKey(slot.patternId, slot.color.hex)]
      if (!variantId) {
        throw new Error(`A grip in Box ${boxNumber} is no longer available. Remove it and try again.`)
      }
      const key = `${boxNumber}:${variantId}`
      const line = lines.get(key)
      if (line) line.quantity += 1
      else lines.set(key, { variant_id: variantId, quantity: 1, metadata: { box: boxNumber } })
    }
  })

  return [...lines.values()]
}

/**
 * Creates a Medusa cart from the boxes with shipping and a Razorpay payment
 * session, ready for the customer to pay
 */
export async function prepareCheckout({
  catalog,
  boxes,
  email,
  address,
  token,
}: PrepareCheckoutInput): Promise<PreparedCheckout> {
  const shippingAddress = { ...address, country_code: catalog.countryCode }

  const { cart } = await medusaRequest<{ cart: { id: string } }>("/store/carts", {
    method: "POST",
    token,
    query: { fields: "id" },
    body: {
      region_id: catalog.regionId,
      email,
      items: toLineItems(catalog, boxes),
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
    },
  })

  const { shipping_options } = await medusaRequest<{ shipping_options: { id: string }[] }>(
    "/store/shipping-options",
    { token, query: { cart_id: cart.id } }
  )
  if (!shipping_options.length) {
    throw new Error("We don't deliver to this address yet.")
  }
  await medusaRequest(`/store/carts/${cart.id}/shipping-methods`, {
    method: "POST",
    token,
    query: { fields: "id" },
    body: { option_id: shipping_options[0].id },
  })

  const { payment_collection } = await medusaRequest<{ payment_collection: { id: string } }>(
    "/store/payment-collections",
    { method: "POST", token, body: { cart_id: cart.id } }
  )
  const { payment_collection: withSession } = await medusaRequest<PaymentCollectionResponse>(
    `/store/payment-collections/${payment_collection.id}/payment-sessions`,
    { method: "POST", token, body: { provider_id: RAZORPAY_PROVIDER } }
  )
  const session = withSession.payment_sessions?.find(
    (candidate) => candidate.provider_id === RAZORPAY_PROVIDER
  )
  if (!session) {
    throw new Error("Online payment isn't available right now. Try again later.")
  }

  return { cartId: cart.id, razorpay: session.data as RazorpaySession }
}

/** Turns a paid cart into an order; the server confirms the payment with Razorpay first */
export async function completeCheckout(cartId: string, token?: string): Promise<PlacedOrder> {
  const result = await medusaRequest<CompleteCartResponse>(`/store/carts/${cartId}/complete`, {
    method: "POST",
    token,
  })
  if (result.type === "cart") {
    throw new Error(result.error.message)
  }
  return result.order
}
