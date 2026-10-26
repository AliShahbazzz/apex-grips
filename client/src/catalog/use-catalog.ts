import { useContext } from "react"
import { CatalogContext } from "@/catalog/context"

export function useCatalog() {
  const catalog = useContext(CatalogContext)
  if (!catalog) {
    throw new Error("useCatalog must be used inside <CatalogProvider>")
  }
  return catalog
}
