import { createRoot } from "react-dom/client";
import App from "@/App";
import { CatalogProvider } from "@/catalog/catalog-provider";
import { CatalogError, CatalogLoading } from "@/sections/feedback/catalog-status";
import { StoreProvider } from "@/store/store-provider";
import "@/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <CatalogProvider
    loading={<CatalogLoading />}
    renderError={(error, retry) => <CatalogError error={error} onRetry={retry} />}
  >
    <StoreProvider>
      <App />
    </StoreProvider>
  </CatalogProvider>,
);
