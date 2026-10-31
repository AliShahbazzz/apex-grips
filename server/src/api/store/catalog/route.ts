import { MedusaResponse, MedusaStoreRequest } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ProductStatus,
  QueryContext,
} from "@medusajs/framework/utils"
import { getCachedCatalog } from "../../../lib/catalog-cache"

const PRODUCT_FIELDS = [
  "id",
  "title",
  "handle",
  "metadata",
  "options.id",
  "options.title",
  "options.values.*",
  "variants.id",
  "variants.thumbnail",
  "variants.options.id",
  "variants.calculated_price.*",
]

const PATTERN_FIELDS = [
  "id",
  "handle",
  "name",
  "description",
  "badge",
  "tag",
  "image_url",
  "rank",
  "metadata",
]

type Variant = {
  id: string
  thumbnail: string | null
  options: { id: string }[]
  calculated_price?: { calculated_amount: number; currency_code: string } | null
}

/**
 * GET /store/catalog?region_id=…
 * Everything the storefront needs in one response: published products with
 * their options, variants and prices in the region, plus the grip patterns.
 * Served from memory after the first request (see src/lib/catalog-cache.ts),
 * so it skips the database, pricing and tax work that /store/products does.
 *
 * Prices are the region's regular prices; customer-group price lists aren't
 * applied, which matches /store/products for a signed-out shopper.
 */
export async function GET(req: MedusaStoreRequest, res: MedusaResponse) {
  const regionId = req.query.region_id
  if (typeof regionId !== "string" || !regionId) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "region_id is required")
  }
  const salesChannelIds = [...(req.publishable_key_context.sales_channel_ids ?? [])].sort()
  const key = `${regionId}|${salesChannelIds.join(",")}`

  const { value, hit } = await getCachedCatalog(key, () =>
    buildCatalog(req, regionId, salesChannelIds)
  )
  res.setHeader("x-catalog-cache", hit ? "hit" : "miss")
  res.json(value)
}

async function buildCatalog(req: MedusaStoreRequest, regionId: string, salesChannelIds: string[]) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
    filters: { id: regionId },
  })
  const region = regions[0]
  if (!region) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Region with id ${regionId} not found`)
  }

  // Only products in the publishable key's sales channels
  const { data: links } = await query.graph({
    entity: "product_sales_channel",
    fields: ["product_id"],
    filters: { sales_channel_id: salesChannelIds },
  })
  const productIds = links.map((link) => link.product_id as string)

  const [{ data: products }, { data: patterns }] = await Promise.all([
    productIds.length
      ? query.graph({
          entity: "product",
          fields: PRODUCT_FIELDS,
          filters: { id: productIds, status: ProductStatus.PUBLISHED },
          context: {
            variants: {
              calculated_price: QueryContext({
                region_id: region.id,
                currency_code: region.currency_code,
              }),
            },
          },
        })
      : Promise.resolve({ data: [] }),
    query.graph({
      entity: "pattern",
      fields: PATTERN_FIELDS,
      pagination: { order: { rank: "ASC" } },
    }),
  ])

  return {
    products: products.map((product) => ({
      ...product,
      variants: (product.variants as Variant[]).map((variant) => ({
        id: variant.id,
        thumbnail: variant.thumbnail,
        options: variant.options.map((option) => ({ id: option.id })),
        // The storefront only reads the amount and currency
        calculated_price: variant.calculated_price
          ? {
              calculated_amount: variant.calculated_price.calculated_amount,
              currency_code: variant.calculated_price.currency_code,
            }
          : null,
      })),
    })),
    patterns,
  }
}
