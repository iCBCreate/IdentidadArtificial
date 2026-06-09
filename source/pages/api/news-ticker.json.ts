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
  url.searchParams.set('q', 'inteligencia artificial OR IA OR LLM OR modelo de lenguaje')

  try {
    const res = await fetch(url.toString())

    if (!res.ok) {
      throw new Error(`NewsData.io responded ${res.status}`)
    }

    const data = await res.json() as { results?: Record<string, unknown>[] }
    const articles: Article[] = (data.results ?? []).slice(0, 12).map((a) => ({
      title: String(a.title ?? ''),
      link: (a.link && /^https?:\/\//i.test(String(a.link))) ? String(a.link) : '',
      source: String(a.source_id ?? ''),
    })).filter(a => a.title)

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
