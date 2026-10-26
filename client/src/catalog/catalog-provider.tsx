import { useEffect, useState, type ReactNode } from "react"
import { fetchCatalog } from "@/api/catalog"
import { CatalogContext } from "@/catalog/context"
import type { Catalog } from "@/types"

type CatalogState =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "ready"; catalog: Catalog }

type CatalogProviderProps = {
  children: ReactNode
  loading: ReactNode
  renderError: (error: Error, retry: () => void) => ReactNode
}

/** Loads the catalog once and renders children only when it's ready. */
export function CatalogProvider({ children, loading, renderError }: CatalogProviderProps) {
  const [state, setState] = useState<CatalogState>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchCatalog(controller.signal)
      .then((catalog) => setState({ status: "ready", catalog }))
      .catch((error: Error) => {
        if (!controller.signal.aborted) setState({ status: "error", error })
      })
    return () => controller.abort()
  }, [attempt])

  if (state.status === "loading") return loading
  if (state.status === "error") {
    return renderError(state.error, () => {
      setState({ status: "loading" })
      setAttempt((count) => count + 1)
    })
  }

  return <CatalogContext.Provider value={state.catalog}>{children}</CatalogContext.Provider>
}
