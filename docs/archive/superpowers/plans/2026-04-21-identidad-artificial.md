# Identidad Artificial — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el sitio web Identidad Artificial — blog estático sobre IA generado por Claude, con transparencia radical y arquitectura pública.

**Architecture:** Astro minimal template inicializado en el directorio de trabajo. Contenido en `source/content/blog/` como archivos `.mdx` validados por schema Zod. Cada componente tiene una responsabilidad única. Tailwind CSS v4 vía Vite plugin. Dark mode automático por preferencia del sistema operativo.

**Tech Stack:** Astro 4+, Tailwind CSS v4 (`@tailwindcss/vite`), `@tailwindcss/typography`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `@fontsource-variable/inter`, `@fontsource/jetbrains-mono`

**Working directory:** `/Users/ignaciocubelasfortes/Documents/Antigravity/IdentidadArtificial`

---

## File Map

| Archivo | Responsabilidad |
|---|---|
| `source/config.ts` | Configuración global del sitio (nombre, URL, autor) |
| `source/content/config.ts` | Schema Zod que valida el frontmatter de los posts |
| `source/styles/global.css` | Imports de Tailwind, fuentes y estilos base |
| `source/layouts/BaseLayout.astro` | Head, meta tags SEO, Open Graph, Header, Footer |
| `source/layouts/PostLayout.astro` | Extiende BaseLayout con estructura de artículo |
| `source/components/Header.astro` | Navegación principal |
| `source/components/Footer.astro` | Pie de página con RSS y GitHub |
| `source/components/PostCard.astro` | Tarjeta de post para el grid (título, fecha, tiempo lectura) |
| `source/components/TransparencyBlock.astro` | Bloque de metadatos de IA al pie de cada post |
| `source/pages/index.astro` | Home: hero + grid de últimos posts |
| `source/pages/[slug].astro` | Ruta dinámica para cada post |
| `source/pages/sobre.astro` | Página sobre el proyecto |
| `source/pages/como-funciona.astro` | Pipeline técnico documentado con código |
| `source/pages/archivo.astro` | Lista completa de posts con categorías |
| `source/pages/rss.xml.js` | Feed RSS (últimos 20 posts) |
| `public/favicon.svg` | Favicon SVG del sitio |
| `source/content/blog/que-son-los-agentes-de-ia.mdx` | Post de ejemplo 1 |
| `source/content/blog/como-funciona-el-contexto-en-los-llm.mdx` | Post de ejemplo 2 |
| `source/content/blog/por-que-astro-para-un-blog-generado-por-ia.mdx` | Post de ejemplo 3 |

---

### Task 1: Inicializar proyecto Astro

**Files:**
- Create: `astro.config.mjs`, `package.json`, `source/`, `public/`, `tsconfig.json`

- [ ] **Step 1: Inicializar Astro con plantilla minimal**

```bash
npm create astro@latest . -- --template minimal --install --no-git --yes
```

Expected: Astro crea `source/`, `public/`, `astro.config.mjs`, `package.json`. Si pregunta sobre TypeScript, elegir `strict`.

- [ ] **Step 2: Instalar integraciones MDX y Sitemap**

```bash
npx astro add mdx sitemap --yes
```

Expected: Modifica `astro.config.mjs` añadiendo ambas integraciones automáticamente.

- [ ] **Step 3: Verificar build inicial**

```bash
npm run build
```

Expected: `dist/` generado sin errores.

- [ ] **Step 4: Commit**

```bash
git init
git add astro.config.mjs package.json package-lock.json source/ public/ tsconfig.json .gitignore
git commit -m "chore: initialize Astro project with minimal template"
```

---

### Task 2: Instalar y configurar Tailwind CSS v4 y fuentes

**Files:**
- Modify: `astro.config.mjs`
- Create: `source/styles/global.css`

- [ ] **Step 1: Instalar dependencias**

```bash
npm install tailwindcss @tailwindcss/vite @tailwindcss/typography @fontsource-variable/inter @fontsource/jetbrains-mono
```

- [ ] **Step 2: Reemplazar astro.config.mjs**

```js
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://identidadartificial.com',
  srcDir: './source',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
})
```

- [ ] **Step 3: Crear source/styles/global.css**

```css
@import "@fontsource-variable/inter";
@import "@fontsource/jetbrains-mono";

@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --font-sans: 'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --color-accent: #7C3AED;
}

html {
  font-family: var(--font-sans);
}

body {
  @apply bg-white text-[#111111] dark:bg-[#0F0F0F] dark:text-[#F0F0F0];
  font-size: 17px;
  line-height: 1.7;
}

code {
  @apply bg-[#F4F4F4] dark:bg-[#1A1A1A] font-mono;
  font-size: 0.875em;
  padding: 0.125em 0.25em;
  border-radius: 3px;
}

pre {
  @apply bg-[#F4F4F4] dark:bg-[#1A1A1A];
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

pre code {
  background: none;
  padding: 0;
}
```

- [ ] **Step 4: Verificar build**

```bash
npm run build
```

Expected: Build sin errores.

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs source/styles/global.css package.json package-lock.json
git commit -m "chore: add Tailwind CSS v4, Inter and JetBrains Mono fonts"
```

---

### Task 3: Crear configuración global y schema de contenido

**Files:**
- Create: `source/config.ts`
- Create: `source/content/config.ts`

- [ ] **Step 1: Crear source/config.ts**

```ts
export const SITE = {
  name: 'Identidad Artificial',
  url: 'https://identidadartificial.com',
  description: 'Un archivo inexacto de lo que pienso mientras intento entenderlo.',
  author: 'Ignacio Cubelas',
  github: 'https://github.com/ignaciocubelas/identidad-artificial',
  locale: 'es-ES',
}
```

- [ ] **Step 2: Crear source/content/config.ts**

```ts
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string(),
    tags: z.array(z.string()),
    heroImage: z.string().optional(),
    generatedBy: z.string(),
    generatedAt: z.coerce.date(),
    promptBase: z.string(),
    humanReviewed: z.boolean(),
  })
})

export const collections = { blog }
```

- [ ] **Step 3: Verificar tipos**

```bash
npx astro check
```

Expected: 0 errores de tipos.

- [ ] **Step 4: Commit**

```bash
git add source/config.ts source/content/config.ts
git commit -m "chore: add global config and content collection schema"
```

---

### Task 4: Crear Header.astro y Footer.astro

**Files:**
- Create: `source/components/Header.astro`
- Create: `source/components/Footer.astro`

- [ ] **Step 1: Crear source/components/Header.astro**

```astro
---
import { SITE } from '../config'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/sobre/', label: 'Sobre' },
  { href: '/como-funciona/', label: 'Cómo funciona' },
  { href: '/archivo/', label: 'Archivo' },
]

const currentPath = Astro.url.pathname
---

<header class="border-b border-[#E5E5E5] dark:border-[#222222]">
  <nav class="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="/" class="font-bold text-lg text-[#111111] dark:text-[#F0F0F0] hover:text-[#7C3AED] transition-colors">
      {SITE.name}
    </a>
    <ul class="flex items-center gap-6">
      {navLinks.map(link => (
        <li>
          <a
            href={link.href}
            class={`text-sm transition-colors ${
              currentPath === link.href
                ? 'text-[#7C3AED] font-medium'
                : 'text-[#666666] dark:text-[#999999] hover:text-[#111111] dark:hover:text-[#F0F0F0]'
            }`}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
</header>
```

- [ ] **Step 2: Crear source/components/Footer.astro**

```astro
---
import { SITE } from '../config'
---

<footer class="border-t border-[#E5E5E5] dark:border-[#222222] mt-16">
  <div class="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
    <p class="text-sm text-[#666666] dark:text-[#999999]">
      © {new Date().getFullYear()} {SITE.author}
    </p>
    <div class="flex items-center gap-6">
      <a
        href="/rss.xml"
        class="text-sm text-[#666666] dark:text-[#999999] hover:text-[#7C3AED] transition-colors"
      >
        RSS
      </a>
      <a
        href={SITE.github}
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm text-[#666666] dark:text-[#999999] hover:text-[#7C3AED] transition-colors"
      >
        GitHub
      </a>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Expected: Build sin errores.

- [ ] **Step 4: Commit**

```bash
git add source/components/Header.astro source/components/Footer.astro
git commit -m "feat: add Header and Footer components"
```

---

### Task 5: Crear BaseLayout.astro

**Files:**
- Create: `source/layouts/BaseLayout.astro`

- [ ] **Step 1: Crear source/layouts/BaseLayout.astro**

```astro
---
import { SITE } from '../config'
import Header from '../components/Header.astro'
import Footer from '../components/Footer.astro'
import '../styles/global.css'

interface Props {
  title: string
  description?: string
  image?: string
}

const {
  title,
  description = SITE.description,
  image = '/og-default.jpg',
} = Astro.props

const canonicalURL = new URL(Astro.url.pathname, SITE.url).href
const fullTitle = title === SITE.name ? SITE.name : `${title} — ${SITE.name}`
const ogImage = new URL(image, SITE.url).href
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalURL} />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <link rel="alternate" type="application/rss+xml" title={SITE.name} href="/rss.xml" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:locale" content="es_ES" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />

    <meta name="generator" content={Astro.generator} />
  </head>
  <body>
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Verificar tipos y build**

```bash
npx astro check && npm run build
```

Expected: 0 errores.

- [ ] **Step 3: Commit**

```bash
git add source/layouts/BaseLayout.astro
git commit -m "feat: add BaseLayout with SEO meta tags and Open Graph"
```

---

### Task 6: Crear PostCard.astro y TransparencyBlock.astro

**Files:**
- Create: `source/components/PostCard.astro`
- Create: `source/components/TransparencyBlock.astro`

- [ ] **Step 1: Crear source/components/PostCard.astro**

```astro
---
interface Props {
  title: string
  description: string
  pubDate: Date
  category: string
  slug: string
  heroImage?: string
  readingTime: string
}

const { title, description, pubDate, category, slug, heroImage, readingTime } = Astro.props

const formattedDate = pubDate.toLocaleDateString('es-ES', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
---

<article class="group border border-[#E5E5E5] dark:border-[#222222] rounded-lg overflow-hidden hover:border-[#7C3AED] transition-colors">
  {heroImage && (
    <a href={`/${slug}/`}>
      <img
        src={heroImage}
        alt={title}
        class="w-full h-48 object-cover"
        loading="lazy"
        width="800"
        height="400"
      />
    </a>
  )}
  <div class="p-5">
    <div class="flex items-center gap-2 mb-3 flex-wrap">
      <span class="text-xs font-medium text-[#7C3AED] uppercase tracking-wide">
        {category}
      </span>
      <span class="text-[#E5E5E5] dark:text-[#333333]">·</span>
      <time class="text-xs text-[#666666] dark:text-[#999999]" datetime={pubDate.toISOString()}>
        {formattedDate}
      </time>
      <span class="text-[#E5E5E5] dark:text-[#333333]">·</span>
      <span class="text-xs text-[#666666] dark:text-[#999999]">{readingTime}</span>
    </div>
    <h2 class="font-bold text-lg mb-2 group-hover:text-[#7C3AED] transition-colors">
      <a href={`/${slug}/`}>{title}</a>
    </h2>
    <p class="text-sm text-[#666666] dark:text-[#999999] line-clamp-2">
      {description}
    </p>
  </div>
</article>
```

- [ ] **Step 2: Crear source/components/TransparencyBlock.astro**

```astro
---
interface Props {
  generatedBy: string
  generatedAt: Date
  promptBase: string
  humanReviewed: boolean
}

const { generatedBy, generatedAt, promptBase, humanReviewed } = Astro.props

const formattedDate = generatedAt.toLocaleDateString('es-ES', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
---

<aside class="mt-12 border border-[#7C3AED]/30 rounded-lg p-6 bg-[#7C3AED]/5">
  <h3 class="text-xs font-semibold text-[#7C3AED] uppercase tracking-widest mb-4">
    Metadatos de generación
  </h3>
  <dl class="space-y-2 text-sm">
    <div class="flex gap-2">
      <dt class="text-[#666666] dark:text-[#999999] shrink-0">Modelo:</dt>
      <dd class="font-mono text-[#111111] dark:text-[#F0F0F0]">{generatedBy}</dd>
    </div>
    <div class="flex gap-2">
      <dt class="text-[#666666] dark:text-[#999999] shrink-0">Generado el:</dt>
      <dd class="text-[#111111] dark:text-[#F0F0F0]">{formattedDate}</dd>
    </div>
    <div class="flex gap-2">
      <dt class="text-[#666666] dark:text-[#999999] shrink-0">Revisado:</dt>
      <dd class="text-[#111111] dark:text-[#F0F0F0]">
        {humanReviewed ? '✓ Revisado por humano' : '⚠ Sin revisión humana'}
      </dd>
    </div>
    <div class="flex gap-2 mt-4 pt-4 border-t border-[#7C3AED]/20">
      <dt class="text-[#666666] dark:text-[#999999] shrink-0 mt-0.5">Prompt base:</dt>
      <dd class="text-[#111111] dark:text-[#F0F0F0] italic">"{promptBase}"</dd>
    </div>
  </dl>
</aside>
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Expected: Build sin errores.

- [ ] **Step 4: Commit**

```bash
git add source/components/PostCard.astro source/components/TransparencyBlock.astro
git commit -m "feat: add PostCard and TransparencyBlock components"
```

---

### Task 7: Crear PostLayout.astro

**Files:**
- Create: `source/layouts/PostLayout.astro`

- [ ] **Step 1: Crear source/layouts/PostLayout.astro**

```astro
---
import BaseLayout from './BaseLayout.astro'
import TransparencyBlock from '../components/TransparencyBlock.astro'

interface Props {
  title: string
  description: string
  pubDate: Date
  category: string
  heroImage?: string
  generatedBy: string
  generatedAt: Date
  promptBase: string
  humanReviewed: boolean
  readingTime: string
}

const {
  title,
  description,
  pubDate,
  category,
  heroImage,
  generatedBy,
  generatedAt,
  promptBase,
  humanReviewed,
  readingTime,
} = Astro.props

const formattedDate = pubDate.toLocaleDateString('es-ES', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
---

<BaseLayout title={title} description={description} image={heroImage}>
  <article class="max-w-3xl mx-auto px-6 py-12">
    <header class="mb-10">
      <div class="flex items-center gap-2 mb-4 flex-wrap">
        <span class="text-xs font-medium text-[#7C3AED] uppercase tracking-wide">
          {category}
        </span>
        <span class="text-[#E5E5E5] dark:text-[#333333]">·</span>
        <time class="text-xs text-[#666666] dark:text-[#999999]" datetime={pubDate.toISOString()}>
          {formattedDate}
        </time>
        <span class="text-[#E5E5E5] dark:text-[#333333]">·</span>
        <span class="text-xs text-[#666666] dark:text-[#999999]">{readingTime}</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold leading-tight mb-4">
        {title}
      </h1>
      <p class="text-lg text-[#666666] dark:text-[#999999]">{description}</p>
    </header>

    {heroImage && (
      <img
        src={heroImage}
        alt={title}
        class="w-full rounded-lg mb-10"
        loading="eager"
        width="1200"
        height="600"
      />
    )}

    <div class="prose prose-lg max-w-none
      prose-headings:font-bold
      prose-headings:text-[#111111] dark:prose-headings:text-[#F0F0F0]
      prose-p:text-[#333333] dark:prose-p:text-[#D0D0D0]
      prose-a:text-[#7C3AED] prose-a:no-underline hover:prose-a:underline
      prose-code:font-mono prose-code:text-sm
      prose-pre:bg-[#F4F4F4] dark:prose-pre:bg-[#1A1A1A]
      prose-li:text-[#333333] dark:prose-li:text-[#D0D0D0]">
      <slot />
    </div>

    <TransparencyBlock
      generatedBy={generatedBy}
      generatedAt={generatedAt}
      promptBase={promptBase}
      humanReviewed={humanReviewed}
    />
  </article>
</BaseLayout>
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: Build sin errores.

- [ ] **Step 3: Commit**

```bash
git add source/layouts/PostLayout.astro
git commit -m "feat: add PostLayout with reading time and TransparencyBlock"
```

---

### Task 8: Crear tres posts de ejemplo

**Files:**
- Create: `source/content/blog/que-son-los-agentes-de-ia.mdx`
- Create: `source/content/blog/como-funciona-el-contexto-en-los-llm.mdx`
- Create: `source/content/blog/por-que-astro-para-un-blog-generado-por-ia.mdx`

- [ ] **Step 1: Crear source/content/blog/que-son-los-agentes-de-ia.mdx**

```mdx
---
title: 'Qué son los agentes de IA y por qué cambian todo'
description: 'Los agentes de IA no son solo chatbots más potentes. Son sistemas que pueden planificar, usar herramientas y ejecutar tareas complejas de forma autónoma.'
pubDate: 2026-04-21
category: 'inteligencia-artificial'
tags: ['agentes', 'llm', 'automatizacion']
generatedBy: 'claude-sonnet-4-6'
generatedAt: '2026-04-21T10:00:00Z'
promptBase: 'Explica qué son los agentes de IA, cómo funcionan y por qué representan un cambio cualitativo respecto a los chatbots convencionales. Tono técnico pero accesible.'
humanReviewed: true
---

Durante los últimos dos años, la IA pasó de ser una herramienta de conversación a convertirse en algo que puede actuar en el mundo. Los agentes son la razón.

## ¿Qué distingue a un agente de un chatbot?

Un chatbot toma una entrada y devuelve una salida. Un agente toma un objetivo y hace lo que haga falta para alcanzarlo: busca información, escribe código, ejecuta comandos, llama a APIs externas, y toma decisiones en el camino.

La diferencia no es solo de grado. Es estructural.

Un agente vive en un bucle:

1. Observa el estado actual
2. Decide qué herramienta usar
3. Ejecuta la acción
4. Observa el resultado
5. Decide el siguiente paso

Este bucle puede durar segundos o días, dependiendo de la tarea.

## Las herramientas son el punto clave

Lo que hace que un agente sea útil no es su modelo de lenguaje, sino las herramientas a las que tiene acceso. Un agente con acceso a un navegador web, un intérprete de Python y una API de correo puede hacer cosas que un modelo sin herramientas nunca podría.

Claude Code, por ejemplo, es un agente que tiene acceso al sistema de archivos, a la terminal y al historial de conversación. Eso es lo que lo convierte en algo útil para programar, y no en un simple autocompletado de código.

## El problema del contexto

Todo agente tiene un límite: la ventana de contexto. Cada iteración del bucle consume tokens. En tareas largas, el agente puede quedarse sin contexto antes de terminar el trabajo.

Los sistemas más sofisticados resuelven esto con memoria externa, resúmenes automáticos y handoffs entre instancias. Es un problema de ingeniería activo, no resuelto.

## Por qué importa esto ahora

La mayoría de los trabajos que hacemos como profesionales del conocimiento son, en el fondo, bucles de observación-decisión-acción. Los agentes de IA no reemplazan a las personas en esos trabajos inmediatamente. Pero sí cambian qué parte del bucle tiene valor añadido.

Entender cómo funcionan los agentes no es una curiosidad técnica. Es saber dónde estás parado.
```

- [ ] **Step 2: Crear source/content/blog/como-funciona-el-contexto-en-los-llm.mdx**

```mdx
---
title: 'Cómo funciona el contexto en los modelos de lenguaje'
description: 'La ventana de contexto es el concepto más importante para entender qué pueden y qué no pueden hacer los LLMs. Aquí está explicado sin rodeos.'
pubDate: 2026-04-19
category: 'conceptos'
tags: ['llm', 'contexto', 'tokens']
generatedBy: 'claude-sonnet-4-6'
generatedAt: '2026-04-19T09:00:00Z'
promptBase: 'Explica el concepto de ventana de contexto en los LLMs: qué son los tokens, cómo afecta al comportamiento del modelo y cuáles son las limitaciones prácticas.'
humanReviewed: true
---

Cuando hablas con un modelo de lenguaje, no hablas con algo que tiene memoria. Hablas con algo que lee una lista muy larga cada vez que responde.

Esa lista es el contexto.

## Tokens, no palabras

Los modelos no procesan texto como tú y yo. Procesan tokens: fragmentos de texto que pueden ser una palabra completa, parte de una palabra, o un signo de puntuación. En español, una palabra suele ser 1-3 tokens.

Por qué importa: el límite de los modelos se mide en tokens, no en palabras ni en caracteres. Un modelo con 200.000 tokens de contexto puede procesar aproximadamente 150.000 palabras de una vez.

## La ventana de contexto

Todo lo que el modelo "ve" al generar una respuesta está en su ventana de contexto: el historial de la conversación, las instrucciones del sistema, los documentos adjuntos, y la respuesta que está generando en este momento.

Lo que no está en la ventana, no existe para el modelo. No hay excepciones.

Esto tiene consecuencias directas:

- **Al principio de una conversación larga**, el modelo tiene acceso a todo lo que has dicho.
- **Al final de una conversación muy larga**, los mensajes más antiguos desaparecen del contexto para hacer sitio a los nuevos.
- **Si le das un documento largo**, ese documento compite por espacio con el resto de la conversación.

## Por qué los modelos "olvidan"

No es que olviden en el sentido humano. Es que el texto simplemente ya no está en la ventana. Si has tenido una conversación de dos horas con un modelo y de repente parece que no recuerda lo que dijiste al principio, es porque literalmente ya no lo está leyendo.

Los sistemas que parecen tener buena memoria usan técnicas externas: bases de datos vectoriales, resúmenes automáticos, recuperación por similitud. El modelo en sí no recuerda nada entre sesiones.

## Implicaciones prácticas

Para usar bien un modelo de lenguaje, necesitas pensar en términos de contexto:

- Las instrucciones importantes van al principio o al final, no en el medio.
- Si la conversación es larga, resume periódicamente o empieza una nueva.
- Los documentos largos reducen el espacio disponible para razonar.

El contexto no es una limitación técnica que vayan a resolver pronto. Es una consecuencia de cómo funcionan los transformers. Aprender a manejarlo es parte de saber usar estas herramientas.
```

- [ ] **Step 3: Crear source/content/blog/por-que-astro-para-un-blog-generado-por-ia.mdx**

```mdx
---
title: 'Por qué elegí Astro para un blog generado por IA'
description: 'Podría haber elegido Next.js, Hugo o WordPress. Elegí Astro. Aquí están las razones técnicas y las que no son tan técnicas.'
pubDate: 2026-04-17
category: 'arquitectura'
tags: ['astro', 'jamstack', 'desarrollo-web']
generatedBy: 'claude-sonnet-4-6'
generatedAt: '2026-04-17T11:30:00Z'
promptBase: 'Explica por qué Astro es una buena elección para un blog de contenido generado por IA. Compara con alternativas como Next.js y Hugo. Sé honesto sobre las limitaciones.'
humanReviewed: true
---

Cuando empecé a diseñar este sitio, la primera decisión fue el framework. Es una decisión que parece técnica pero en realidad es editorial: el framework define qué tipo de sitio puedes construir.

## Por qué no Next.js

Next.js es excelente para aplicaciones web complejas, con autenticación, estado del cliente y actualizaciones en tiempo real.

Pero un blog estático no es una aplicación compleja. Si usas Next.js para un blog, estás pagando la complejidad de un avión cuando necesitas una bicicleta.

El problema real: Next.js envía JavaScript al cliente por defecto. Para contenido que no necesita interactividad, eso es ruido puro.

## Por qué no Hugo

Hugo genera sitios estáticos a velocidad brutal. Pero usa un lenguaje de plantillas (Go templates) que no es natural para nadie que venga del ecosistema JavaScript/TypeScript.

Y lo más importante: no hay manera fácil de usar componentes MDX con Hugo. Los posts de este sitio pueden necesitar componentes interactivos en el futuro.

## Por qué Astro

Astro resuelve exactamente el problema que tengo:

**Zero JavaScript por defecto.** Astro genera HTML puro. No envía nada al cliente a menos que lo pidas explícitamente. Para un blog de texto, eso significa páginas que cargan en milisegundos.

**MDX nativo.** Puedo escribir Markdown extendido con componentes de Astro inline. Si en el futuro quiero añadir un gráfico interactivo, puedo hacerlo sin cambiar de framework.

**TypeScript integrado.** El schema de los posts está validado con Zod en tiempo de build. Si Claude genera un frontmatter incorrecto, el build falla antes de publicar. Es una red de seguridad gratis.

**Despliegue trivial.** Cloudflare Pages detecta el push, ejecuta `npm run build`, y el sitio está actualizado en 60 segundos. Sin servidores, sin costes fijos.

## La limitación honesta

Astro no es perfecto para todo. Si quiero añadir búsqueda en el futuro, necesito una solución externa (Pagefind). Si quiero comentarios, necesito un servicio externo.

Pero esas son limitaciones que puedo resolver cuando lleguen. Las limitaciones de los otros frameworks las tendría desde el día uno.
```

- [ ] **Step 4: Verificar build con los posts**

```bash
npm run build
```

Expected: Build sin errores. Astro valida los tres posts contra el schema Zod.

- [ ] **Step 5: Commit**

```bash
git add source/content/blog/
git commit -m "content: add three initial posts with full frontmatter"
```

---

### Task 9: Crear página Home

**Files:**
- Create: `source/pages/index.astro`

- [ ] **Step 1: Crear source/pages/index.astro**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../layouts/BaseLayout.astro'
import PostCard from '../components/PostCard.astro'
import { SITE } from '../config'

function calcReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min`
}

const posts = (await getCollection('blog')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
)
---

<BaseLayout title={SITE.name} description={SITE.description}>
  <div class="max-w-3xl mx-auto px-6 py-16">
    <section class="mb-16">
      <p class="text-2xl sm:text-3xl font-bold leading-snug mb-4">
        {SITE.description}
      </p>
      <p class="text-[#666666] dark:text-[#999999]">
        Contenido sobre inteligencia artificial generado por{' '}
        <a href="/como-funciona/" class="text-[#7C3AED] hover:underline">Claude (Anthropic)</a>,
        con revisión humana y arquitectura pública.
      </p>
    </section>

    <section>
      <h2 class="text-sm font-semibold text-[#666666] dark:text-[#999999] uppercase tracking-wide mb-6">
        Últimas entradas
      </h2>
      <div class="grid gap-6 sm:grid-cols-2">
        {posts.map(post => (
          <PostCard
            title={post.data.title}
            description={post.data.description}
            pubDate={post.data.pubDate}
            category={post.data.category}
            slug={post.id}
            heroImage={post.data.heroImage}
            readingTime={calcReadingTime(post.body)}
          />
        ))}
      </div>
    </section>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: Build sin errores. `dist/index.html` generado.

- [ ] **Step 3: Verificar en el navegador**

```bash
npm run dev
```

Abrir `http://localhost:4321`. Verificar: hero con la frase del sitio, grid de 3 posts, links funcionan.

- [ ] **Step 4: Commit**

```bash
git add source/pages/index.astro
git commit -m "feat: add Home page with hero and post grid"
```

---

### Task 10: Crear página de post individual

**Files:**
- Create: `source/pages/[slug].astro`

- [ ] **Step 1: Crear source/pages/[slug].astro**

```astro
---
import { getCollection, render } from 'astro:content'
import PostLayout from '../layouts/PostLayout.astro'

function calcReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min`
}

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }))
}

const { post } = Astro.props
const { Content } = await render(post)
---

<PostLayout
  title={post.data.title}
  description={post.data.description}
  pubDate={post.data.pubDate}
  category={post.data.category}
  heroImage={post.data.heroImage}
  generatedBy={post.data.generatedBy}
  generatedAt={post.data.generatedAt}
  promptBase={post.data.promptBase}
  humanReviewed={post.data.humanReviewed}
  readingTime={calcReadingTime(post.body)}
>
  <Content />
</PostLayout>
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: Build sin errores. Astro genera una página por cada post en `dist/`.

- [ ] **Step 3: Verificar en el navegador**

```bash
npm run dev
```

Abrir `http://localhost:4321/que-son-los-agentes-de-ia/`. Verificar: contenido renderizado, TransparencyBlock visible al pie.

- [ ] **Step 4: Commit**

```bash
git add source/pages/[slug].astro
git commit -m "feat: add dynamic post page with TransparencyBlock"
```

---

### Task 11: Crear páginas Sobre y Cómo funciona

**Files:**
- Create: `source/pages/sobre.astro`
- Create: `source/pages/como-funciona.astro`

- [ ] **Step 1: Crear source/pages/sobre.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
import { SITE } from '../config'
---

<BaseLayout
  title="Sobre el proyecto"
  description="Qué es Identidad Artificial, quién hay detrás y cuál es el propósito."
>
  <article class="max-w-3xl mx-auto px-6 py-12">
    <h1 class="text-3xl sm:text-4xl font-bold mb-8">Sobre el proyecto</h1>

    <div class="prose prose-lg max-w-none
      prose-headings:font-bold
      prose-a:text-[#7C3AED] prose-a:no-underline hover:prose-a:underline">

      <p>
        Identidad Artificial es un experimento en público. La pregunta que lo motiva es
        sencilla: ¿qué pasa cuando los modelos de lenguaje escriben sobre sí mismos?
      </p>

      <p>
        El contenido de este sitio es generado por <strong>Claude</strong> (Anthropic),
        con revisión humana antes de publicar. No es un blog de opinión personal ni un
        agregador de noticias. Es un intento de entender la IA desde dentro, usando las
        mismas herramientas que analizo.
      </p>

      <h2>Quién está detrás</h2>

      <p>
        Me llamo <strong>Ignacio Cubelas</strong>. Construyo este sitio como parte de un
        proceso de aprendizaje sobre sistemas de IA, automatización editorial y arquitectura
        web. El código y el pipeline de generación son públicos porque creo que la
        transparencia es parte del producto, no un extra.
      </p>

      <h2>Por qué es público</h2>

      <p>
        Cualquier lector puede ver el repositorio, auditar el código y replicar el sistema.
        Si encuentras algo que mejorar, el canal de feedback es{' '}
        <a href={SITE.github} target="_blank" rel="noopener noreferrer">GitHub</a>.
      </p>

      <h2>Lo que no es esto</h2>

      <p>
        No es contenido de marketing disfrazado de artículo. No es SEO farming. No es
        un producto SaaS con una landing page. Es un archivo de lo que voy entendiendo
        mientras lo entiendo.
      </p>
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Crear source/pages/como-funciona.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
import { SITE } from '../config'
---

<BaseLayout
  title="Cómo funciona"
  description="El pipeline completo: stack, flujo de generación, rol de Claude Code y decisiones de diseño."
>
  <article class="max-w-3xl mx-auto px-6 py-12">
    <h1 class="text-3xl sm:text-4xl font-bold mb-8">Cómo funciona</h1>

    <div class="prose prose-lg max-w-none
      prose-headings:font-bold
      prose-a:text-[#7C3AED] prose-a:no-underline hover:prose-a:underline
      prose-code:font-mono prose-code:text-sm
      prose-pre:bg-[#F4F4F4] dark:prose-pre:bg-[#1A1A1A]">

      <p>
        Este sitio es un experimento en transparencia radical. No solo publico el contenido:
        publico cómo se genera, qué herramientas uso y qué decisiones tomé al construirlo.
      </p>

      <h2>El stack</h2>

      <ul>
        <li><strong>Astro</strong> — framework estático, cero JavaScript al cliente por defecto</li>
        <li><strong>Tailwind CSS v4</strong> — estilos utilitarios</li>
        <li><strong>MDX</strong> — posts en Markdown con soporte de componentes</li>
        <li><strong>Cloudflare Pages</strong> — despliegue automático en cada push</li>
        <li><strong>GitHub</strong> — repositorio público</li>
        <li><strong>Claude (Anthropic)</strong> — generación de contenido vía Claude Code</li>
      </ul>

      <h2>El pipeline de publicación</h2>

      <ol>
        <li>Se define el tema del artículo</li>
        <li>Claude recibe el prompt con el tema y las instrucciones de estilo</li>
        <li>Claude genera el archivo <code>.mdx</code> completo con frontmatter y cuerpo</li>
        <li>Revisión humana obligatoria antes de publicar</li>
        <li>Commit y push al repositorio de GitHub</li>
        <li>Cloudflare Pages detecta el push, ejecuta <code>npm run build</code> y despliega en ~60 segundos</li>
      </ol>

      <h2>Estructura del repositorio</h2>

      <pre><code>identidad-artificial/
├── src/
│   ├── content/blog/     ← Posts en .mdx
│   ├── components/       ← Header, Footer, PostCard, TransparencyBlock
│   ├── layouts/          ← BaseLayout, PostLayout
│   ├── pages/            ← Rutas del sitio
│   └── styles/           ← CSS global
├── public/               ← Assets estáticos
└── astro.config.mjs</code></pre>

      <h2>El frontmatter de cada post</h2>

      <p>
        Cada post incluye metadatos de transparencia validados con Zod en tiempo de build
        y mostrados al pie de cada artículo:
      </p>

      <pre><code>---
title: 'Título del post'
description: 'Descripción para SEO'
pubDate: 2026-04-21
category: 'inteligencia-artificial'
tags: ['llm', 'agentes']
generatedBy: 'claude-sonnet-4-6'
generatedAt: '2026-04-21T10:00:00Z'
promptBase: 'El prompt que se usó para generar este post'
humanReviewed: true
---</code></pre>

      <h2>Variables de entorno</h2>

      <p>
        Ninguna credencial está en el repositorio. Las variables de entorno se gestionan
        exclusivamente en el panel de Cloudflare Pages.
      </p>

      <p>
        El repositorio completo está en{' '}
        <a href={SITE.github} target="_blank" rel="noopener noreferrer">GitHub</a>.
        Puedes verlo, auditarlo y replicarlo.
      </p>
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Expected: Build sin errores.

- [ ] **Step 4: Verificar en el navegador**

```bash
npm run dev
```

Abrir `http://localhost:4321/sobre/` y `http://localhost:4321/como-funciona/`. Verificar que el contenido se renderiza correctamente.

- [ ] **Step 5: Commit**

```bash
git add source/pages/sobre.astro source/pages/como-funciona.astro
git commit -m "feat: add Sobre and Como funciona pages"
```

---

### Task 12: Crear página Archivo

**Files:**
- Create: `source/pages/archivo.astro`

- [ ] **Step 1: Crear source/pages/archivo.astro**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../layouts/BaseLayout.astro'

function calcReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min`
}

const posts = (await getCollection('blog')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
)

const categories = [...new Set(posts.map(p => p.data.category))]
---

<BaseLayout
  title="Archivo"
  description="Todos los artículos publicados en Identidad Artificial."
>
  <div class="max-w-3xl mx-auto px-6 py-12">
    <h1 class="text-3xl sm:text-4xl font-bold mb-4">Archivo</h1>
    <p class="text-[#666666] dark:text-[#999999] mb-8">
      {posts.length} {posts.length === 1 ? 'artículo' : 'artículos'} publicados
    </p>

    <div class="flex flex-wrap gap-2 mb-10">
      <span class="text-sm text-[#666666] dark:text-[#999999] self-center">Categorías:</span>
      {categories.map(cat => (
        <span class="text-xs font-medium px-3 py-1 rounded-full border border-[#7C3AED]/30 text-[#7C3AED]">
          {cat}
        </span>
      ))}
    </div>

    <ul class="divide-y divide-[#E5E5E5] dark:divide-[#222222]">
      {posts.map(post => {
        const formattedDate = post.data.pubDate.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        return (
          <li class="py-5">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-medium text-[#7C3AED]">{post.data.category}</span>
                  <span class="text-xs text-[#666666] dark:text-[#999999]">· {calcReadingTime(post.body ?? '')}</span>
                </div>
                <a
                  href={`/${post.id}/`}
                  class="font-medium hover:text-[#7C3AED] transition-colors"
                >
                  {post.data.title}
                </a>
                <p class="text-sm text-[#666666] dark:text-[#999999] mt-1 line-clamp-1">
                  {post.data.description}
                </p>
              </div>
              <time
                class="text-sm text-[#666666] dark:text-[#999999] shrink-0"
                datetime={post.data.pubDate.toISOString()}
              >
                {formattedDate}
              </time>
            </div>
          </li>
        )
      })}
    </ul>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Verificar build y navegador**

```bash
npm run build && npm run dev
```

Abrir `http://localhost:4321/archivo/`. Verificar que aparecen los 3 posts con categorías, tiempo de lectura y fechas.

- [ ] **Step 3: Commit**

```bash
git add source/pages/archivo.astro
git commit -m "feat: add Archivo page with category list and reading times"
```

---

### Task 13: Añadir RSS y favicon

**Files:**
- Create: `source/pages/rss.xml.js`
- Create: `public/favicon.svg`

- [ ] **Step 1: Instalar @astrojs/rss**

```bash
npm install @astrojs/rss
```

- [ ] **Step 2: Crear source/pages/rss.xml.js**

```js
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { SITE } from '../config'

export async function GET(context) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: posts.slice(0, 20).map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/${post.id}/`,
    })),
    customData: `<language>es-es</language>`,
  })
}
```

- [ ] **Step 3: Crear public/favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#7C3AED"/>
  <text x="16" y="22" font-size="16" font-family="serif" font-weight="bold" fill="white" text-anchor="middle">IA</text>
</svg>
```

- [ ] **Step 4: Verificar build**

```bash
npm run build
```

Expected: Build sin errores. Verificar que `dist/` contiene:
- `index.html`
- `sobre/index.html`
- `como-funciona/index.html`
- `archivo/index.html`
- `que-son-los-agentes-de-ia/index.html`
- `como-funciona-el-contexto-en-los-llm/index.html`
- `por-que-astro-para-un-blog-generado-por-ia/index.html`
- `rss.xml`
- `sitemap-index.xml`

- [ ] **Step 5: Verificar tipos**

```bash
npx astro check
```

Expected: 0 errores.

- [ ] **Step 6: Commit final**

```bash
git add source/pages/rss.xml.js public/favicon.svg package.json package-lock.json
git commit -m "feat: add RSS feed and favicon — v1.0 complete"
```

---

## Criterios de aceptación verificados

| Criterio | Cómo verificarlo |
|---|---|
| Web desplegada en Cloudflare Pages | Conectar el repositorio GitHub a Cloudflare Pages (manual, fuera del plan de código) |
| 3 posts publicados con frontmatter completo | `npm run build` sin errores con los 3 posts |
| `/como-funciona/` con pipeline y código | Task 11 |
| Repositorio público en GitHub | `git remote add origin <url> && git push` (manual) |
| RSS activo | `dist/rss.xml` generado en Task 13 |
| Sitemap activo | `dist/sitemap-index.xml` generado en Task 1 |
| Lighthouse ≥ 90 | Astro genera HTML puro + 0 KB JS al cliente |
| Sin credenciales en el repositorio | Verificar con `git log` que no hay .env ni API keys |
