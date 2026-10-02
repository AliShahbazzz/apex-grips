import { createContext, type Dispatch } from "react"
import type { StoreAction, StoreState } from "@/store/reducer"

export type StoreContextValue = {
  state: StoreState
  dispatch: Dispatch<StoreAction>
}

export const StoreContext = createContext<StoreContextValue | null>(null)
