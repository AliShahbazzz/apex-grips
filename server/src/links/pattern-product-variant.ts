import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import PatternModule from "../modules/pattern"

// One pattern is used by many variants (one per sport × color)
export default defineLink(PatternModule.linkable.pattern, {
  linkable: ProductModule.linkable.productVariant,
  isList: true,
})
