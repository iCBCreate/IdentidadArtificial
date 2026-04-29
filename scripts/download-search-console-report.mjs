import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ENV_PATH = '.dev.vars'
const OUT_DIR = 'reports'

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

const range = getDateRange()
const siteUrl = env.GOOGLE_SEARCH_CONSOLE_SITE_URL
const accessToken = await getAccessToken(env)
const rowLimit = Number(process.env.GSC_ROW_LIMIT ?? 2500)

const [pages, queries, pageQueries, devices] = await Promise.all([
  querySearchConsole({ accessToken, siteUrl, range, dimensions: ['page'], rowLimit }),
  querySearchConsole({ accessToken, siteUrl, range, dimensions: ['query'], rowLimit }),
  querySearchConsole({ accessToken, siteUrl, range, dimensions: ['page', 'query'], rowLimit }),
  querySearchConsole({ accessToken, siteUrl, range, dimensions: ['device'], rowLimit: 10 }),
])

const pageRows = toRows(pages.rows ?? [], ['page'])
const queryRows = toRows(queries.rows ?? [], ['query'])
const pageQueryRows = toRows(pageQueries.rows ?? [], ['page', 'query'])
const deviceRows = toRows(devices.rows ?? [], ['device'])

const report = {
  siteUrl,
  range,
  summary: summarize(pageRows),
  pages: pageRows,
  queries: queryRows,
  pageQueries: pageQueryRows,
  devices: deviceRows,
  recommendations: buildRecommendations(pageQueryRows),
}

mkdirSync(OUT_DIR, { recursive: true })
const stamp = `${range.startDate}_${range.endDate}`
const jsonPath = join(OUT_DIR, `search-console-${stamp}.json`)
const csvPath = join(OUT_DIR, `search-console-recommendations-${stamp}.csv`)

writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`)
writeFileSync(csvPath, toCsv(report.recommendations))

console.log(`Report written: ${jsonPath}`)
console.log(`Recommendations CSV written: ${csvPath}`)
console.log(`Summary: ${report.summary.clicks} clicks, ${report.summary.impressions} impressions, ${(report.summary.ctr * 100).toFixed(2)}% CTR, position ${report.summary.position.toFixed(1)}`)
console.log(`Recommendations: ${report.recommendations.length}`)

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

function getDateRange() {
  const endDate = process.env.GSC_END_DATE ?? formatDate(addDays(new Date(), -3))
  const startDate = process.env.GSC_START_DATE ?? formatDate(addDays(new Date(endDate), -27))
  return { startDate, endDate }
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDate(date) {
  return date.toISOString().slice(0, 10)
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

  if (!response.ok) {
    throw new Error(`Google OAuth token exchange failed: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  if (!data.access_token) {
    throw new Error('Google OAuth token exchange did not return an access token')
  }

  return data.access_token
}

async function querySearchConsole({ accessToken, siteUrl, range, dimensions, rowLimit }) {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      startDate: range.startDate,
      endDate: range.endDate,
      dimensions,
      rowLimit,
    }),
  })

  if (!response.ok) {
    throw new Error(`Search Console query failed: ${response.status} ${await response.text()}`)
  }

  return response.json()
}

function toRows(rows, dimensions) {
  return rows.map(row => {
    const out = {
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }

    dimensions.forEach((dimension, index) => {
      if (dimension === 'page') out.page = row.keys?.[index]
      if (dimension === 'query') out.query = row.keys?.[index]
      if (dimension === 'device') out.device = row.keys?.[index]
    })

    return out
  })
}

function summarize(rows) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.clicks += row.clicks
      acc.impressions += row.impressions
      acc.weightedPosition += row.position * row.impressions
      return acc
    },
    { clicks: 0, impressions: 0, weightedPosition: 0 }
  )

  return {
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
    position: totals.impressions > 0 ? totals.weightedPosition / totals.impressions : 0,
  }
}

function buildRecommendations(rows) {
  return rows
    .filter(row => row.impressions >= 50)
    .map(row => {
      if (row.position <= 12 && row.ctr < 0.015) {
        return recommendation(row, 'Alta', 'CTR bajo con visibilidad', 'Reescribir title/meta, alinear el primer bloque con la intención de búsqueda y añadir marcado estructurado si encaja.')
      }

      if (row.position > 3 && row.position <= 15 && row.impressions >= 100) {
        return recommendation(row, 'Media', 'Cerca de primera página', 'Ampliar el contenido que responde a esta query, mejorar enlazado interno y reforzar entidades relacionadas.')
      }

      if (row.position > 15 && row.impressions >= 100) {
        return recommendation(row, 'Baja', 'Impresiones sin ranking suficiente', 'Evaluar si merece una pieza nueva o una sección específica; ahora Google la muestra, pero todavía lejos.')
      }

      return null
    })
    .filter(Boolean)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 50)
}

function recommendation(row, priority, type, action) {
  return {
    priority,
    type,
    page: row.page,
    query: row.query,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
    action,
  }
}

function score(row) {
  const priority = row.priority === 'Alta' ? 3 : row.priority === 'Media' ? 2 : 1
  return priority * 1_000_000 + row.impressions - row.position * 100
}

function toCsv(rows) {
  const headers = ['priority', 'type', 'query', 'page', 'clicks', 'impressions', 'ctr', 'position', 'action']
  const lines = rows.map(row => headers.map(header => csvCell(String(row[header] ?? ''))).join(','))
  return `${[headers.join(','), ...lines].join('\n')}\n`
}

function csvCell(value) {
  return `"${value.replaceAll('"', '""')}"`
}
