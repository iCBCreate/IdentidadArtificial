import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ENV_PATH = '.dev.vars'
const REPORT_PATH = process.env.GSC_REPORT_PATH ?? 'reports/search-console-2026-03-29_2026-04-25.json'
const SITEMAP_PATH = process.env.GSC_SITEMAP_PATH ?? 'dist/client/sitemap-0.xml'
const OUT_DIR = 'reports'
const OUT_PATH = join(OUT_DIR, `url-inspection-${new Date().toISOString().slice(0, 10)}.json`)
const TIMEOUT_MS = Number(process.env.GSC_INSPECTION_TIMEOUT_MS ?? 15000)

const env = readEnv(ENV_PATH)
const report = existsSync(REPORT_PATH) ? JSON.parse(readFileSync(REPORT_PATH, 'utf8')) : { pages: [] }
const sitemap = existsSync(SITEMAP_PATH) ? readFileSync(SITEMAP_PATH, 'utf8') : ''
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
const performanceUrls = (report.pages ?? []).map(page => page.page).filter(Boolean)
const urls = [...new Set([...sitemapUrls, ...performanceUrls])].sort()

if (urls.length === 0) {
  throw new Error('No URLs found to inspect. Build the site and download a Search Console report first.')
}

mkdirSync(OUT_DIR, { recursive: true })

const accessToken = await getAccessToken(env)
const results = []

for (const [index, url] of urls.entries()) {
  process.stdout.write(`[${index + 1}/${urls.length}] ${url} ... `)
  const result = await inspectUrl({ accessToken, siteUrl: env.GOOGLE_SEARCH_CONSOLE_SITE_URL, url })
  results.push(result)
  writeFileSync(OUT_PATH, `${JSON.stringify(results, null, 2)}\n`)
  console.log(result.error ? `ERROR ${result.error}` : `${result.verdict ?? 'UNKNOWN'} - ${result.coverageState ?? 'no coverage state'}`)
  await delay(250)
}

console.log(`Inspection report written: ${OUT_PATH}`)

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
  const response = await fetchWithTimeout('https://oauth2.googleapis.com/token', {
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

async function inspectUrl({ accessToken, siteUrl, url }) {
  try {
    const response = await fetchWithTimeout('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        inspectionUrl: url,
        siteUrl,
      }),
    })
    const data = await response.json()

    if (!response.ok) {
      return {
        url,
        error: data.error?.message ?? JSON.stringify(data),
      }
    }

    const index = data.inspectionResult?.indexStatusResult ?? {}
    const mobile = data.inspectionResult?.mobileUsabilityResult ?? {}
    const rich = data.inspectionResult?.richResultsResult ?? {}

    return {
      url,
      verdict: index.verdict,
      coverageState: index.coverageState,
      robotsTxtState: index.robotsTxtState,
      indexingState: index.indexingState,
      pageFetchState: index.pageFetchState,
      lastCrawlTime: index.lastCrawlTime,
      crawledAs: index.crawledAs,
      googleCanonical: index.googleCanonical,
      userCanonical: index.userCanonical,
      sitemap: index.sitemap,
      referringUrls: index.referringUrls,
      mobileVerdict: mobile.verdict,
      richResultsVerdict: rich.verdict,
    }
  } catch (error) {
    return {
      url,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
