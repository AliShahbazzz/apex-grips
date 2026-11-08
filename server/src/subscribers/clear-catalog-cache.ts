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
    // Module-level events also cover changes that skip the workflows above.
    // Scripts run with `medusa exec` are separate processes: without the Redis
    // event bus their events never reach this server, so its cache only
    // refreshes when it expires or the server restarts
    ...Object.values(ProductEvents),
    ...Object.values(PricingEvents),
  ],
}
