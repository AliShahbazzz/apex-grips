/**
 * Removes the Medusa demo catalog: every product except the Apex sport grips,
 * plus the demo categories, collections, tags and shared options. Store,
 * regions, sales channel, API key and shipping setup are left untouched.
 *
 *   npx medusa exec ./src/scripts/remove-demo-data.ts
 *
 * Safe to re-run: anything already removed is simply not found.
 */
import {
  deleteCollectionsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductOptionsWorkflow,
  deleteProductsWorkflow,
  deleteProductTagsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"
import { APEX_PRODUCT_HANDLES } from "./data/apex-catalog"

/** Shared options created by the initial seed and the demo product script */
const DEMO_OPTION_TITLES = ["Size", "Color", "Material", "Fit", "Sleeve"]

export default async function removeDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // ---- Products -------------------------------------------------------------

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  })
  const demoProductIds = products
    .filter((product) => !APEX_PRODUCT_HANDLES.includes(product.handle))
    .map((product) => product.id)

  if (demoProductIds.length) {
    await deleteProductsWorkflow(container).run({
      input: { ids: demoProductIds },
    })

    // Deletion events are handled asynchronously; replay them so the search
    // index drops the products before this short-lived process exits.
    const search = container.resolve(Modules.SEARCH)
    await search.ingest({
      name: "product.deleted",
      data: demoProductIds.map((id) => ({ id })),
    } as never)
  }
  logger.info(`Removed ${demoProductIds.length} demo product(s).`)

  // ---- Categories, collections, tags ---------------------------------------

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id"],
  })
  if (categories.length) {
    await deleteProductCategoriesWorkflow(container).run({
      input: categories.map((category) => category.id),
    })
  }
  logger.info(`Removed ${categories.length} categor(ies).`)

  const { data: collections } = await query.graph({
    entity: "product_collection",
    fields: ["id"],
  })
  if (collections.length) {
    await deleteCollectionsWorkflow(container).run({
      input: { ids: collections.map((collection) => collection.id) },
    })
  }
  logger.info(`Removed ${collections.length} collection(s).`)

  const { data: tags } = await query.graph({
    entity: "product_tag",
    fields: ["id"],
  })
  if (tags.length) {
    await deleteProductTagsWorkflow(container).run({
      input: { ids: tags.map((tag) => tag.id) },
    })
  }
  logger.info(`Removed ${tags.length} tag(s).`)

  // ---- Shared options -------------------------------------------------------

  const { data: options } = await query.graph({
    entity: "product_option",
    fields: ["id"],
    filters: { is_exclusive: false, title: DEMO_OPTION_TITLES },
  })
  if (options.length) {
    await deleteProductOptionsWorkflow(container).run({
      input: { ids: options.map((option) => option.id) },
    })
  }
  logger.info(`Removed ${options.length} shared option(s).`)

  logger.info("Demo data removed.")
}
