import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAccessToken, readEnv } from './lib/google-service-account.mjs'

const ENV_PATH = '.dev.vars'
const OUT_DIR = 'reports'
const TIMEOUT_MS = Number(process.env.GSC_INSPECTION_TIMEOUT_MS ?? 15000)
const DELAY_MS = normalizeInspectionDelay(process.env.GSC_INSPECTION_DELAY_MS ?? 1100)

export function normalizeInspectionDelay(value) {
  const delay = Number(value)
  if (!Number.isFinite(delay)) {
    throw new Error('GSC_INSPECTION_DELAY_MS must be a finite number of milliseconds.')
  }
  return Math.max(250, delay)
}

export function getInspectionOutputPath(environment = process.env) {
  const outPath = environment.GSC_INSPECTION_OUTPUT_PATH ?? `${OUT_DIR}/url-inspection.json`
  if (!/\.json$/i.test(outPath)) {
    throw new Error('GSC_INSPECTION_OUTPUT_PATH must end with .json so the Markdown summary uses a separate path.')
  }
  return outPath
}

function asHttpsOrigin(value, variableName) {
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`${variableName} must be a valid HTTPS origin.`)
  }
  if (parsed.protocol !== 'https:') throw new Error(`${variableName} must use HTTPS.`)
  return parsed.origin
}

export function getSiteOrigin(siteUrl, environment = process.env) {
  if (environment.GSC_SITE_ORIGIN) return asHttpsOrigin(environment.GSC_SITE_ORIGIN, 'GSC_SITE_ORIGIN')
  if (siteUrl.startsWith('sc-domain:')) {
    return asHttpsOrigin(`https://${siteUrl.slice('sc-domain:'.length)}`, 'GOOGLE_SEARCH_CONSOLE_SITE_URL')
  }
  return asHttpsOrigin(siteUrl, 'GOOGLE_SEARCH_CONSOLE_SITE_URL')
}

export function getSitemapSource(siteUrl, environment = process.env) {
  if (environment.GSC_SITEMAP_PATH) return { type: 'local', value: environment.GSC_SITEMAP_PATH }
  return {
    type: 'published',
    value: assertSameOriginSitemapUrl(
      environment.GSC_SITEMAP_URL ?? `${new URL(siteUrl).origin}/sitemap-index.xml`,
      siteUrl,
    ),
  }
}

function assertSameOriginSitemapUrl(location, siteUrl) {
  let parsed
  try {
    parsed = new URL(location)
  } catch {
    throw new Error(`Invalid sitemap URL: ${location}`)
  }
  if (parsed.origin !== new URL(siteUrl).origin) {
    throw new Error(`Sitemap URL is outside the configured Search Console origin: ${location}`)
  }
  return parsed.href
}

export function extractSitemapUrls(sitemap, siteUrl) {
  const urls = []

  for (const match of sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
    urls.push(assertSameOriginSitemapUrl(decodeXmlEntities(match[1].trim()), siteUrl))
  }

  return [...new Set(urls)].sort()
}

function decodeXmlEntities(value) {
  const namedEntities = { amp: '&', apos: "'", gt: '>', lt: '<', quot: '"' }
  return value.replace(/&(amp|apos|gt|lt|quot|#\d+|#x[\da-f]+);/gi, (_, entity) => {
    if (entity[0] !== '#') return namedEntities[entity.toLowerCase()]

    const hexadecimal = entity[1].toLowerCase() === 'x'
    const codePoint = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10)
    return String.fromCodePoint(codePoint)
  })
}

export function getPendingUrls(urls, existingResults) {
  const finalUrls = new Set(
    (existingResults ?? [])
      .filter(result => result?.url && !isRetryableInspectionError(result))
      .map(result => result.url),
  )
  return [...new Set(urls)].filter(url => !finalUrls.has(url)).sort()
}

export function groupInspectionResults(results) {
  const groups = { indexed: [], notIndexed: [], errors: [], unknown: [] }

  for (const result of results ?? []) {
    if (!result?.url) continue
    const coverage = result.coverageState?.toLowerCase() ?? ''
    if (result.error) groups.errors.push(result.url)
    else if (coverage.includes('not indexed')) groups.notIndexed.push(result.url)
    else if (coverage.includes('indexed')) groups.indexed.push(result.url)
    else groups.unknown.push(result.url)
  }

  for (const urls of Object.values(groups)) urls.sort()
  return groups
}

export function renderInspectionSummary(groups) {
  const sections = [
    ['Indexadas', groups.indexed],
    ['No indexadas', groups.notIndexed],
    ['Errores', groups.errors],
    ['Sin clasificar', groups.unknown],
  ]

  return `${sections.map(([title, urls]) => [
    `## ${title} (${urls.length})`,
    ...(urls.length ? urls.map(url => `- ${url}`) : ['- Ninguna']),
  ].join('\n')).join('\n\n')}\n`
}

async function loadPublishedSitemapUrls({ siteUrl, sitemapUrl }) {
  const rootSitemap = await fetchText(sitemapUrl)
  const rootUrls = extractSitemapUrls(rootSitemap, siteUrl)
  if (!/<sitemapindex\b/i.test(rootSitemap)) return rootUrls

  const urls = []
  for (const childSitemapUrl of rootUrls) {
    urls.push(...extractSitemapUrls(await fetchText(childSitemapUrl), siteUrl))
  }
  return [...new Set(urls)].sort()
}

function loadLocalSitemapUrls({ siteUrl, sitemapPath }) {
  const rootSitemap = readFileSync(sitemapPath, 'utf8')
  const rootUrls = extractSitemapUrls(rootSitemap, siteUrl)
  if (!/<sitemapindex\b/i.test(rootSitemap)) return rootUrls

  const urls = []
  for (const childSitemapUrl of rootUrls) {
    const childPath = resolve(dirname(sitemapPath), `.${new URL(childSitemapUrl).pathname}`)
    if (!existsSync(childPath)) throw new Error(`Local child sitemap does not exist: ${childPath}`)
    urls.push(...extractSitemapUrls(readFileSync(childPath, 'utf8'), siteUrl))
  }
  return [...new Set(urls)].sort()
}

export async function discoverInspectionUrls({ siteUrl, localSitemapPath, sitemapUrl }) {
  if (localSitemapPath) {
    if (!existsSync(localSitemapPath)) {
      throw new Error(`Local sitemap override does not exist: ${localSitemapPath}`)
    }
    return loadLocalSitemapUrls({ siteUrl, sitemapPath: localSitemapPath })
  }
  return loadPublishedSitemapUrls({ siteUrl, sitemapUrl })
}

function dedupeResults(results) {
  const unique = new Map()
  for (const result of results ?? []) {
    if (result?.url) unique.set(result.url, result)
  }
  return [...unique.values()]
}

function isRetryableInspectionError(result) {
  if (typeof result?.error !== 'string') return false
  return /\b(?:timeout(?:error)?|timed out|network error|network request failed|fetch failed|(?:operation|request) (?:was )?aborted|aborterror)\b/i.test(result.error)
}

export function readExistingResults(outPath) {
  if (!existsSync(outPath)) return []
  const report = JSON.parse(readFileSync(outPath, 'utf8'))
  const results = Array.isArray(report) ? report : report.results
  if (!Array.isArray(results)) throw new Error(`Inspection output has no results array: ${outPath}`)
  return dedupeResults(results)
}

export function writeReports({ outPath, siteUrl, sitemapSource, results }) {
  const sortedResults = dedupeResults(results).sort((a, b) => a.url.localeCompare(b.url))
  writeFileAtomically(outPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    siteUrl,
    sitemapSource,
    results: sortedResults,
  }, null, 2)}\n`)
  writeFileAtomically(outPath.replace(/\.json$/i, '.md'), renderInspectionSummary(groupInspectionResults(sortedResults)))
}

function writeFileAtomically(path, content) {
  const temporaryPath = `${path}.${process.pid}.${randomUUID()}.tmp`
  try {
    writeFileSync(temporaryPath, content)
    renameSync(temporaryPath, path)
  } finally {
    try {
      if (existsSync(temporaryPath)) unlinkSync(temporaryPath)
    } catch {
      // Preserve the original write or rename failure; this only targets our own temporary file.
    }
  }
}

async function run() {
  const env = { ...process.env, ...readEnv(ENV_PATH) }
  const gscSiteUrl = env.GOOGLE_SEARCH_CONSOLE_SITE_URL
  if (!gscSiteUrl) throw new Error('GOOGLE_SEARCH_CONSOLE_SITE_URL is required.')
  const siteOrigin = getSiteOrigin(gscSiteUrl, env)

  const outPath = getInspectionOutputPath(env)
  const sitemapSource = getSitemapSource(siteOrigin, env)
  const urls = await discoverInspectionUrls({
    siteUrl: siteOrigin,
    localSitemapPath: sitemapSource.type === 'local' ? sitemapSource.value : undefined,
    sitemapUrl: sitemapSource.type === 'published' ? sitemapSource.value : undefined,
  })
  if (urls.length === 0) throw new Error(`No URLs found in sitemap: ${sitemapSource.value}`)

  mkdirSync(dirname(outPath), { recursive: true })
  const results = readExistingResults(outPath)
  const pendingUrls = getPendingUrls(urls, results)
  if (pendingUrls.length === 0) {
    writeReports({ outPath, siteUrl: gscSiteUrl, sitemapSource: sitemapSource.value, results })
    console.log(`All ${results.length} sitemap URLs are already present in: ${outPath}`)
    return
  }

  const accessToken = await getAccessToken(env)
  for (const [index, url] of pendingUrls.entries()) {
    process.stdout.write(`[${index + 1}/${pendingUrls.length}] ${url} ... `)
    const result = await inspectUrl({ accessToken, siteUrl: gscSiteUrl, url })
    results.push(result)
    writeReports({ outPath, siteUrl: gscSiteUrl, sitemapSource: sitemapSource.value, results })
    console.log(result.error ? `ERROR ${result.error}` : `${result.verdict ?? 'UNKNOWN'} - ${result.coverageState ?? 'no coverage state'}`)
    if (index < pendingUrls.length - 1) await delay(DELAY_MS)
  }

  console.log(`Inspection JSON report written: ${outPath}`)
  console.log(`Inspection Markdown summary written: ${outPath.replace(/\.json$/i, '.md')}`)
}

async function inspectUrl({ accessToken, siteUrl, url }) {
  try {
    const response = await fetchWithTimeout('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({ inspectionUrl: url, siteUrl }),
    })
    const data = await response.json()
    if (!response.ok) return { url, error: data.error?.message ?? JSON.stringify(data) }

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
    return { url, error: error instanceof Error ? error.message : String(error) }
  }
}

async function fetchText(url) {
  const response = await fetchWithTimeout(url)
  if (!response.ok) throw new Error(`Could not fetch published sitemap ${url}: HTTP ${response.status}`)
  return response.text()
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
