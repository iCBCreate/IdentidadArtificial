# Post "Qué indexan los LLMs" + Generador llms.txt — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear post MDX sobre visibilidad en motores IA con generador llms.txt interactivo que analiza URLs vía Cloudflare Pages Function propia.

**Architecture:** Pages Function en `functions/api/fetch-site.ts` hace fetch server-side con `HTMLRewriter` y devuelve JSON. Componente Astro `LlmsTxtGenerator.astro` consume ese endpoint con vanilla JS, muestra campos editables y genera preview llms.txt en tiempo real. Post MDX importa el componente.

**Tech Stack:** Cloudflare Pages Functions (HTMLRewriter), Astro 6 (static), TypeScript, vanilla JS, Node test runner (`node:test`), Wrangler.

---

## Mapa de archivos

| Acción | Ruta |
|--------|------|
| Crear | `functions/api/fetch-site.ts` |
| Crear | `tests/fetch-site.test.ts` |
| Crear | `source/components/LlmsTxtGenerator.astro` |
| Crear | `source/content/blog/que-indexan-realmente-los-llms.mdx` |

---

## Task 1: Pages Function — validación de URL y fetch con timeout

**Files:**
- Create: `functions/api/fetch-site.ts`
- Create: `tests/fetch-site.test.ts`

- [ ] **Paso 1: Crear tests de validación de URL**

```typescript
// tests/fetch-site.test.ts
import test from 'node:test'
import assert from 'node:assert/strict'

function validateUrl(raw: string | null): URL | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:') return null
    return url
  } catch {
    return null
  }
}

test('validateUrl rechaza null', () => {
  assert.equal(validateUrl(null), null)
})

test('validateUrl rechaza HTTP (no HTTPS)', () => {
  assert.equal(validateUrl('http://example.com'), null)
})

test('validateUrl rechaza string no-URL', () => {
  assert.equal(validateUrl('no-es-una-url'), null)
})

test('validateUrl acepta HTTPS válido', () => {
  const url = validateUrl('https://identidadartificial.com')
  assert.ok(url instanceof URL)
  assert.equal(url?.hostname, 'identidadartificial.com')
})

test('validateUrl acepta HTTPS con path', () => {
  const url = validateUrl('https://example.com/blog/')
  assert.ok(url instanceof URL)
})
```

- [ ] **Paso 2: Ejecutar tests — deben fallar**

```bash
node --import tsx --test tests/fetch-site.test.ts
```

Esperado: error `validateUrl is not defined` (la función no existe aún en módulo).

- [ ] **Paso 3: Crear `functions/api/fetch-site.ts` con validación y fetch**

```typescript
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
        'Accept': 'text/html',
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

    const rewriter = new HTMLRewriter()
      .on('title', {
        text(chunk) {
          if (chunk.text) data.title += chunk.text
        },
      })
      .on('meta[name="description"]', {
        element(el) {
          data.description = el.getAttribute('content') ?? ''
        },
      })
      .on('meta[property="og:title"]', {
        element(el) {
          if (!data.title) data.title = el.getAttribute('content') ?? ''
        },
      })
      .on('meta[property="og:description"]', {
        element(el) {
          if (!data.description) data.description = el.getAttribute('content') ?? ''
        },
      })
      .on('link[rel="canonical"]', {
        element(el) {
          data.canonical = el.getAttribute('href') ?? url.href
        },
      })
      .on('html', {
        element(el) {
          data.lang = el.getAttribute('lang') ?? 'es'
        },
      })
      .on('nav a[href]', {
        element(el) {
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
```

- [ ] **Paso 4: Actualizar test — importar `validateUrl` desde el módulo**

```typescript
// tests/fetch-site.test.ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { validateUrl } from '../functions/api/fetch-site.ts'

test('validateUrl rechaza null', () => {
  assert.equal(validateUrl(null), null)
})

test('validateUrl rechaza HTTP (no HTTPS)', () => {
  assert.equal(validateUrl('http://example.com'), null)
})

test('validateUrl rechaza string no-URL', () => {
  assert.equal(validateUrl('no-es-una-url'), null)
})

test('validateUrl acepta HTTPS válido', () => {
  const url = validateUrl('https://identidadartificial.com')
  assert.ok(url instanceof URL)
  assert.equal(url?.hostname, 'identidadartificial.com')
})

test('validateUrl acepta HTTPS con path', () => {
  const url = validateUrl('https://example.com/blog/')
  assert.ok(url instanceof URL)
})
```

- [ ] **Paso 5: Ejecutar tests — deben pasar**

```bash
node --import tsx --test tests/fetch-site.test.ts
```

Esperado: `✓ validateUrl rechaza null`, `✓ validateUrl rechaza HTTP`, `✓ validateUrl rechaza string no-URL`, `✓ validateUrl acepta HTTPS válido`, `✓ validateUrl acepta HTTPS con path`. Todos PASS.

- [ ] **Paso 6: Commit**

```bash
git add functions/api/fetch-site.ts tests/fetch-site.test.ts
git commit -m "feat(api): add fetch-site Cloudflare Pages Function with URL validation"
```

---

## Task 2: Test manual de la Pages Function con Wrangler

**Files:**
- No modifica archivos

- [ ] **Paso 1: Lanzar build y dev server**

```bash
npm run build
```

Esperado: build completo sin errores. Directorio `dist/client/` generado.

- [ ] **Paso 2: Lanzar Wrangler Pages Dev**

```bash
npx wrangler pages dev dist/client --compatibility-date 2025-01-01 --compatibility-flags nodejs_compat
```

Esperado: servidor en `http://localhost:8788`.

- [ ] **Paso 3: Test endpoint — petición válida**

```bash
curl "http://localhost:8788/api/fetch-site?url=https%3A%2F%2Fidentidadartificial.com" | jq
```

Esperado: JSON con campos `title`, `description`, `canonical`, `lang`, `navLinks`.

```json
{
  "title": "Identidad Artificial",
  "description": "...",
  "canonical": "https://identidadartificial.com/",
  "lang": "es",
  "navLinks": ["/archivo/", "/sobre/", ...]
}
```

- [ ] **Paso 4: Test endpoint — URL inválida**

```bash
curl -w "%{http_code}" "http://localhost:8788/api/fetch-site" | tail -1
```

Esperado: `400`.

- [ ] **Paso 5: Test endpoint — HTTP (no HTTPS)**

```bash
curl -w "%{http_code}" "http://localhost:8788/api/fetch-site?url=http%3A%2F%2Fexample.com" | tail -1
```

Esperado: `400`.

---

## Task 3: Componente LlmsTxtGenerator — estructura HTML y CSS

**Files:**
- Create: `source/components/LlmsTxtGenerator.astro`

- [ ] **Paso 1: Crear componente con HTML y estilos**

```astro
---
// source/components/LlmsTxtGenerator.astro
---

<section class="llms-gen" aria-labelledby="llms-gen-title">
  <h3 id="llms-gen-title">Genera tu llms.txt</h3>
  <p class="llms-gen__desc">Pega la URL de tu sitio y analizamos su contenido para generar un llms.txt listo para copiar o descargar.</p>

  <div class="llms-gen__input-row">
    <label for="llms-url" class="sr-only">URL de tu sitio web</label>
    <input
      id="llms-url"
      type="url"
      placeholder="https://tusitio.com"
      autocomplete="url"
      class="llms-gen__url-input"
    />
    <button id="llms-analyze" type="button" class="llms-gen__btn">
      Analizar →
    </button>
  </div>

  <p id="llms-status" class="llms-gen__status" aria-live="polite" hidden></p>

  <div id="llms-fields" class="llms-gen__fields" hidden>
    <div class="llms-gen__field-row">
      <label for="llms-name">Nombre del sitio</label>
      <input id="llms-name" type="text" />
    </div>
    <div class="llms-gen__field-row">
      <label for="llms-canonical">URL canónica</label>
      <input id="llms-canonical" type="url" />
    </div>
    <div class="llms-gen__field-row">
      <label for="llms-description">Descripción</label>
      <textarea id="llms-description" rows="2"></textarea>
    </div>
    <div class="llms-gen__field-row">
      <label for="llms-author">Autor</label>
      <input id="llms-author" type="text" placeholder="Tu nombre" />
    </div>
    <div class="llms-gen__field-row">
      <label for="llms-lang">Idioma</label>
      <input id="llms-lang" type="text" placeholder="es" />
    </div>
    <div id="llms-nav-section" class="llms-gen__field-row" hidden>
      <fieldset>
        <legend>Páginas principales detectadas</legend>
        <div id="llms-nav-checks" class="llms-gen__nav-checks"></div>
      </fieldset>
    </div>
  </div>

  <div id="llms-preview-wrap" class="llms-gen__preview-wrap" hidden aria-live="polite">
    <h4>Vista previa</h4>
    <pre id="llms-preview" class="llms-gen__preview"></pre>
    <div class="llms-gen__actions">
      <button id="llms-copy" type="button" class="llms-gen__btn llms-gen__btn--secondary">Copiar</button>
      <button id="llms-download" type="button" class="llms-gen__btn llms-gen__btn--secondary">Descargar llms.txt</button>
    </div>
  </div>
</section>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.llms-gen {
  border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 2rem 0;
  background: color-mix(in srgb, currentColor 3%, transparent);
}

.llms-gen h3 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
}

.llms-gen__desc {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  opacity: 0.75;
}

.llms-gen__input-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.llms-gen__url-input {
  flex: 1;
  min-width: 220px;
  padding: 0.5rem 0.75rem;
  border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
  border-radius: 0.375rem;
  background: transparent;
  color: inherit;
  font-size: 0.95rem;
}

.llms-gen__btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  background: currentColor;
  color: canvas;
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap;
}

.llms-gen__btn--secondary {
  background: transparent;
  color: inherit;
  border: 1px solid color-mix(in srgb, currentColor 30%, transparent);
}

.llms-gen__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.llms-gen__status {
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
}

.llms-gen__status--error {
  color: #e53e3e;
}

.llms-gen__fields {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.llms-gen__field-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.llms-gen__field-row label,
.llms-gen__field-row legend {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.llms-gen__field-row input,
.llms-gen__field-row textarea {
  padding: 0.4rem 0.6rem;
  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  border-radius: 0.25rem;
  background: transparent;
  color: inherit;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
}

.llms-gen__nav-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.llms-gen__nav-checks label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.875rem;
  font-weight: 400;
  opacity: 1;
  text-transform: none;
  letter-spacing: 0;
  cursor: pointer;
}

.llms-gen__preview-wrap {
  margin-top: 1.5rem;
}

.llms-gen__preview-wrap h4 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.llms-gen__preview {
  background: color-mix(in srgb, currentColor 6%, transparent);
  border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 0.375rem;
  padding: 1rem;
  font-size: 0.85rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 28rem;
  overflow-y: auto;
  margin: 0 0 1rem;
}

.llms-gen__actions {
  display: flex;
  gap: 0.5rem;
}
</style>
```

- [ ] **Paso 2: Verificar build sin errores**

```bash
npm run build
```

Esperado: build sin errores. Componente compilado.

- [ ] **Paso 3: Commit**

```bash
git add source/components/LlmsTxtGenerator.astro
git commit -m "feat(component): add LlmsTxtGenerator HTML structure and CSS"
```

---

## Task 4: Componente LlmsTxtGenerator — JavaScript interactivo

**Files:**
- Modify: `source/components/LlmsTxtGenerator.astro` (añadir bloque `<script>`)

- [ ] **Paso 1: Añadir bloque `<script>` al final del componente**

Añadir inmediatamente antes del cierre del archivo (`</style>` ya existe al final):

```astro
<script>
(function () {
  const urlInput    = document.getElementById('llms-url') as HTMLInputElement
  const analyzeBtn  = document.getElementById('llms-analyze') as HTMLButtonElement
  const statusEl    = document.getElementById('llms-status') as HTMLParagraphElement
  const fieldsEl    = document.getElementById('llms-fields') as HTMLDivElement
  const previewWrap = document.getElementById('llms-preview-wrap') as HTMLDivElement
  const previewEl   = document.getElementById('llms-preview') as HTMLPreElement
  const nameInput   = document.getElementById('llms-name') as HTMLInputElement
  const canonInput  = document.getElementById('llms-canonical') as HTMLInputElement
  const descInput   = document.getElementById('llms-description') as HTMLTextAreaElement
  const authorInput = document.getElementById('llms-author') as HTMLInputElement
  const langInput   = document.getElementById('llms-lang') as HTMLInputElement
  const navSection  = document.getElementById('llms-nav-section') as HTMLDivElement
  const navChecks   = document.getElementById('llms-nav-checks') as HTMLDivElement
  const copyBtn     = document.getElementById('llms-copy') as HTMLButtonElement
  const dlBtn       = document.getElementById('llms-download') as HTMLButtonElement

  function setStatus(msg: string, isError = false) {
    statusEl.textContent = msg
    statusEl.hidden = !msg
    statusEl.className = 'llms-gen__status' + (isError ? ' llms-gen__status--error' : '')
  }

  function generateLlmsTxt(): string {
    const name   = nameInput.value.trim()
    const canon  = canonInput.value.trim()
    const desc   = descInput.value.trim()
    const author = authorInput.value.trim()
    const lang   = langInput.value.trim()

    const checkedLinks = Array.from(
      navChecks.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')
    ).map(cb => cb.value)

    let out = `# ${name || 'Mi sitio'}\n`
    if (canon) out += `# ${canon}\n`
    out += '\n'
    if (desc) out += `> ${desc}\n\n`
    if (author) out += `## Autoría\n\n- **Autor:** ${author}\n\n`
    if (lang)   out += `## Idioma\n\n- ${lang}\n\n`

    if (checkedLinks.length > 0) {
      out += `## Páginas principales\n\n`
      for (const path of checkedLinks) {
        const abs = canon ? new URL(path, canon).href : path
        out += `- [${path}](${abs})\n`
      }
      out += '\n'
    }

    out += `## Política de uso por IA\n\n`
    out += `El contenido de este sitio puede ser indexado por sistemas de IA para responder preguntas, siempre que se cite la fuente.\n`

    return out
  }

  function updatePreview() {
    previewEl.textContent = generateLlmsTxt()
    previewWrap.hidden = false
  }

  function buildNavChecks(links: string[]) {
    navChecks.innerHTML = ''
    if (links.length === 0) {
      navSection.hidden = true
      return
    }
    navSection.hidden = false
    for (const path of links) {
      const id = `nav-${path.replace(/\//g, '-')}`
      const label = document.createElement('label')
      const cb    = document.createElement('input')
      cb.type    = 'checkbox'
      cb.id      = id
      cb.value   = path
      cb.checked = true
      cb.addEventListener('change', updatePreview)
      label.appendChild(cb)
      label.appendChild(document.createTextNode(path))
      navChecks.appendChild(label)
    }
  }

  async function analyze() {
    const raw = urlInput.value.trim()
    if (!raw) {
      setStatus('Introduce una URL primero.', true)
      return
    }

    analyzeBtn.disabled = true
    setStatus('Analizando...')
    fieldsEl.hidden = true
    previewWrap.hidden = true

    try {
      const res = await fetch(`/api/fetch-site?url=${encodeURIComponent(raw)}`)
      const data = await res.json() as {
        title?: string; description?: string; canonical?: string
        lang?: string; navLinks?: string[]; error?: string
      }

      if (!res.ok || data.error) {
        setStatus(data.error ?? 'Error al analizar el sitio.', true)
        return
      }

      nameInput.value   = data.title       ?? ''
      canonInput.value  = data.canonical   ?? raw
      descInput.value   = data.description ?? ''
      langInput.value   = data.lang        ?? 'es'
      buildNavChecks(data.navLinks ?? [])

      fieldsEl.hidden = false
      setStatus('')
      updatePreview()
    } catch {
      setStatus('No se pudo conectar. Comprueba la URL e inténtalo de nuevo.', true)
    } finally {
      analyzeBtn.disabled = false
    }
  }

  analyzeBtn.addEventListener('click', analyze)
  urlInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') analyze()
  })

  for (const field of [nameInput, canonInput, descInput, authorInput, langInput]) {
    field.addEventListener('input', updatePreview)
  }

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generateLlmsTxt()).then(() => {
      copyBtn.textContent = '¡Copiado!'
      setTimeout(() => { copyBtn.textContent = 'Copiar' }, 2000)
    })
  })

  dlBtn.addEventListener('click', () => {
    const blob = new Blob([generateLlmsTxt()], { type: 'text/plain' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = 'llms.txt'
    a.click()
    URL.revokeObjectURL(a.href)
  })
})()
</script>
```

- [ ] **Paso 2: Build para verificar TypeScript en script**

```bash
npm run build
```

Esperado: sin errores de TypeScript ni Astro.

- [ ] **Paso 3: Test manual — abrir en browser**

Lanzar `npm run preview` (hace build + wrangler dev). Abrir `http://localhost:8788`.

Crear página de prueba temporal o ir directamente al post (si ya existe) para probar el componente:
- Pegar `https://identidadartificial.com` → click Analizar
- Verificar que campos se prerellenan
- Editar nombre → preview actualiza
- Click Copiar → botón cambia a "¡Copiado!" 2 segundos
- Click Descargar → descarga `llms.txt`
- Pegar URL inválida → mensaje de error visible

- [ ] **Paso 4: Commit**

```bash
git add source/components/LlmsTxtGenerator.astro
git commit -m "feat(component): add LlmsTxtGenerator interactive JS — fetch, preview, copy, download"
```

---

## Task 5: Post MDX

**Files:**
- Create: `source/content/blog/que-indexan-realmente-los-llms.mdx`

> Nota: la imagen hero `source/assets/post/que-indexan-llms-hero.png` no existe. Dos opciones: (a) omitir `heroImage` del frontmatter si el campo es opcional, (b) copiar/renombrar una imagen existente como placeholder. Verificar en `source/layouts/` si heroImage es requerida.

- [ ] **Paso 1: Verificar si heroImage es obligatoria**

```bash
grep -r "heroImage" /Users/ignaciocubelasfortes/Documents/Proyectos/IdentidadArtificial/source/layouts/ | head -5
grep -r "heroImage" /Users/ignaciocubelasfortes/Documents/Proyectos/IdentidadArtificial/source/content/config.ts 2>/dev/null | head -5
```

Si aparece como campo requerido en el schema: copiar una imagen existente como placeholder.
Si es opcional: omitir el campo.

- [ ] **Paso 2: Crear el post MDX**

```mdx
---
title: "Qué indexan realmente los LLMs: ChatGPT, Claude, Perplexity y AI Overviews no funcionan igual"
description: "Los LLMs no rastrean webs como Google. Analizamos cómo ChatGPT, Perplexity, Claude y Google AI Overviews obtienen información y qué puedes hacer para aparecer en cada uno."
pubDate: 2026-06-02
category: Conceptos
tags:
  - llms-txt
  - geo
  - visibilidad-ia
  - seo
generatedBy: claude-sonnet-4-6
generatedAt: 2026-06-02T00:00:00Z
promptBase: "Comparativa visibilidad en ChatGPT, Claude, Perplexity y Google AI Overviews. Los LLMs no indexan como Google. Incluye generador llms.txt interactivo."
humanReviewed: false
---

import LlmsTxtGenerator from '../../components/LlmsTxtGenerator.astro'

Un modelo de lenguaje no rastrea tu web. No hay crawler visitando tus páginas cada semana. El conocimiento que tiene ChatGPT, Claude o Perplexity sobre tu sitio viene de una fuente distinta para cada plataforma — y optimizar para una no garantiza visibilidad en las demás.

## ¿Cómo obtiene información cada plataforma de IA?

| Plataforma | Fuente principal | Frecuencia de actualización | Cita principalmente |
|---|---|---|---|
| **ChatGPT** | Training data + Bing Search | Meses (training) / Días (búsqueda) | Wikipedia (47,9%), Reddit (11,3%) |
| **Perplexity** | Crawler propio en tiempo real | Horas / Días | Reddit (46,7%), Wikipedia |
| **Claude** | Training data + herramientas opcionales | Meses | Web general, fuentes académicas |
| **Google AI Overviews** | Google Search index | Horas | Top-10 orgánico (92% de citas) |

Fuentes: [estudio Ahrefs diciembre 2025](https://ahrefs.com/) (75.000 marcas), [SparkToro 2025](https://sparktoro.com/), datos oficiales de plataformas.

Solo el **11% de los dominios** aparecen citados a la vez por ChatGPT y Google AI Overviews para la misma consulta. La optimización para IA no es universal: es específica por plataforma.

## ChatGPT: Wikipedia y Reddit mandan

ChatGPT combina su conocimiento de entrenamiento con Bing Search cuando el usuario activa la búsqueda web. Su conocimiento de entrenamiento tiene fecha de corte — información publicada después no existe para el modelo sin búsqueda activa.

Las fuentes que más cita ChatGPT son Wikipedia (47,9% de las citas) y Reddit (11,3%). Esto no es accidental: son las fuentes con mayor cobertura en su corpus de entrenamiento y las que Bing indexa con más autoridad. Si tu contenido no tiene presencia en estas plataformas ni backlinks desde ellas, tu visibilidad en ChatGPT depende casi exclusivamente de si Bing te indexa bien.

Para aparecer en ChatGPT: trabaja la presencia en Wikipedia si tu marca o concepto lo justifica, genera menciones en Reddit y foros especializados, y asegúrate de que Bing tiene acceso completo a tu sitio (IndexNow acelera la indexación).

## Perplexity: el crawler más agresivo

Perplexity tiene su propio bot (`PerplexityBot`) que rastrea webs con frecuencia similar a Google. Es el sistema más parecido a un buscador tradicional entre los motores de IA — analiza páginas en tiempo real y cita fuentes con enlaces.

Su principal fuente de citas es Reddit (46,7%), seguida de Wikipedia. Pero a diferencia de ChatGPT, Perplexity puede indexar contenido reciente en horas. Si publicas algo relevante hoy y PerplexityBot tiene acceso, puede aparecer en respuestas mañana.

Para aparecer en Perplexity: permite `PerplexityBot` en tu `robots.txt`, usa Server-Side Rendering (el bot no ejecuta JavaScript), y crea contenido con hechos específicos y citas verificables — el sistema prioriza pasajes que puede citar con enlace.

## Claude: el más conservador en referencias externas

Claude (Anthropic) tiene acceso a búsqueda web como herramienta opcional, pero en su modo estándar trabaja desde su conocimiento de entrenamiento. No tiene un índice propio ni un crawler público equiparable a Bing o PerplexityBot.

Las menciones de tu marca en Claude dependen principalmente de si apareces en su corpus de entrenamiento — artículos, documentación, foros, repositorios — y de si los usuarios activan la búsqueda web explícitamente. `ClaudeBot` existe para funciones web específicas pero no opera como crawler masivo.

Para aparecer en Claude: construye presencia en fuentes de alta calidad que formen parte de datos de entrenamiento (artículos técnicos, documentación, GitHub), y mantén un `llms.txt` que declare el propósito y contenido de tu sitio.

## Google AI Overviews: el SEO sigue siendo el rey

Google AI Overviews cita principalmente páginas que ya están en el top-10 orgánico para esa consulta — el 92% de las citas provienen de ahí. Esto lo convierte en el sistema más predecible: si rankeas bien para una búsqueda, tienes alta probabilidad de aparecer en el bloque de IA.

El 47% de las citas en AI Overviews vienen de páginas que rankean por debajo del puesto 5, lo que muestra que el sistema tiene su propia lógica de selección basada en relevancia de pasajes, no solo posición.

Para aparecer en AI Overviews: SEO tradicional (velocidad, autoridad, estructura), Schema.org relevante (`Article`, `FAQPage`, `HowTo`), y pasajes directamente respondibles de 134-167 palabras.

## Señales que importan en cada plataforma

| Señal | ChatGPT | Perplexity | Claude | Google AIO |
|---|:---:|:---:|:---:|:---:|
| Server-Side Rendering | ● | ● | ● | ● |
| Robots.txt permisivo | ● | ● | ● | ● |
| llms.txt | ○ | ○ | ● | ○ |
| Presencia en Wikipedia | ● | ● | ● | ○ |
| Menciones en Reddit | ● | ● | ○ | ○ |
| Schema.org | ○ | ○ | ○ | ● |
| Ranking orgánico Google | ○ | ○ | ○ | ● |
| IndexNow / Bing | ● | ○ | ○ | ○ |

● Alta correlación · ○ Correlación moderada o baja

## ¿Qué es llms.txt y qué NO es?

`llms.txt` es un archivo de texto en la raíz de tu dominio que declara, en formato legible por máquinas, qué contiene tu sitio y cómo puede usarse. Es una señal de intención, no un mecanismo de indexación garantizado.

**Lo que llms.txt SÍ hace:**
- Da contexto estructurado a modelos que acceden directamente a tu sitio
- Declara licencia de uso del contenido (con RSL 1.0)
- Facilita que Claude y otros modelos entiendan la estructura de tu web cuando la consultan con herramientas

**Lo que llms.txt NO hace:**
- No obliga a ningún modelo a citarte
- No reemplaza el SEO ni el ranking orgánico
- No garantiza que tu contenido entre en datos de entrenamiento
- No es equivalente a `robots.txt` — no tiene efecto en crawlers de entrenamiento salvo que el operador lo respete voluntariamente

Este sitio tiene su propio [llms.txt](https://identidadartificial.com/llms.txt) como ejemplo de implementación real.

## Genera tu llms.txt

Analiza tu sitio y crea un `llms.txt` en menos de 30 segundos:

<LlmsTxtGenerator />

## Preguntas frecuentes

**¿Los LLMs rastrean mi web continuamente?**
No todos. Perplexity tiene un crawler activo. ChatGPT usa Bing para búsqueda web. Claude solo accede si el usuario activa herramientas web explícitamente. Google AI Overviews usa el índice de Google Search, no un crawler propio de IA.

**¿Bloquear CCBot evita que mi contenido entre en datos de entrenamiento?**
CCBot (Common Crawl) es una fuente común de datos de entrenamiento, pero no la única. Bloquearlo reduce la probabilidad de inclusión en futuros entrenamientos, pero no elimina el riesgo. Muchos modelos ya se han entrenado con datos previos a cualquier bloqueo.

**¿Tiene sentido implementar llms.txt si soy un blog pequeño?**
Sí, especialmente si tu contenido es técnico o de nicho. Los modelos que acceden con herramientas web leen el llms.txt para entender el contexto del sitio antes de profundizar. Es el equivalente de presentarte antes de una conversación.

**¿Qué pasa si mi web usa JavaScript para renderizar el contenido principal?**
Los crawlers de IA no ejecutan JavaScript. Si tu contenido depende de JS para renderizarse, la mayoría de bots de IA verán una página vacía o incompleta. Usa SSR o genera HTML estático.

**¿Con qué frecuencia actualiza Perplexity su índice?**
PerplexityBot rastrea páginas con una frecuencia similar a los buscadores principales — entre horas y pocos días para contenido nuevo y relevante. No hay datos oficiales de cadencia exacta.

**¿Los brand mentions en Reddit realmente impactan en ChatGPT?**
Según el estudio Ahrefs de diciembre 2025 con 75.000 marcas, las menciones en YouTube tienen la correlación más fuerte con visibilidad en IA (~0,737), seguidas de Reddit. Los backlinks tienen una correlación mucho menor (~0,266). Las menciones importan más que los enlaces.

## Checklist de visibilidad en IA

Ordenado por impacto estimado:

1. **SSR obligatorio** — todo el contenido importante en HTML puro, sin depender de JS
2. **Permite crawlers clave** — `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot` en `robots.txt`
3. **Pasajes autocompletos** — bloques de 134-167 palabras que responden una pregunta directamente
4. **H2/H3 como preguntas** — facilita extracción de fragmentos por sistemas QA
5. **Schema.org relevante** — `Article`, `Person`, `FAQPage` para AI Overviews
6. **llms.txt actualizado** — declara estructura, autor y licencia del contenido
7. **Presencia en Wikipedia** — si la marca o concepto lo justifica
8. **Menciones en Reddit/YouTube** — contenido citado en comunidades relevantes
9. **IndexNow activo** — acelera indexación en Bing para visibilidad en ChatGPT
10. **Datos únicos con fuente** — estadísticas originales o curadas con atribución clara
```

- [ ] **Paso 3: Verificar build completo**

```bash
npm run build
```

Esperado: build sin errores. Post accesible en `dist/client/que-indexan-realmente-los-llms/`.

- [ ] **Paso 4: Commit**

```bash
git add source/content/blog/que-indexan-realmente-los-llms.mdx
git commit -m "feat(blog): add post 'qué indexan los LLMs' with GEO-optimized structure"
```

---

## Task 6: Verificación end-to-end

**Files:**
- No modifica archivos

- [ ] **Paso 1: Lanzar preview completo**

```bash
npm run preview
```

Este comando ejecuta `npm run build && wrangler dev`. Abrir `http://localhost:8788`.

- [ ] **Paso 2: Verificar post accesible**

Navegar a `http://localhost:8788/que-indexan-realmente-los-llms/`.
Esperado: post renderizado con todas las secciones, tabla, FAQ, checklist y el generador visible.

- [ ] **Paso 3: Test completo del generador**

- Pegar `https://identidadartificial.com` → Analizar → campos prerellenados ✓
- Editar campo "Nombre" → preview actualiza en tiempo real ✓
- Desmarcar una sección de nav → desaparece de preview ✓
- Click Copiar → texto en portapapeles, botón cambia 2s ✓
- Click Descargar → archivo `llms.txt` descargado con contenido correcto ✓

- [ ] **Paso 4: Test de error**

- Pegar `https://sitio-que-no-existe-12345.com` → mensaje de error visible ✓
- Pegar URL HTTP → 400 → mensaje de error visible ✓

- [ ] **Paso 5: Commit final si hay ajustes**

Si se hicieron correcciones en los pasos anteriores:

```bash
git add -p
git commit -m "fix: post and generator adjustments after e2e verification"
```

- [ ] **Paso 6: Ejecutar suite de tests**

```bash
npm test
```

Esperado: todos los tests pasan incluido el nuevo `fetch-site.test.ts`.
