/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CAR_ANALYTICS_ENABLED?: string;
  readonly VITE_CAR_ANALYTICS_ENABLE_LOCAL?: string;
  readonly VITE_CAR_ANALYTICS_ORIGIN?: string;
  readonly VITE_READ_FIND_SERVICE_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
