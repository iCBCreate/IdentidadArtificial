import type { APIRoute } from 'astro'
import { env } from 'cloudflare:workers'

export const prerender = false

type SearchConsoleRow = {
  keys?: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

type MetricRow = {
  page?: string
  query?: string
  device?: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

type Recommendation = {
  priority: 'Alta' | 'Media' | 'Baja'
  type: string
  page?: string
  query?: string
  clicks: number
  impressions: number
  ctr: number
  position: number
  action: string
}

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'private, no-store',
}

export const GET: APIRoute = async ({ request }) => {
  const auth = request.headers.get('authorization') ?? ''
  const expectedToken = env.METRICS_ACCESS_TOKEN

  if (!expectedToken || auth !== `Bearer ${expectedToken}`) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const missing = [
    'GOOGLE_SEARCH_CONSOLE_CLIENT_ID',
    'GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET',
    'GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN',
    'GOOGLE_SEARCH_CONSOLE_SITE_URL',
  ].filter(key => !env[key as keyof Env])

  if (missing.length > 0) {
    return json({ error: 'Missing environment variables', missing }, 500)
  }

  try {
    const url = new URL(request.url)
    const range = getDateRange(url)
    const rowLimit = clampNumber(Number(url.searchParams.get('rowLimit') ?? 2500), 100, 25000)
    const siteUrl = env.GOOGLE_SEARCH_CONSOLE_SITE_URL as string
    const accessToken = await getAccessToken()

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

    return json({
      siteUrl,
      range,
      summary: summarize(pageRows),
      pages: pageRows,
      queries: queryRows,
      pageQueries: pageQueryRows,
      devices: deviceRows,
      recommendations: buildRecommendations(pageQueryRows),
    })
  } catch (error) {
    return json({
      error: 'Search Console request failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
    }, 502)
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

function getDateRange(url: URL) {
  const today = new Date()
  const defaultEnd = addDays(today, -3)
  const defaultStart = addDays(defaultEnd, -27)
  const startDate = validDate(url.searchParams.get('startDate')) ?? formatDate(defaultStart)
  const endDate = validDate(url.searchParams.get('endDate')) ?? formatDate(defaultEnd)

  return startDate <= endDate
    ? { startDate, endDate }
    : { startDate: endDate, endDate: startDate }
}

function validDate(value: string | null): string | null {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.min(max, Math.round(value)))
}

async function getAccessToken(): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID as string,
      client_secret: env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET as string,
      refresh_token: env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN as string,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error(`Google OAuth token exchange failed: ${response.status}`)
  }

  const data = await response.json() as { access_token?: string }
  if (!data.access_token) {
    throw new Error('Google OAuth token exchange did not return an access token')
  }

  return data.access_token
}

async function querySearchConsole({
  accessToken,
  siteUrl,
  range,
  dimensions,
  rowLimit,
}: {
  accessToken: string
  siteUrl: string
  range: { startDate: string; endDate: string }
  dimensions: string[]
  rowLimit: number
}): Promise<{ rows?: SearchConsoleRow[] }> {
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
    const detail = await response.text()
    throw new Error(`Search Console query failed: ${response.status} ${detail}`)
  }

  return response.json()
}

function toRows(rows: SearchConsoleRow[], dimensions: string[]): MetricRow[] {
  return rows.map(row => {
    const out: MetricRow = {
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

function summarize(rows: MetricRow[]) {
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

function buildRecommendations(rows: MetricRow[]): Recommendation[] {
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
    .filter((item): item is Recommendation => item !== null)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 50)
}

function recommendation(
  row: MetricRow,
  priority: Recommendation['priority'],
  type: string,
  action: string
): Recommendation {
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

function score(row: Recommendation): number {
  const priority = row.priority === 'Alta' ? 3 : row.priority === 'Media' ? 2 : 1
  return priority * 1_000_000 + row.impressions - row.position * 100
}
