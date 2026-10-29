import { PACK_SIZE } from "@/data/builder-rules"

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

/**
 * Price of full boxes at the per-grip price. Discounts and promo codes will
 * come from Medusa promotions, so the storefront doesn't apply any.
 */
export function getBoxesTotal(boxCount: number, gripPrice: number) {
  return boxCount * PACK_SIZE * gripPrice
}
