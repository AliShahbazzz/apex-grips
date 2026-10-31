import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import RazorpayProviderService from "./service"

/** Registered as `pp_razorpay_razorpay` (see medusa-config.ts) */
export default ModuleProvider(Modules.PAYMENT, {
  services: [RazorpayProviderService],
})
