/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTINEL_CLIENT_ID?: string;
  readonly VITE_SENTINEL_CLIENT_SECRET?: string;
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
