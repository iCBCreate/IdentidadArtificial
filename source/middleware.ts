import { defineMiddleware } from 'astro:middleware'

// Páginas retiradas del sitio actual
const GONE_PATHS = new Set([
  '/chatgpt-agent-revolucion-openai/',
  '/chatgpt-image-generation-gpt-image-1/',
  '/ia-entrenamiento-pokemon/',
  '/openai-lanza-gpt-oss-novedades-2025/',
  '/tag/comet/',
  '/tag/hugging-face/',
  '/ultimas-novedades-claude-mythos-anthropic/',
  // Posts de la era WordPress que Google aún tiene indexados
  '/firebase-studio-crea-apps-rapidamente-con-ia/',
  '/chatgpt-5-un-modelo-para-dominarlos-a-todos/',
  '/la-paradoja-del-progreso-acelerado-como-el-avance/',
  // Posts eliminados — aparecían como "rastreada: sin indexar" en GSC
  '/ia-expendedora-san-francisco-projet-vend/',
  '/meta-refuerza-laboratorio-superinteligencia-fichajes-altman/',
  '/grok-4-nueva-frontera-inteligencia-artificial-comparativa/',
  '/chatgpt-5-novedades-lanzamiento-2025/',
  '/chatgpt-5-novedades-lanzamiento-2025',
  '/politica-de-cookies/',
  // Sitemaps WordPress legacy — Google sigue referenciando estos
  '/post-sitemap.xml',
  '/post_tag-sitemap.xml',
  '/page-sitemap.xml',
  // Tags de WordPress sin contenido en el sitio actual
  '/tag/programacion/',
  '/tag/microsoft/',
  '/tag/perplexity/',
  // Tags sin página — aparecían como "rastreada: sin indexar" en GSC
  '/tag/reflexion/',
  '/tag/agentes-de-ia/',
  '/tag/gemini/',
  '/tag/grok/',
  '/tag/chatgpt-agent/',
  '/tag/inteligencia-artificial/',
  '/tag/gpt-oss/',
  '/tag/ia/',
  // Categorías de WordPress
  '/category/actualidad-tecnologica/',
  // Legacy WordPress detectados en GSC (2026-07) — confirmados 404, se pasan a 410
  '/tag/openclaw/',
  '/tag/deepmind/',
  '/tag/claude-code/',
  '/tag/inversion/',
  '/tag/gpt-image-2/',
  '/comet-navegador-perplexity-analisis/',
  '/novedades-gemini-3-google/',
  '/ultimas-filtraciones-openai-agii/',
  '/chatgpt-5-novedades-2025/',
])

// Prefijos que nunca existirán en este sitio
const GONE_PREFIXES = [
  '/wp-content/',
  '/wp-admin/',
  '/wp-includes/',
  '/category/',
]

const GONE_HTML = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>410 Gone - Identidad Artificial</title>
  </head>
  <body>
    <main>
      <h1>410 Gone</h1>
      <p>Esta página ya no existe en Identidad Artificial.</p>
      <p><a href="/">Ir al inicio</a></p>
    </main>
  </body>
</html>`

const GLOBAL_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"

const EMBEDDINGS_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://cloudflareinsights.com https://huggingface.co https://*.huggingface.co https://*.hf.co; worker-src 'self' blob:; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"

const SECURITY_HEADERS = {
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url)

  if (url.hostname === 'www.identidadartificial.com') {
    url.hostname = 'identidadartificial.com'
    return Response.redirect(url.toString(), 301)
  }

  const pathname = url.pathname

  if (
    GONE_PATHS.has(pathname) ||
    GONE_PATHS.has(pathname.replace(/\/feed\/?$/, '/')) ||
    GONE_PREFIXES.some(prefix => pathname.startsWith(prefix))
  ) {
    return new Response(GONE_HTML, {
      status: 410,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    })
  }

  const response = await next()
  const headers = new Headers(response.headers)

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value)
  }

  headers.set(
    'content-security-policy',
    pathname.startsWith('/laboratorio/embeddings/') ? EMBEDDINGS_CSP : GLOBAL_CSP,
  )

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
})
