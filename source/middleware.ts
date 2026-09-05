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

  return next()
})
