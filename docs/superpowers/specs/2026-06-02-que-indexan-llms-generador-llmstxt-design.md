# Spec: Post "Qué indexan realmente los LLMs" + Generador llms.txt

**Fecha:** 2026-06-02  
**Proyecto:** IdentidadArtificial  
**Tipo:** Nuevo post MDX + componente interactivo + Cloudflare Pages Function

---

## Contexto

Se crea un post sobre visibilidad en motores de IA (ChatGPT, Claude, Perplexity, Google AI Overviews) con un generador llms.txt embebido. El generador analiza la URL del lector mediante una Cloudflare Pages Function propia (sin dependencias externas, sin cambiar el output de Astro).

Doble objetivo: contenido educativo con alta citabilidad GEO + herramienta práctica que refuerza autoridad del sitio.

---

## Archivos nuevos

```
functions/
  api/
    fetch-site.ts              ← Cloudflare Pages Function

source/
  components/
    LlmsTxtGenerator.astro     ← Componente interactivo
  content/
    blog/
      que-indexan-realmente-los-llms.mdx  ← Post
```

---

## 1. Cloudflare Pages Function — `functions/api/fetch-site.ts`

**Endpoint:** `GET /api/fetch-site?url=<encoded-https-url>`

**Flujo:**
1. Valida parámetro `url` — debe ser HTTPS válido
2. `fetch(url)` con `AbortController` timeout 8s, headers `User-Agent: IdentidadArtificial-Bot/1.0`
3. `HTMLRewriter` extrae:
   - `<title>` → `title`
   - `<meta name="description">` → `description`
   - `<meta property="og:title">` → `ogTitle` (fallback para title)
   - `<meta property="og:description">` → `ogDescription` (fallback para description)
   - `<link rel="canonical">` → `canonical`
   - `<html lang>` → `lang`
   - Hrefs dentro de `<nav>` → `navLinks[]` (máx 10, mismo dominio; paths relativos se convierten a absolutos con la base URL del input)
4. Devuelve `Content-Type: application/json` con campos extraídos

**Respuestas de error:**
- `400` — URL ausente o no HTTPS
- `408` — timeout superado
- `502` — fetch fallido (DNS, conexión rechazada)

**CORS:** Header `Access-Control-Allow-Origin: https://identidadartificial.com` (no wildcard)

---

## 2. Componente — `source/components/LlmsTxtGenerator.astro`

**Sin frameworks.** Vanilla JS en `<script>` del componente Astro.

**UX — estados:**

```
[Input URL] [Analizar →]
     ↓
[Cargando...]
     ↓
┌─ Campos editables ─────────────────────────┐
│ Nombre del sitio: [____________]           │
│ URL canónica:     [____________]           │
│ Descripción:      [____________]           │
│ Autor:            [____________]           │
│ Idioma:           [____________]           │
│ Secciones:        [☑ /blog/] [☑ /sobre/]  │
│                   [☑ /contacto/] ...       │
└────────────────────────────────────────────┘
     ↓ (se actualiza en tiempo real)
┌─ Preview llms.txt ─────────────────────────┐
│ # Nombre del sitio                         │
│ # https://url-canonica.com                 │
│                                            │
│ > Descripción del sitio                    │
│                                            │
│ ## Páginas principales                     │
│ - [Blog](/blog/): Artículos del blog       │
│ ...                                        │
└────────────────────────────────────────────┘
     [Copiar] [Descargar llms.txt]
```

**Comportamiento JS:**
- `fetch('/api/fetch-site?url=...')` al click "Analizar"
- Campos se prerellenan; todos editables (`contenteditable` o `<input>`)
- Preview se regenera con cada `input` event
- "Copiar" → `navigator.clipboard.writeText()`
- "Descargar" → `Blob` + `URL.createObjectURL()` + anchor click
- Estado de error visible inline bajo el input

**Accesibilidad:**
- `aria-live="polite"` en preview y estado de carga
- Labels asociados a todos los inputs

---

## 3. Post — `source/content/blog/que-indexan-realmente-los-llms.mdx`

**Frontmatter:**
```yaml
title: "Qué indexan realmente los LLMs: ChatGPT, Claude, Perplexity y AI Overviews no funcionan igual"
description: "Los LLMs no rastrean webs como Google. Comparamos cómo ChatGPT, Perplexity, Claude y Google AI Overviews obtienen su información y qué puedes hacer para aparecer en cada uno."
pubDate: 2026-06-02
category: Conceptos
tags:
  - llms-txt
  - geo
  - visibilidad-ia
  - seo
generatedBy: claude-sonnet-4-6
generatedAt: 2026-06-02T00:00:00Z
promptBase: "Post comparativa visibilidad en ChatGPT, Claude, Perplexity y Google AI Overviews. Ángulo: los LLMs no indexan como Google. Incluye generador llms.txt interactivo."
humanReviewed: false
heroImage: ../../assets/post/que-indexan-llms-hero.png
```

**Estructura (GEO-optimizada):**

1. **Intro** — definición en ≤60 palabras. Responde directamente "¿qué indexa un LLM?"
2. **Tabla comparativa** (ChatGPT / Perplexity / Claude / Google AIO) — fuente, frecuencia, qué cita, dónde conseguir visibilidad
3. **Bloques por plataforma** (134-167 palabras cada uno, autocompletos):
   - ChatGPT: training data + Bing, Wikipedia 47.9%, Reddit 11.3%
   - Perplexity: crawler propio, Reddit 46.7%, Wikipedia
   - Claude: training data, web general
   - Google AI Overviews: Google index, top-10 (92%)
4. **Señales que importan** — checklist con qué optimizar para cada plataforma
5. **¿Qué es llms.txt y qué NO es?** — desmitificación, referencia al llms.txt propio del sitio
6. **Generador interactivo** — `<LlmsTxtGenerator />` con CTA: "Genera el tuyo en 30 segundos"
7. **FAQ** — 5-6 preguntas en formato Q&A para AI Overviews
8. **Checklist final** — 8-10 acciones concretas ordenadas por impacto

**Citas obligatorias:** estudio Ahrefs (diciembre 2025, 75.000 marcas), SparkToro (527% crecimiento AI-referred sessions), datos oficiales plataformas.

---

## Restricciones

- No cambiar `output: 'static'` en `astro.config.mjs`
- Pages Function compatible con `compatibility_date: "2025-01-01"` y `nodejs_compat`
- El componente no usa frameworks (sin React, sin Svelte)
- CORS restringido al dominio propio
- Sin imagen hero real — usar placeholder o generar por separado

---

## Verificación

1. `bun run build` — sin errores TypeScript ni Astro
2. `wrangler pages dev dist/client` — Pages Function responde en `/api/fetch-site?url=https://identidadartificial.com`
3. En browser: pegar URL, verificar que campos se prerellenan
4. Editar campos, verificar preview actualiza en tiempo real
5. Copiar y descargar — verificar contenido correcto del llms.txt
6. Test con URL que falla (dominio inexistente) — verificar mensaje de error visible
7. `curl /api/fetch-site` sin parámetros → 400
8. Post accesible en `/que-indexan-realmente-los-llms/`
