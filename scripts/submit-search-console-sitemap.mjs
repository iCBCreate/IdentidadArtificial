import { existsSync, readFileSync } from 'node:fs'

const ENV_PATH = '.dev.vars'
const DEFAULT_SITEMAP_URL = 'https://identidadartificial.com/sitemap-index.xml'

const env = readEnv(ENV_PATH)
const required = [
  'GOOGLE_SEARCH_CONSOLE_CLIENT_ID',
  'GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET',
  'GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN',
  'GOOGLE_SEARCH_CONSOLE_SITE_URL',
]

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

function readEnv(path) {
  if (!existsSync(path)) return {}

  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        const index = line.indexOf('=')
        return [line.slice(0, index), line.slice(index + 1)]
      })
  )
}

async function getAccessToken(values) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: values.GOOGLE_SEARCH_CONSOLE_CLIENT_ID,
      client_secret: values.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET,
      refresh_token: values.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(`Google OAuth token exchange failed: ${response.status} ${JSON.stringify(data)}`)
  }

  return data.access_token
}

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
