import { useContext } from "react"
import { getBoxesTotal } from "@/lib/pricing"
import { StoreContext } from "@/store/context"
import type { StoreState } from "@/store/reducer"
import type { Catalog } from "@/types"

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

export function selectCartTotal(state: StoreState, catalog: Catalog) {
  return getBoxesTotal(state.cart.length, catalog.gripPrice)
}
