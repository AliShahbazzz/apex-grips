/**
 * Sets a variant's thumbnail by SKU.
 *
 *   npx medusa exec ./src/scripts/set-variant-image.ts <sku> <image-url>
 *
 * Example:
 *   npx medusa exec ./src/scripts/set-variant-image.ts \
 *     APX-CRICKET-CHEVRON-SUNSET-ORANGE https://example.com/chevron-orange.png
 */
import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"

export default async function setVariantImage({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const [sku, url] = args

  if (!sku || !url) {
    throw new MedusaError(
      MedusaError.Types.INVALID_ARGUMENT,
      "Usage: npx medusa exec ./src/scripts/set-variant-image.ts <sku> <image-url>"
    )
  }

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "product.title"],
    filters: { sku },
  })
  const variant = variants[0]

  if (!variant) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `No variant with SKU ${sku}`)
  }

  await updateProductVariantsWorkflow(container).run({
    input: { selector: { id: variant.id }, update: { thumbnail: url } },
  })

  logger.info(`Set thumbnail of ${variant.product?.title} / ${variant.title} (${sku}).`)
}
