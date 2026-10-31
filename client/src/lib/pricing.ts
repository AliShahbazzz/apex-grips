import { findSport, variantKey } from "@/catalog/selectors"
import { PACK_SIZE } from "@/data/builder-rules"
import type { CartItem, Catalog } from "@/types"

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
 * Price of full boxes at the per-grip price, for boxes whose grips aren't all
 * picked yet. Discounts and promo codes will come from Medusa promotions, so
 * the storefront doesn't apply any.
 */
export function getBoxesTotal(boxCount: number, gripPrice: number) {
  return boxCount * PACK_SIZE * gripPrice
}

/** Sum of each grip's own variant price, which is what Medusa charges */
export function getCartTotal(catalog: Catalog, cart: CartItem[]) {
  return cart.reduce((total, box) => {
    const sport = findSport(catalog, box.sport)
    if (!sport) return total
    return box.slots.reduce(
      (boxTotal, slot) =>
        boxTotal +
        (sport.variantPrices[variantKey(slot.patternId, slot.color.hex)] ?? sport.gripPrice),
      total
    )
  }, 0)
}
