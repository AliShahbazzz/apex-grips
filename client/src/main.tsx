import { createRoot } from "react-dom/client";
import App from "@/App";
import { AuthProvider } from "@/auth/auth-provider";
import { CatalogProvider } from "@/catalog/catalog-provider";
import { CatalogError, CatalogLoading } from "@/sections/feedback/catalog-status";
import { StoreProvider } from "@/store/store-provider";
import "@/styles/index.css";

createRoot(document.getElementById("root")!).render(
  // Outside the catalog gate so the saved session restores while products load
  <AuthProvider>
    <CatalogProvider
      loading={<CatalogLoading />}
      renderError={(error, retry) => <CatalogError error={error} onRetry={retry} />}
    >
      <StoreProvider>
        <App />
      </StoreProvider>
    </CatalogProvider>
  </AuthProvider>,
);
