import { useContext } from "react"
import { getBundlePricing } from "@/lib/pricing"
import { StoreContext } from "@/store/context"
import type { StoreState } from "@/store/reducer"

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used inside <StoreProvider>")
  }
  return context
}

export function selectActiveBox(state: StoreState) {
  return state.boxes[state.activeBoxIndex]
}

export function countFilled(slots: readonly unknown[]) {
  return slots.filter(Boolean).length
}

export function selectCartPricing(state: StoreState) {
  return getBundlePricing(state.cart.length, state.promoApplied)
}
