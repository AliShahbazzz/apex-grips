import { Module } from "@medusajs/framework/utils"
import PatternModuleService from "./service"

export const PATTERN_MODULE = "pattern"

export default Module(PATTERN_MODULE, {
  service: PatternModuleService,
})
