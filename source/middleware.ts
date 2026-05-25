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
  // Tags de WordPress
  '/tag/chatgpt/',
  '/tag/programacion/',
  '/tag/microsoft/',
  '/tag/anthropyc/',
  // Categorías de WordPress
  '/category/actualidad-tecnologica/',
])

// Prefijos de WordPress que nunca existirán en este sitio
const GONE_PREFIXES = [
  '/wp-content/',
  '/wp-admin/',
  '/wp-includes/',
]

const GONE_HTML = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
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
        'x-robots-tag': 'noindex, nofollow',
        'cache-control': 'public, max-age=3600',
      },
    })
  }

  return next()
})
