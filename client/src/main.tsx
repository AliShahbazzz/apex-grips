import { createRoot } from "react-dom/client";
import App from "@/App";
import { StoreProvider } from "@/store/store-provider";
import "@/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StoreProvider>
    <App />
  </StoreProvider>,
);
