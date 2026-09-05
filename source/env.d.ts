declare module 'cloudflare:workers' {
  export const env: Env
}

interface Env {
  GOOGLE_SEARCH_CONSOLE_CLIENT_ID?: string
  GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET?: string
  GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN?: string
  GOOGLE_SEARCH_CONSOLE_SITE_URL?: string
  METRICS_ACCESS_TOKEN?: string
}
