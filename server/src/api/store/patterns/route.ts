import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/patterns
 * Lists every grip pattern in display order. Variants link back to their
 * pattern, so the storefront joins them by the variant's "Pattern" option.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: patterns } = await query.graph({
    entity: "pattern",
    fields: [
      "id",
      "handle",
      "name",
      "description",
      "badge",
      "tag",
      "image_url",
      "rank",
      "metadata",
    ],
    pagination: { order: { rank: "ASC" } },
  })

  res.json({ patterns })
}
