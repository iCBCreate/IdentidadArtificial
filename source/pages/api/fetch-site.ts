import type { APIRoute } from 'astro'

export const prerender = false

export function validateUrl(raw: string | null): URL | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:') return null
    const blocked = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.0|::1|::ffff:|fc[0-9a-f]{2}:|fd[0-9a-f]{2}:|fe80:)/i
    if (blocked.test(url.hostname)) return null
    return url
  } catch {
    return null
  }
}

interface SiteData {
  title: string
  description: string
  canonical: string
  lang: string
  navLinks: string[]
}

const CORS = {
  'Access-Control-Allow-Origin': 'https://identidadartificial.com',
  'Content-Type': 'application/json',
}

export const OPTIONS: APIRoute = () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://identidadartificial.com',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })

export const GET: APIRoute = async ({ request }) => {
  const rawUrl = new URL(request.url).searchParams.get('url')

  const url = validateUrl(rawUrl)
  if (!url) {
    return new Response(JSON.stringify({ error: 'URL inválida o no HTTPS' }), {
      status: 400,
      headers: CORS,
    })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(url.href, {
      signal: controller.signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'IdentidadArtificial-Bot/1.0', Accept: 'text/html' },
    })
    clearTimeout(timeout)

    if (response.status >= 300 && response.status < 400) {
      return new Response(JSON.stringify({ error: 'Redirects no permitidos' }), { status: 422, headers: CORS })
    }

    const data: SiteData = { title: '', description: '', canonical: url.href, lang: 'es', navLinks: [] }

    // @ts-ignore — HTMLRewriter is a Cloudflare Workers native API
    const rewriter = new HTMLRewriter()
      .on('title', { text(chunk: { text: string }) { if (chunk.text) data.title += chunk.text } })
      .on('meta[name="description"]', { element(el: { getAttribute(n: string): string | null }) { data.description = el.getAttribute('content') ?? '' } })
      .on('meta[property="og:title"]', { element(el: { getAttribute(n: string): string | null }) { if (!data.title) data.title = el.getAttribute('content') ?? '' } })
      .on('meta[property="og:description"]', { element(el: { getAttribute(n: string): string | null }) { if (!data.description) data.description = el.getAttribute('content') ?? '' } })
      .on('link[rel="canonical"]', { element(el: { getAttribute(n: string): string | null }) { data.canonical = el.getAttribute('href') ?? url.href } })
      .on('html', { element(el: { getAttribute(n: string): string | null }) { data.lang = el.getAttribute('lang') ?? 'es' } })
      .on('nav a[href]', {
        element(el: { getAttribute(n: string): string | null }) {
          if (data.navLinks.length >= 10) return
          const href = el.getAttribute('href') ?? ''
          if (!href || href.startsWith('#')) return
          try {
            const abs = new URL(href, url.href)
            if (abs.hostname === url.hostname) {
              const path = abs.pathname
              if (!data.navLinks.includes(path)) data.navLinks.push(path)
            }
          } catch { /* href malformado */ }
        },
      })

    await rewriter.transform(response).arrayBuffer()
    return new Response(JSON.stringify(data), { status: 200, headers: CORS })
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return new Response(JSON.stringify({ error: 'Timeout: el sitio tardó más de 8 segundos' }), { status: 408, headers: CORS })
    }
    return new Response(JSON.stringify({ error: 'No se pudo acceder al sitio' }), { status: 502, headers: CORS })
  }
}
