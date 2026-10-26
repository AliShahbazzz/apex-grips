import { useMemo, type ReactNode } from "react"
import { useCatalog } from "@/catalog/use-catalog"
import { StoreContext } from "@/store/context"
import { useDevtoolsReducer } from "@/store/devtools"
import { createInitialState, createStoreReducer } from "@/store/reducer"

export function StoreProvider({ children }: { children: ReactNode }) {
  const catalog = useCatalog()
  const reducer = useMemo(() => createStoreReducer(catalog), [catalog])
  const initialState = useMemo(() => createInitialState(catalog), [catalog])
  const [state, dispatch] = useDevtoolsReducer(reducer, initialState, "Apex Grips")
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}
