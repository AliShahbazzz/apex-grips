import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import {
  PricingEvents,
  ProductEvents,
  ProductOptionWorkflowEvents,
  ProductVariantWorkflowEvents,
  ProductWorkflowEvents,
  RegionWorkflowEvents,
} from "@medusajs/framework/utils"
import { clearCatalogCache } from "../lib/catalog-cache"

/** Drops the cached /store/catalog whenever products, prices or regions change */
export default async function clearCatalogCacheHandler(_: SubscriberArgs) {
  clearCatalogCache()
}

export const config: SubscriberConfig = {
  event: [
    ...Object.values(ProductWorkflowEvents),
    ...Object.values(ProductVariantWorkflowEvents),
    ...Object.values(ProductOptionWorkflowEvents),
    ...Object.values(RegionWorkflowEvents),
    // Module-level events also cover changes made outside the admin workflows,
    // such as price edits and the seed scripts
    ...Object.values(ProductEvents),
    ...Object.values(PricingEvents),
  ],
}
