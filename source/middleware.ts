import { defineMiddleware } from 'astro:middleware'

const GONE_PATHS = new Set([
  '/chatgpt-agent-revolucion-openai/',
  '/chatgpt-image-generation-gpt-image-1/',
  '/ia-entrenamiento-pokemon/',
  '/openai-lanza-gpt-oss-novedades-2025/',
  '/tag/comet/',
  '/tag/hugging-face/',
  '/ultimas-novedades-claude-mythos-anthropic/',
])

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
  const pathname = new URL(context.request.url).pathname

  if (GONE_PATHS.has(pathname)) {
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
