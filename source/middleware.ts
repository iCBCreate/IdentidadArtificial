import { defineMiddleware } from 'astro:middleware'
import { isRetiredPath } from './lib/content-policy.mjs'

// Páginas retiradas del sitio actual
const GONE_HTML = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Contenido retirado - Identidad Artificial</title>
    <meta name="robots" content="noindex, follow">
  </head>
  <body>
    <main>
      <h1>Este contenido se ha retirado</h1>
      <p>Esta página ya no existe en Identidad Artificial.</p>
      <p><a href="/archivo/">Explorar los artículos</a></p>
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

  if (isRetiredPath(pathname)) {
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
