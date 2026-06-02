// functions/api/fetch-site.ts

export function validateUrl(raw: string | null): URL | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:') return null
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

export async function onRequest(context: { request: Request; env: Record<string, string> }): Promise<Response> {
  const { request } = context
  const incoming = new URL(request.url)
  const rawUrl = incoming.searchParams.get('url')

  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://identidadartificial.com',
    'Content-Type': 'application/json',
  }

  const url = validateUrl(rawUrl)
  if (!url) {
    return new Response(JSON.stringify({ error: 'URL inválida o no HTTPS' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(url.href, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'IdentidadArtificial-Bot/1.0',
        Accept: 'text/html',
      },
    })
    clearTimeout(timeout)

    const data: SiteData = {
      title: '',
      description: '',
      canonical: url.href,
      lang: 'es',
      navLinks: [],
    }

    // @ts-ignore — HTMLRewriter is a Cloudflare Workers native API, not available in Node.js types
    const rewriter = new HTMLRewriter()
      .on('title', {
        text(chunk: { text: string }) {
          if (chunk.text) data.title += chunk.text
        },
      })
      .on('meta[name="description"]', {
        element(el: { getAttribute(name: string): string | null }) {
          data.description = el.getAttribute('content') ?? ''
        },
      })
      .on('meta[property="og:title"]', {
        element(el: { getAttribute(name: string): string | null }) {
          if (!data.title) data.title = el.getAttribute('content') ?? ''
        },
      })
      .on('meta[property="og:description"]', {
        element(el: { getAttribute(name: string): string | null }) {
          if (!data.description) data.description = el.getAttribute('content') ?? ''
        },
      })
      .on('link[rel="canonical"]', {
        element(el: { getAttribute(name: string): string | null }) {
          data.canonical = el.getAttribute('href') ?? url.href
        },
      })
      .on('html', {
        element(el: { getAttribute(name: string): string | null }) {
          data.lang = el.getAttribute('lang') ?? 'es'
        },
      })
      .on('nav a[href]', {
        element(el: { getAttribute(name: string): string | null }) {
          if (data.navLinks.length >= 10) return
          const href = el.getAttribute('href') ?? ''
          if (!href || href.startsWith('#')) return
          try {
            const abs = new URL(href, url.href)
            if (abs.hostname === url.hostname) {
              const path = abs.pathname
              if (!data.navLinks.includes(path)) data.navLinks.push(path)
            }
          } catch {
            // href malformado — ignorar
          }
        },
      })

    await rewriter.transform(response).arrayBuffer()

    return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders })
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return new Response(JSON.stringify({ error: 'Timeout: el sitio tardó más de 8 segundos' }), {
        status: 408,
        headers: corsHeaders,
      })
    }
    return new Response(JSON.stringify({ error: 'No se pudo acceder al sitio' }), {
      status: 502,
      headers: corsHeaders,
    })
  }
}
