import type { APIRoute } from 'astro'
import { env } from 'cloudflare:workers'

export const prerender = false

type Article = {
  title: string
  link: string
  source: string
}

export const GET: APIRoute = async () => {
  const key = env.NEWSDATA_API_KEY as string | undefined

  if (!key) {
    return new Response(JSON.stringify({ error: 'NEWSDATA_API_KEY not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  const url = new URL('https://newsdata.io/api/1/news')
  url.searchParams.set('apikey', key)
  url.searchParams.set('language', 'es')
  url.searchParams.set('category', 'technology')
  url.searchParams.set('removeduplicate', '1')
  url.searchParams.set('q', 'inteligencia artificial OR "modelo de lenguaje" OR LLM OR GPT OR agente autónomo OR machine learning')

  try {
    const res = await fetch(url.toString())

    if (!res.ok) {
      throw new Error(`NewsData.io responded ${res.status}`)
    }

    const data = await res.json() as { results?: Record<string, unknown>[] }

    const normalize = (t: string) =>
      t.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '').replace(/[^a-z0-9]/g, '')

    const seen = new Set<string>()
    const deduped: Record<string, unknown>[] = []

    for (const a of (data.results ?? [])) {
      const title = String(a.title ?? '')
      if (!title) continue
      const key = normalize(title).slice(0, 60)
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(a)
    }

    const articles: Article[] = deduped.slice(0, 12).map((a) => ({
      title: String(a.title ?? ''),
      link: (a.link && /^https?:\/\//i.test(String(a.link))) ? String(a.link) : '',
      source: String(a.source_id ?? ''),
    }))

    return new Response(JSON.stringify(articles), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=1800',
      },
    })
  } catch (error) {
    console.error('NewsData.io request failed:', error instanceof Error ? error.message : error)
    return new Response(JSON.stringify({
      error: 'NewsData.io request failed',
    }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })
  }
}
