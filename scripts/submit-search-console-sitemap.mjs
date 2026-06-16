import { getAccessToken, readEnv } from './lib/google-service-account.mjs'

const ENV_PATH = '.dev.vars'
const DEFAULT_SITEMAP_URL = 'https://identidadartificial.com/sitemap-index.xml'

const env = readEnv(ENV_PATH)
const required = ['GOOGLE_SEARCH_CONSOLE_SITE_URL']

const missing = required.filter(key => !env[key])
if (missing.length > 0) {
  throw new Error(`Missing required values in ${ENV_PATH}: ${missing.join(', ')}`)
}

const sitemapUrl = process.env.GSC_SITEMAP_URL ?? DEFAULT_SITEMAP_URL
const accessToken = await getAccessToken(env)
await submitSitemap({
  accessToken,
  siteUrl: env.GOOGLE_SEARCH_CONSOLE_SITE_URL,
  sitemapUrl,
})

console.log(`Sitemap submitted to Search Console: ${sitemapUrl}`)

async function submitSitemap({ accessToken, siteUrl, sitemapUrl }) {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Search Console sitemap submit failed: ${response.status} ${await response.text()}`)
  }
}
