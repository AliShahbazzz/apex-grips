import type { ReactNode } from "react"
import { StoreContext } from "@/store/context"
import { useDevtoolsReducer } from "@/store/devtools"
import { initialState, storeReducer } from "@/store/reducer"

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useDevtoolsReducer(
    storeReducer,
    initialState,
    "Apex Grips"
  )
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}
