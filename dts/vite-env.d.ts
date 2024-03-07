/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Define your environment variables here
  readonly VITE_RELEASE_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
