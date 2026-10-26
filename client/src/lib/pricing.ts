import { MULTI_PACK_DISCOUNT, PACK_SIZE, PROMO_DISCOUNT } from "@/data/builder-rules"

const formatters = new Map<string, Intl.NumberFormat>()

export function formatPrice(amount: number, currencyCode: string) {
  const currency = currencyCode.toUpperCase()
  let formatter = formatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    })
    formatters.set(currency, formatter)
  }
  return formatter.format(amount)
}

/** First box is full price, every extra box gets the multi-pack discount. */
export function getBundlePricing(boxCount: number, gripPrice: number, promoApplied = false) {
  const packPrice = gripPrice * PACK_SIZE
  const subtotal = boxCount * packPrice
  const multiPackDiscount =
    Math.max(0, boxCount - 1) * Math.round(packPrice * MULTI_PACK_DISCOUNT)
  const promoDiscount = promoApplied ? Math.round(subtotal * PROMO_DISCOUNT) : 0
  const total = Math.max(0, subtotal - multiPackDiscount - promoDiscount)

  return { subtotal, multiPackDiscount, promoDiscount, total }
}
