# Identidad Artificial

Blog técnico en español sobre IA generativa. El contenido lo generan modelos de IA con revisión humana obligatoria. La arquitectura, el proceso y los metadatos de cada post son públicos.

**Sitio:** [identidadartificial.com](https://identidadartificial.com)

---

## Stack

- **Astro 6** — output estático con JavaScript mínimo para interacción
- **Tailwind CSS v4** — estilos inlinados en build
- **MDX** — posts con frontmatter validado con Zod
- **Cloudflare Workers + Assets** — despliegue manual con wrangler
- **Sharp** — optimización de imágenes hero en build time (AVIF quality 30 + srcset); JPEG quality 75 para `og:image`
- **Satori + @resvg/resvg-js** — imágenes Open Graph de texto generadas en prebuild (fallback cuando no hay `heroImage`)

## Rendimiento web

- **View Transitions API** — crossfade suave entre páginas (cross-document, respeta `prefers-reduced-motion`)
- **Speculation Rules API** — prefetch `eager` + prerender `moderate` de enlaces internos para navegación casi instantánea
- **`fetchpriority="high"`** — priorización explícita de la imagen LCP en las cards destacadas
- **`font-size-adjust: from-font`** — elimina CLS al cargar Inter sincronizando el x-height con la fuente de respaldo
- **`text-wrap: balance/pretty`** — equilibrado de títulos y eliminación de huérfanos en párrafos
- **Sin forced reflow** — `visualViewport.width/height` en lugar de `window.innerWidth/Height` en `AITimeline.astro`; no fuerza layout flush en el critical path
- **AVIF quality 30** — ~30% menos peso que quality 50 en todas las imágenes hero (PostCard + PostLayout + global Sharp)
- **Aspect ratio alineado con contenedor** — PostCard genera imágenes a 800×310 (2.58:1) igualando el ratio del `.mona-card-img` (140px alto); elimina píxeles descartados por `object-fit: cover`

## Estructura

```
source/
  assets/post/         ← imágenes hero de los posts
  content/blog/        ← posts .mdx
  content/tutoriales/  ← tutoriales paso a paso .mdx
  components/          ← Header, Footer, PostCard, TransparencyBlock…
  data/generated/      ← artefactos IA generados en build-time
  layouts/             ← BaseLayout, PostLayout, GoneLayout
  middleware.ts        ← 301 www→non-www + 410 Gone para URLs retiradas, posts eliminados y tags sin página
  pages/               ← rutas del sitio
scripts/
  generate-og.mjs                      ← generador de OG images (prebuild)
  generate-knowledge-map.mjs           ← grafo semántico
  generate-post-insights.mjs           ← lecturas por artículo
  generate-editorial-radar.mjs         ← radar editorial
  google-search-console-oauth.mjs      ← autenticación GSC
  download-search-console-report.mjs   ← informe de tráfico GSC
  inspect-search-console-urls.mjs      ← inspección de indexación GSC
  submit-search-console-sitemap.mjs    ← envío de sitemap a GSC
  submit-indexnow.mjs                  ← envío IndexNow (Bing/Yandex); deriva URLs del sitemap en vivo
docs/
  guia-crear-post.md     ← instrucciones para generar posts
  guia-crear-tutorial.md ← instrucciones para generar tutoriales
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
npm run build    # build:data → OG images → astro build
npm run deploy   # build completo + wrangler deploy (manual)
```

El despliegue es **manual**: hay que ejecutar `npm run deploy` desde la CLI. El push a `main` no despliega automáticamente.

## SEO y GEO

El sitio implementa SEO técnico clásico y GEO (Generative Engine Optimization) para visibilidad en motores de respuesta:

**Schema.org por tipo de página:**
- Home: `WebSite` + `Organization` + `Blog` + `Person` (autor)
- Posts: `Article` con `author.sameAs` → LinkedIn + GitHub
- Tutoriales: `Article` con `articleSection: Tutorial` + `ItemList` en índice
- `/como-funciona/`: `TechArticle`
- `/mapa-ia/`: `Dataset`
- `/archivo/`: `CollectionPage` + `ItemList` completo
- `/radar/`: `CollectionPage` + `ItemList` de temas
- `/sobre/`: `Person` con `jobTitle`, `knowsAbout` y `sameAs`

**robots.txt:** todos los crawlers IA autorizados — GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended (Gemini training), OAI-SearchBot, Bytespider, Applebot-Extended, CCBot, anthropic-ai.

**IndexNow:** `scripts/submit-indexnow.mjs` notifica a Bing, Yandex y otros motores compatibles en cada despliegue. Las URLs se derivan en tiempo real del sitemap desplegado (`/sitemap-index.xml`), sin hardcoding — siempre en sync con lo publicado.

**llms.txt:** lista artículos individuales con descripciones. Declara permisos RSL 1.0 (indexing, training, citation required). Charset UTF-8 explícito vía `_headers`.

**llms-full.txt:** endpoint dinámico en `/source/pages/llms-full.txt.js` — genera el corpus completo con texto íntegro de cada post en runtime.

**Sitemap:** `lastmod` real de cada archivo fuente, excluye páginas legales y paginación, detecta subdirectorios (`tutoriales/index.astro`) vía `addSubdirectoryIndexFiles`.

## Ticker de noticias IA en tiempo real

El home incluye un ticker estilo Wall Street entre el hero y el timeline de modelos. Muestra titulares reales de IA en español obtenidos de NewsData.io.

**Arquitectura:**
- `source/pages/api/news-ticker.json.ts` — endpoint CF Worker con `prerender = false`. Llama a NewsData.io (`language=es`, `category=technology`), cachea la respuesta 30 minutos en el edge.
- `source/components/NewsTicker.astro` — marquee CSS continuo (`translateX 0 → -50%` con contenido duplicado para loop seamless). JS en cliente fetcha `/api/news-ticker.json` y rellena el track. Fallback estático si la API falla. Respeta `prefers-reduced-motion`.

**Secret requerido en producción:**
```bash
npx wrangler secret put NEWSDATA_API_KEY
```

Para desarrollo local, añadir `NEWSDATA_API_KEY=<key>` a `.dev.vars`.

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

Si `npm run gsc:oauth` devuelve `redirect_uri_mismatch`, registra en el cliente OAuth de Google Cloud la URI indicada por el script. Por defecto es `http://127.0.0.1:8787/oauth2callback`; si el cliente ya tiene otra URI local autorizada, configúrala en `.dev.vars` con `GOOGLE_SEARCH_CONSOLE_REDIRECT_URI`.

## Crear un post

Lee [`docs/guia-crear-post.md`](docs/guia-crear-post.md). Cualquier modelo de IA puede seguir esa guía para producir posts compatibles con el formato del blog.

## Transparencia

Cada post incluye un bloque con el modelo que lo generó, la fecha, el prompt base y si fue revisado por un humano. Si un post corrige errores de una versión anterior, el motivo queda visible en el mismo post mediante el campo `correctionNote`.
