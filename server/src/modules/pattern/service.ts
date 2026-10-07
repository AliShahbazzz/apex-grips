import { MedusaService } from "@medusajs/framework/utils"
import Pattern from "./models/pattern"

class PatternModuleService extends MedusaService({
  Pattern,
}) {}

export default PatternModuleService
