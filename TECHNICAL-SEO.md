# Technical SEO Audit — identidadartificial.com

**Fecha del análisis:** 2026-06-01  
**Dominio:** https://identidadartificial.com  
**Stack:** Astro 6 · Cloudflare Workers · Output estático

---

## Technical Score: 88 / 100

| Categoría | Estado | Score |
|-----------|--------|-------|
| Crawlability | ✅ pass | 18/20 |
| Indexability | ✅ pass | 18/20 |
| Security | ✅ pass | 20/20 |
| URL Structure | ✅ pass | 18/20 |
| Mobile | ✅ pass | 20/20 |
| Core Web Vitals | ✅ pass | 17/20 (estimado, sin datos CrUX) |
| Structured Data | ✅ pass | 20/20 |
| JS Rendering | ✅ pass | 20/20 |
| IndexNow | ❌ fail | 0/10 |

---

## Análisis de Google Search Console (2026-05-29)

Basado en `reports/url-inspection-2026-05-29.json`:

| Categoría | URLs | Estado |
|-----------|------|--------|
| Submitted and indexed | 19 | ✅ |
| Excluded by noindex (intencionado) | 6 | ✅ correcto |
| Crawled - not indexed | 1 | ⏳ claude-opus-4-8 (muy reciente) |
| Discovered - not indexed | 2 | ⏳ tutoriales (pendiente de rastreo) |
| URL unknown to Google | 18 | ⚠️ categorías + tags nuevos (en sitemap, no rastreados aún) |
| Not found (404) | 1 | ⚠️ /tag/chatgpt/ (ver nota) |

**Nota /tag/chatgpt/:** El middleware devuelve 410 para esta URL (está en `GONE_PATHS`). El estado 404 en GSC es caché de 2026-05-25, anterior al despliegue actual. Se resolverá en el próximo rastreo de Google.

---

## 1. Crawlability

### robots.txt
```
User-agent: *
Allow: /
Sitemap: https://identidadartificial.com/sitemap-index.xml
```
- ✅ No bloquea ningún recurso importante
- ✅ 10 crawlers AI explícitamente permitidos (GPTBot, ClaudeBot, PerplexityBot, etc.)
- ✅ Sitemap referenciado

### Sitemap XML
- ✅ `/sitemap-index.xml` + `/sitemap-0.xml` generados por `@astrojs/sitemap`
- ✅ 37 URLs indexadas (18 posts + 3 tutoriales + 6 categorías + 14 tags + páginas estáticas)
- ✅ `lastmod` real de cada archivo fuente (no fecha de build)
- ✅ Excluye: paginación, legales, posts retirados, `/metricas/`
- ⚠️ Páginas de categoría sin `lastmod` (solo los posts lo tienen)

### Profundidad de rastreo
- Homepage → Post: 1 clic ✅
- Homepage → Categoría: 1 clic ✅
- Homepage → Tutorial: 1 clic ✅
- Ninguna página importante a más de 2 clics del homepage ✅

### Gestión de URLs retiradas (migración WordPress)
- ✅ 7 posts retirados: HTTP 410 via middleware
- ✅ Tags inválidos (comet, hugging-face, chatgpt, etc.): HTTP 410
- ✅ Prefijos WordPress (`/wp-content/`, `/wp-admin/`): HTTP 410
- ✅ Sitemaps WordPress legacy (`/post-sitemap.xml`, `/post_tag-sitemap.xml`): HTTP 410 *(añadido 2026-06-01)*
- ✅ www → naked domain: 301

---

## 2. Indexability

### Canonical tags
- ✅ Canonical auto-generado desde `Astro.url` en `BaseLayout.astro`
- ✅ `trailingSlash: 'always'` — consistencia total de URLs
- ✅ Posts retirados: `<meta name="robots" content="noindex,nofollow">` + HTTP 410
- ✅ No hay conflictos canonical vs noindex

### Contenido duplicado
- ✅ www → naked redirect 301 activo
- ✅ Paginación excluida del sitemap
- ✅ Tags con <2 posts no generan página (evita thin content)

### Thin content
- ✅ Tags generados solo si tienen ≥2 posts
- ✅ Posts retirados con HTTP 410 eliminados del índice

### Páginas "unknown" en GSC (categorías + tags)
- Causa: son páginas nuevas del sitio Astro que Google aún no ha rastreado
- No es un error — están en el sitemap correcto
- **Acción:** Re-enviar `/sitemap-index.xml` en GSC para acelerar el rastreo

---

## 3. Security

| Header | Estado | Valor |
|--------|--------|-------|
| HTTPS | ✅ Enforced | Cloudflare SSL |
| HSTS | ✅ | `max-age=31536000; includeSubDomains; preload` |
| Content-Security-Policy | ✅ | `default-src 'self'`, script-src con Cloudflare Insights |
| X-Frame-Options | ✅ | `DENY` |
| X-Content-Type-Options | ✅ | `nosniff` |
| Referrer-Policy | ✅ | `strict-origin-when-cross-origin` |
| Permissions-Policy | ✅ | camera=(), microphone=(), geolocation=(), payment=() |

Configuración de seguridad excelente.

---

## 4. URL Structure

| Criterio | Estado |
|----------|--------|
| URLs descriptivas en español | ✅ `/que-es-rag-generacion-aumentada-por-recuperacion/` |
| Separadores con guión | ✅ |
| Trailing slash consistente | ✅ `trailingSlash: 'always'` en astro.config |
| Jerarquía lógica | ✅ `/tutoriales/{slug}/`, `/categoria/{slug}/`, `/tag/{tag}/` |
| Longitud de URLs | ✅ Ninguna >100 caracteres en el sitemap |
| Redirects (cadenas) | ✅ Solo 1 hop: `_redirects` + middleware |
| Parámetros query en URLs de contenido | ✅ Ninguno |

---

## 5. Mobile Optimization

| Criterio | Estado |
|----------|--------|
| Viewport meta tag | ✅ `width=device-width, initial-scale=1` |
| Diseño responsive | ✅ Tailwind v4 mobile-first |
| Touch targets | ✅ Botones de navegación ≥48px |
| Font size base | ✅ Tailwind base = 16px |
| Sin scroll horizontal | ✅ |
| Mobile-first indexing | ✅ GSC confirma `"crawledAs": "MOBILE"` en todos los rastreos |

---

## 6. Core Web Vitals

*Sin datos CrUX disponibles (requiere Google API). Estimación basada en análisis de código.*

| Métrica | Target | Estimación | Base |
|---------|--------|-----------|------|
| LCP | <2.5s | ~1.5s | `fetchpriority="high"` en hero image, AVIF quality=30, CSS inlinado |
| INP | <200ms | ~50ms | Astro static, mínimo JS de hidratación |
| CLS | <0.1 | ~0.0 | Aspect ratio explícito en imágenes, `font-size-adjust: from-font` |

**Técnicas de rendimiento implementadas:**
- Speculation Rules API: prefetch eager + prerender moderate en links internos
- View Transitions API: crossfade entre páginas
- `fetchpriority="high"` en hero image del primer post
- AVIF quality=30 + srcset [320, 400, 500, 600, 720, 800, 1000, 1200px]
- CSS inlinado en build (`inlineStylesheets: 'always'`)
- Webfonts locales con preload (sin bloqueo externo)
- Cloudflare edge cache: `/_astro/*` con `max-age=31536000, immutable`

---

## 7. Structured Data

| Schema | Páginas | Estado |
|--------|---------|--------|
| `Article` | Posts (18) | ✅ |
| `FAQPage` | Posts con FAQs | ✅ Condicional |
| `BreadcrumbList` | Posts + categorías | ✅ |
| `Person` | Posts + /sobre/ | ✅ con knowsAbout + sameAs |
| `Organization` | Homepage | ✅ |
| `WebSite` + `SearchAction` | Homepage | ✅ |
| `Blog` + `BlogPosting` | Homepage | ✅ |
| `CollectionPage` + `ItemList` | Categorías, tags, /archivo/ | ✅ |
| `TechArticle` | /como-funciona/ | ✅ |
| `Dataset` | /mapa-ia/, /radar/ | ✅ |

Sin errores de validación conocidos. Rich Results habilitados en 13+ posts (GSC confirma `richResultsVerdict: "PASS"`).

---

## 8. JavaScript Rendering

| Criterio | Estado |
|----------|--------|
| Output mode | ✅ `output: 'static'` en astro.config |
| Contenido visible sin JS | ✅ HTML puro en respuesta inicial |
| Canonical en HTML inicial | ✅ No depende de JS |
| Meta robots en HTML inicial | ✅ |
| Structured data en HTML inicial | ✅ JSON-LD en `<head>` estático |
| Excepción dinámica | `/api/search-console/report.json.ts` (`prerender: false`) — solo uso interno |

Sitio 100% server-side rendered en build. Sin issues de JS SEO.

---

## 9. IndexNow Protocol

| Estado | ❌ No implementado |
|--------|--------------------|

IndexNow permite notificar a Bing, Yandex y Naver inmediatamente cuando se publica o actualiza contenido. Actualmente no está implementado.

**Implementación recomendada:**

1. Generar clave en https://www.bing.com/indexnow
2. Crear `public/{clave}.txt` con el valor de la clave
3. Añadir a `scripts/deploy-notify.mjs` (o en el script de deploy):

```javascript
// Notificar a IndexNow tras deploy
const INDEXNOW_KEY = process.env.INDEXNOW_KEY
const urls = [
  'https://identidadartificial.com/',
  // ... URLs modificadas en este deploy
]
await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    host: 'identidadartificial.com',
    key: INDEXNOW_KEY,
    urlList: urls
  })
})
```

**Esfuerzo:** Bajo (1-2 horas) | **Impacto:** Indexación más rápida en Bing/Copilot

---

## Issues Críticos
*Ninguno.*

---

## Issues Alta Prioridad (esta semana)

1. **Re-enviar sitemap en GSC** — Las 6 categorías y 12+ tags están en el sitemap pero Google no los ha rastreado. Ir a GSC → Sitemaps → Re-enviar `https://identidadartificial.com/sitemap-index.xml`.

2. **Solicitar inspección de `/tag/chatgpt/`** — GSC muestra 404 (caché del 2026-05-25). El middleware ya devuelve 410. Pedir re-inspección en GSC para limpiar el error.

---

## Issues Media Prioridad (este mes)

1. **IndexNow** — Implementar para Bing/Copilot. Bajo esfuerzo, beneficio para el ~30% de búsquedas que pasan por Bing.

2. **Categorías sin lastmod en sitemap** — Los posts tienen `lastmod` real. Las páginas `/categoria/{slug}/` no lo tienen. Añadir `lastmod` al serializer del sitemap basándose en el post más reciente de cada categoría.

3. **`Person.description` en schema** — Añadir descripción textual del autor en `PostLayout.astro`. Ver GEO-ANALYSIS.md para el texto recomendado.

---

## Issues Baja Prioridad (backlog)

1. **CCBot en robots.txt** — Permitido actualmente. Considerar bloquear si no se quiere contribuir al dataset de entrenamiento de Common Crawl (no afecta a búsqueda).

2. **llms-full.txt como endpoint dinámico** — Si el Worker falla, el corpus no es accesible. Considerar generar también versión estática en build como fallback.

3. **`sobre-el-proyecto/`** — URL del WordPress viejo aún indexada en GSC (redirige 301 a /sobre/). Se resolverá sola con el tiempo a medida que Google actualice su índice.

---

## Estado migración WordPress → Astro

| Issue | Estado | Detalle |
|-------|--------|---------|
| Posts retirados | ✅ Resuelto | HTTP 410 via middleware |
| Tags inválidos (chatgpt, etc.) | ✅ Resuelto | HTTP 410 via middleware |
| Prefijos WP (/wp-content/, etc.) | ✅ Resuelto | HTTP 410 via GONE_PREFIXES |
| Sitemaps WP (/post-sitemap.xml, etc.) | ✅ Resuelto | HTTP 410 añadido 2026-06-01 |
| /sobre-el-proyecto/ | ✅ Resuelto | 301 → /sobre/ en `_redirects` |
| /tag/chatgpt/ en GSC como 404 | ⚠️ Caché | URL ya devuelve 410, GSC tardará en actualizarse |
| Categorías "unknown to Google" | ⚠️ Pendiente | En sitemap; re-enviar sitemap en GSC |

**Conclusión migración:** El sitio está limpio para re-enviar a Google. Re-enviar el sitemap en GSC y solicitar re-inspección de las URLs con errores para acelerar la limpieza del índice.
