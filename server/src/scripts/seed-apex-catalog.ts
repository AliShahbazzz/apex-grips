/**
 * Seeds the Apex Grips catalog and the India store setup:
 *   - INR currency, India region, tax region, warehouse and free shipping
 *   - grip patterns (pattern module)
 *   - shared "Pattern" and "Grip Color" options
 *   - one product per sport, one variant (SKU) per pattern × color, each
 *     variant linked to its pattern
 *
 *   npx medusa exec ./src/scripts/seed-apex-catalog.ts
 *
 * Safe to re-run: everything is looked up by name or handle and skipped if it
 * already exists. Inventory is not managed and no promotions are created.
 */
import {
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"
import PatternVariantLink from "../links/pattern-product-variant"
import { PATTERN_MODULE } from "../modules/pattern"
import PatternModuleService from "../modules/pattern/service"
import {
  COLOR_OPTION_TITLE,
  COLORS,
  CURRENCY_CODE,
  GRIP_PRICE,
  PATTERN_OPTION_TITLE,
  PATTERNS,
  SPORT_PATTERNS,
  SPORTS,
  sportHandle,
  variantSku,
} from "./data/apex-catalog"

const REGION_NAME = "India"
const COUNTRY_CODE = "in"
const STOCK_LOCATION_NAME = "India Warehouse"

export default async function seedApexCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const patternModuleService: PatternModuleService =
    container.resolve(PATTERN_MODULE)

  // ---- Existing setup from the initial seed ---------------------------------

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
    filters: { name: "Default Sales Channel" },
  })
  const salesChannel = salesChannels[0]

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfile = shippingProfiles[0]

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "supported_currencies.currency_code"],
  })
  const store = stores[0]

  if (!salesChannel || !shippingProfile || !store) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Store, sales channel or shipping profile missing. Run `npx medusa db:migrate` first."
    )
  }

  // ---- Store currency ---------------------------------------------------------

  const currencyCodes = (store.supported_currencies ?? [])
    .map((currency) => currency?.currency_code)
    .filter((code): code is string => Boolean(code))

  if (!currencyCodes.includes(CURRENCY_CODE)) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          supported_currencies: [
            // Indian retail prices include GST
            { currency_code: CURRENCY_CODE, is_default: true, is_tax_inclusive: true },
            ...currencyCodes.map((currency_code) => ({ currency_code })),
          ],
        },
      },
    })
    logger.info("Added INR as the store's default currency.")
  }

  // ---- Region and tax ---------------------------------------------------------

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id"],
    filters: { name: REGION_NAME },
  })
  let regionId = regions[0]?.id

  if (!regionId) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: REGION_NAME,
            currency_code: CURRENCY_CODE,
            countries: [COUNTRY_CODE],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    regionId = result[0].id
    logger.info("Created the India region.")
  }

  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id"],
    filters: { country_code: COUNTRY_CODE },
  })

  if (!taxRegions.length) {
    // No default rate yet: GST rates get configured later
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: COUNTRY_CODE, provider_id: "tp_system" }],
    })
    logger.info("Created the India tax region.")
  }

  // ---- Warehouse and shipping -------------------------------------------------

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
    filters: { name: STOCK_LOCATION_NAME },
  })

  if (!stockLocations.length) {
    const {
      result: [stockLocation],
    } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: STOCK_LOCATION_NAME,
            // Placeholder address, update it in the admin
            address: { city: "Mumbai", country_code: "IN", address_1: "" },
          },
        ],
      },
    })

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    })

    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "India delivery",
      type: "shipping",
      service_zones: [
        {
          name: REGION_NAME,
          geo_zones: [{ country_code: COUNTRY_CODE, type: "country" }],
        },
      ],
    })

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    })

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Free delivery across India.",
            code: "standard",
          },
          prices: [
            { currency_code: CURRENCY_CODE, amount: 0 },
            { region_id: regionId, amount: 0 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: stockLocation.id, add: [salesChannel.id] },
    })
    logger.info("Created the India warehouse and free standard shipping.")
  }

  // ---- Patterns ---------------------------------------------------------------

  const existingPatterns = await patternModuleService.listPatterns({
    handle: PATTERNS.map((pattern) => pattern.handle),
  })
  const missingPatterns = PATTERNS.map((pattern, rank) => ({ ...pattern, rank })).filter(
    (pattern) => !existingPatterns.some((existing) => existing.handle === pattern.handle)
  )

  if (missingPatterns.length) {
    await patternModuleService.createPatterns(missingPatterns)
    logger.info(`Created ${missingPatterns.length} pattern(s).`)
  }

  const patterns = await patternModuleService.listPatterns({
    handle: PATTERNS.map((pattern) => pattern.handle),
  })
  const patternIdByName = new Map(patterns.map((pattern) => [pattern.name, pattern.id]))

  // ---- Shared options ---------------------------------------------------------

  const optionDefinitions = [
    {
      title: PATTERN_OPTION_TITLE,
      values: PATTERNS.map((pattern) => pattern.name),
      metadataFor: (value: string) => ({
        pattern_handle: PATTERNS.find((pattern) => pattern.name === value)?.handle,
      }),
    },
    {
      title: COLOR_OPTION_TITLE,
      values: COLORS.map((color) => color.name),
      metadataFor: (value: string) => ({
        hex: COLORS.find((color) => color.name === value)?.hex,
      }),
    },
  ]

  const { data: existingOptions } = await query.graph({
    entity: "product_option",
    fields: ["id", "title"],
    filters: {
      is_exclusive: false,
      title: optionDefinitions.map((option) => option.title),
    },
  })
  const missingOptions = optionDefinitions.filter(
    (option) => !existingOptions.some((existing) => existing.title === option.title)
  )

  if (missingOptions.length) {
    await createProductOptionsWorkflow(container).run({
      input: {
        product_options: missingOptions.map(({ title, values }) => ({
          title,
          values,
          ranks: Object.fromEntries(values.map((value, rank) => [value, rank])),
        })),
      },
    })
    logger.info(`Created ${missingOptions.length} shared option(s).`)
  }

  const { data: optionRows } = await query.graph({
    entity: "product_option",
    fields: ["id", "title", "values.id", "values.value"],
    filters: {
      is_exclusive: false,
      title: optionDefinitions.map((option) => option.title),
    },
  })
  const patternOption = optionRows.find((option) => option.title === PATTERN_OPTION_TITLE)!
  const colorOption = optionRows.find((option) => option.title === COLOR_OPTION_TITLE)!

  // Pattern handle and color hex ride along on the option values
  for (const definition of optionDefinitions) {
    const option = definition.title === PATTERN_OPTION_TITLE ? patternOption : colorOption
    for (const value of option.values ?? []) {
      if (!value?.id) continue
      await productModuleService.updateProductOptionValues(value.id, {
        metadata: definition.metadataFor(value.value),
      })
    }
  }

  // ---- Sport products ---------------------------------------------------------

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
    filters: { handle: SPORTS.map((sport) => sportHandle(sport.id)) },
  })
  const missingSports = SPORTS.filter(
    (sport) => !existingProducts.some((product) => product.handle === sportHandle(sport.id))
  )

  if (missingSports.length) {
    const { result: createdProducts } = await createProductsWorkflow(container).run({
      input: {
        products: missingSports.map((sport) => {
          const sportPatterns = PATTERNS.filter((pattern) =>
            SPORT_PATTERNS[sport.id].includes(pattern.handle)
          )
          const patternValueIds = (patternOption.values ?? [])
            .filter((value) => sportPatterns.some((pattern) => pattern.name === value?.value))
            .map((value) => value!.id)

          return {
            title: sport.title,
            handle: sportHandle(sport.id),
            subtitle: sport.geometry,
            description: `${sport.geometry} overgrip with a ${sport.fitHint.toLowerCase()} fit.`,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
              sport: sport.id,
              icon: sport.icon,
              geometry: sport.geometry,
              fit_hint: sport.fitHint,
            },
            options: [
              { id: patternOption.id, value_ids: patternValueIds },
              { id: colorOption.id },
            ],
            variants: sportPatterns.flatMap((pattern) =>
              COLORS.map((color) => ({
                title: `${pattern.name} / ${color.name}`,
                sku: variantSku(sport.id, pattern.handle, color.name),
                manage_inventory: false,
                options: {
                  [PATTERN_OPTION_TITLE]: pattern.name,
                  [COLOR_OPTION_TITLE]: color.name,
                },
                prices: [{ currency_code: CURRENCY_CODE, amount: GRIP_PRICE }],
              }))
            ),
          }
        }),
      },
    })
    logger.info(`Created ${createdProducts.length} sport product(s).`)
  }

  const { data: apexProducts } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { handle: SPORTS.map((sport) => sportHandle(sport.id)) },
  })
  const apexProductIds = apexProducts.map((product) => product.id)

  // ---- Variant → pattern links --------------------------------------------------

  // Checked on every run, so a run that failed after creating products can
  // simply be repeated to finish the linking.
  const { data: apexVariants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "options.value", "options.option.title"],
    filters: { product_id: apexProductIds },
  })
  const { data: existingLinks } = await query.graph({
    entity: PatternVariantLink.entryPoint,
    fields: ["product_variant_id"],
  })
  const linkedVariantIds = new Set(
    existingLinks.map((existing) => existing.product_variant_id as string)
  )
  const unlinkedVariants = apexVariants.filter(
    (variant) => !linkedVariantIds.has(variant.id)
  )

  const links = unlinkedVariants.map((variant) => {
    const patternName = (variant.options ?? []).find(
      (value) => value?.option?.title === PATTERN_OPTION_TITLE
    )?.value
    const patternId = patternName && patternIdByName.get(patternName)

    if (!patternId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `No pattern found for variant ${variant.id}`
      )
    }

    return {
      [PATTERN_MODULE]: { pattern_id: patternId },
      [Modules.PRODUCT]: { product_variant_id: variant.id },
    }
  })

  if (links.length) {
    await link.create(links)
  }
  logger.info(`Linked ${links.length} variant(s) to their patterns.`)

  // ---- Search index -------------------------------------------------------------

  // `product.created` is handled asynchronously; replay it so the index is
  // complete before this short-lived process exits.
  const search = container.resolve(Modules.SEARCH)
  await search.ingest({
    name: "product.created",
    data: apexProductIds.map((id) => ({ id })),
  } as never)

  logger.info("Done.")
}
