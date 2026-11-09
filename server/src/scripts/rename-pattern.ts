/**
 * Renames a grip pattern everywhere its name is stored: the pattern record
 * (what the storefront shows), the shared "Pattern" option value, and the
 * titles of every variant in that pattern ("<pattern> / <color>").
 *
 *   npx medusa exec ./src/scripts/rename-pattern.ts <pattern-handle> <new name>
 *
 * Example:
 *   npx medusa exec ./src/scripts/rename-pattern.ts lattice "3D Diamond"
 *
 * Also update the name in ./data/apex-catalog.ts so new databases match.
 * Orders already placed keep the old name. The running server's catalog
 * cache only picks this up when it expires or the server restarts.
 */
import {
  updateProductOptionValuesWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"
import { PATTERN_MODULE } from "../modules/pattern"
import PatternModuleService from "../modules/pattern/service"
import { PATTERN_OPTION_TITLE } from "./data/apex-catalog"

export default async function renamePattern({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const patternModuleService: PatternModuleService = container.resolve(PATTERN_MODULE)

  const [handle, ...nameParts] = args
  const newName = nameParts.join(" ").trim()
  if (!handle || !newName) {
    throw new MedusaError(
      MedusaError.Types.INVALID_ARGUMENT,
      'Usage: npx medusa exec ./src/scripts/rename-pattern.ts <pattern-handle> "<new name>"'
    )
  }

  const [pattern] = await patternModuleService.listPatterns({ handle })
  if (!pattern) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `No pattern with handle "${handle}"`)
  }
  const oldName = pattern.name
  if (oldName === newName) {
    logger.info(`Pattern "${handle}" is already called "${newName}".`)
    return
  }

  // ---- Pattern record ---------------------------------------------------------

  await patternModuleService.updatePatterns({ id: pattern.id, name: newName })
  logger.info(`Pattern: "${oldName}" → "${newName}".`)

  // ---- Shared "Pattern" option value -------------------------------------------

  const { data: optionValues } = await query.graph({
    entity: "product_option_value",
    fields: ["id", "value", "metadata", "option.title"],
    filters: { value: oldName },
  })
  const patternValues = optionValues.filter(
    (value) =>
      value.option?.title === PATTERN_OPTION_TITLE && value.metadata?.pattern_handle === handle
  )
  for (const value of patternValues) {
    await updateProductOptionValuesWorkflow(container).run({
      input: { id: value.id, update: { value: newName } },
    })
  }
  logger.info(`Renamed ${patternValues.length} "${PATTERN_OPTION_TITLE}" option value(s).`)

  // ---- Variant titles -------------------------------------------------------------

  const prefix = `${oldName} / `
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title"],
    filters: { title: { $like: `${prefix}%` } },
  })
  if (variants.length) {
    await updateProductVariantsWorkflow(container).run({
      input: {
        product_variants: variants.map((variant) => ({
          id: variant.id,
          title: `${newName} / ${(variant.title as string).slice(prefix.length)}`,
        })),
      },
    })
  }
  logger.info(`Renamed ${variants.length} variant title(s).`)
}
