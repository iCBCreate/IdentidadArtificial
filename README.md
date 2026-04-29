# Identidad Artificial

Blog técnico en español sobre IA generativa. El contenido lo generan modelos de IA con revisión humana obligatoria. La arquitectura, el proceso y los metadatos de cada post son públicos.

**Sitio:** [identidadartificial.com](https://identidadartificial.com)

---

## Stack

- **Astro 6** — output estático con JavaScript mínimo para interacción
- **Tailwind CSS v4** — estilos inlinados en build
- **MDX** — posts con frontmatter validado con Zod
- **Cloudflare Workers + Assets** — despliegue automático en cada push a `main`
- **Sharp** — optimización de imágenes hero en build time (WebP + srcset)
- **Satori + @resvg/resvg-js** — imágenes Open Graph generadas en prebuild

## Estructura

```
source/
  assets/post/       ← imágenes hero de los posts
  content/blog/      ← posts .mdx
  components/        ← Header, Footer, PostCard, TransparencyBlock…
  layouts/           ← BaseLayout, PostLayout
  pages/             ← rutas del sitio
scripts/
  generate-og.mjs    ← generador de OG images (prebuild)
docs/
  guia-crear-post.md ← instrucciones para generar posts con cualquier modelo
public/
  fonts/             ← Inter TTF para satori
  _headers           ← cabeceras de seguridad para Cloudflare
wrangler.toml
astro.config.mjs
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Build y despliegue

```bash
npm run build   # genera OG images + compila Astro
```

El push a `main` desencadena el build y despliegue automático en Cloudflare.

## Métricas privadas

La ruta `/metricas/` permite consultar Search Console desde la web y descargar un informe JSON/CSV. Las credenciales no se exponen al navegador: viven como variables del Worker.

Para desarrollo local, copia `.dev.vars.example` a `.dev.vars` y completa los valores. Para producción, guarda los secretos en Cloudflare:

```bash
npx wrangler secret put GOOGLE_SEARCH_CONSOLE_CLIENT_ID
npx wrangler secret put GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET
npx wrangler secret put GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN
npx wrangler secret put METRICS_ACCESS_TOKEN
```

`GOOGLE_SEARCH_CONSOLE_SITE_URL` no es secreto; puede ir en `.dev.vars` o en `[vars]` de `wrangler.toml`.

## Crear un post

Lee [`docs/guia-crear-post.md`](docs/guia-crear-post.md). Cualquier modelo de IA puede seguir esa guía para producir posts compatibles con el formato del blog.

## Transparencia

Cada post incluye un bloque con el modelo que lo generó, la fecha, el prompt base y si fue revisado por un humano. Si un post corrige errores de una versión anterior, el motivo queda visible en el mismo post mediante el campo `correctionNote`.
