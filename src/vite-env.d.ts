/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_REGION: string
  readonly VITE_APP_USER_POOL_ID: string
  readonly VITE_APP_USER_POOL_CLIENT_ID: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
