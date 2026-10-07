import { model } from "@medusajs/framework/utils"

/**
 * A grip surface pattern. Shared across sports: each sport product has one
 * variant per pattern × color, and every variant links back to its pattern.
 */
const Pattern = model.define("pattern", {
  id: model.id({ prefix: "pat" }).primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  description: model.text().nullable(),
  badge: model.text().nullable(),
  tag: model.text().nullable(),
  image_url: model.text().nullable(),
  rank: model.number().default(0),
  metadata: model.json().nullable(),
})

export default Pattern
