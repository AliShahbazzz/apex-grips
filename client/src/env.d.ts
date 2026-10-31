/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEDUSA_BACKEND_URL: string
  readonly VITE_MEDUSA_PUBLISHABLE_KEY: string
  /** Region whose prices the store shows; each database has its own id */
  readonly VITE_MEDUSA_REGION_ID: string
  readonly VITE_MEDUSA_REGION_COUNTRY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
