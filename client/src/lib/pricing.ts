import {
  CURRENCY,
  MULTI_PACK_DISCOUNT,
  PACK_PRICE,
  PROMO_DISCOUNT,
} from "@/data/catalog"

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
})

export function formatPrice(amount: number) {
  return priceFormatter.format(amount)
}

/** First box is full price, every extra box gets the multi-pack discount. */
export function getBundlePricing(boxCount: number, promoApplied = false) {
  const subtotal = boxCount * PACK_PRICE
  const multiPackDiscount =
    Math.max(0, boxCount - 1) * Math.round(PACK_PRICE * MULTI_PACK_DISCOUNT)
  const promoDiscount = promoApplied
    ? Math.round(subtotal * PROMO_DISCOUNT)
    : 0
  const total = Math.max(0, subtotal - multiPackDiscount - promoDiscount)

  return { subtotal, multiPackDiscount, promoDiscount, total }
}
