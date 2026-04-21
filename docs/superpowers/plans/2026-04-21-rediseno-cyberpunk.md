# Rediseño Visual Cyberpunk — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar toda la web a un estilo oscuro cyberpunk coherente — fondo `#1C1C2C`, tarjetas `#24243A`, badge de categoría morado sólido, botón "Leer artículo →".

**Architecture:** La web pasa a ser siempre oscura (sin modo claro). Se eliminan todos los prefijos `dark:` de Tailwind y se sustituyen los colores claros por los nuevos colores oscuros directamente. El CSS base en `global.css` define el fondo y texto global; cada componente actualiza sus propios colores.

**Tech Stack:** Astro, Tailwind CSS v4, @tailwindcss/typography

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `source/styles/global.css` | Nuevo fondo/texto global, eliminar lógica dark |
| `source/layouts/BaseLayout.astro` | Añadir `class="bg-[#1C1C2C]"` al `<html>` |
| `source/components/Header.astro` | Nuevos colores oscuros |
| `source/components/Footer.astro` | Nuevos colores oscuros |
| `source/components/PostCard.astro` | Restyle completo: badge + botón |
| `source/components/TransparencyBlock.astro` | Nuevos colores oscuros |
| `source/layouts/PostLayout.astro` | Nuevos colores de prose |
| `source/pages/index.astro` | Nuevos colores de texto |
| `source/pages/archivo.astro` | Nuevos colores de texto |
| `source/pages/sobre.astro` | Nuevos colores de prose |
| `source/pages/como-funciona.astro` | Nuevos colores de prose |

---

### Task 1: Actualizar global.css

**Files:**
- Modify: `source/styles/global.css`

- [ ] **Reemplazar el contenido completo de `source/styles/global.css`:**

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
  @apply bg-[#1C1C2C] text-[#E8E8F0];
  font-size: 17px;
  line-height: 1.7;
}

code {
  @apply bg-[#24243A] font-mono;
  font-size: 0.875em;
  padding: 0.125em 0.25em;
  border-radius: 3px;
}

pre {
  @apply bg-[#24243A];
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

pre code {
  background: none;
  padding: 0;
}
```

- [ ] **Verificar que el build no da errores:**

```bash
cd /Users/ignaciocubelasfortes/Documents/Antigravity/IdentidadArtificial
npm run build
```

Esperado: sin errores. Si hay errores de Tailwind, revisar la sintaxis del `@apply`.

- [ ] **Commit:**

```bash
git add source/styles/global.css
git commit -m "style: set dark cyberpunk base colors in global.css"
```

---

### Task 2: Actualizar BaseLayout.astro

**Files:**
- Modify: `source/layouts/BaseLayout.astro`

- [ ] **Añadir `class="bg-[#1C1C2C]"` al tag `<html>` para evitar flash blanco al cargar:**

Cambiar la línea:
```html
<html lang="es">
```
Por:
```html
<html lang="es" class="bg-[#1C1C2C]">
```

- [ ] **Commit:**

```bash
git add source/layouts/BaseLayout.astro
git commit -m "style: add dark bg to html tag to prevent flash"
```

---

### Task 3: Actualizar Header.astro

**Files:**
- Modify: `source/components/Header.astro`

- [ ] **Reemplazar el contenido completo de `source/components/Header.astro`:**

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

<header class="border-b border-[#2A2A40] bg-[#1C1C2C]">
  <nav class="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="/" class="font-bold text-lg text-[#E8E8F0] hover:text-[#8B5CF6] transition-colors">
      {SITE.name}
    </a>
    <ul class="flex items-center gap-6">
      {navLinks.map(link => (
        <li>
          <a
            href={link.href}
            class={`text-sm transition-colors ${
              currentPath === link.href
                ? 'text-[#8B5CF6] font-medium'
                : 'text-[#A0A0C0] hover:text-[#E8E8F0]'
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

- [ ] **Commit:**

```bash
git add source/components/Header.astro
git commit -m "style: update Header to dark cyberpunk theme"
```

---

### Task 4: Actualizar Footer.astro

**Files:**
- Modify: `source/components/Footer.astro`

- [ ] **Reemplazar el contenido completo de `source/components/Footer.astro`:**

```astro
---
import { SITE } from '../config'
---

<footer class="border-t border-[#2A2A40] bg-[#1C1C2C] mt-16">
  <div class="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
    <p class="text-sm text-[#A0A0C0]">
      © {new Date().getFullYear()} {SITE.author}
    </p>
    <div class="flex items-center gap-6">
      <a
        href="/rss.xml"
        class="text-sm text-[#A0A0C0] hover:text-[#8B5CF6] transition-colors"
      >
        RSS
      </a>
      <a
        href={SITE.github}
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm text-[#A0A0C0] hover:text-[#8B5CF6] transition-colors"
      >
        GitHub
      </a>
    </div>
  </div>
</footer>
```

- [ ] **Commit:**

```bash
git add source/components/Footer.astro
git commit -m "style: update Footer to dark cyberpunk theme"
```

---

### Task 5: Actualizar PostCard.astro

**Files:**
- Modify: `source/components/PostCard.astro`

Este es el cambio más importante: badge de categoría con fondo morado sólido y botón "Leer artículo →".

- [ ] **Reemplazar el contenido completo de `source/components/PostCard.astro`:**

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

<article class="group bg-[#24243A] border border-[#2E2E48] rounded-lg overflow-hidden hover:border-[#6D28D9] hover:shadow-[0_0_16px_rgba(109,40,217,0.10)] transition-all">
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
      <span class="inline-block bg-[#6D28D9] text-white text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded-[3px]">
        {category}
      </span>
      <span class="text-[#3A3A54]">·</span>
      <time class="text-xs text-[#A0A0C0]" datetime={pubDate.toISOString()}>
        {formattedDate}
      </time>
      <span class="text-[#3A3A54]">·</span>
      <span class="text-xs text-[#A0A0C0]">{readingTime}</span>
    </div>
    <h2 class="font-bold text-base mb-2 text-[#E8E8F0] group-hover:text-white transition-colors leading-snug">
      <a href={`/${slug}/`}>{title}</a>
    </h2>
    <p class="text-sm text-[#A0A0C0] line-clamp-2 mb-4">
      {description}
    </p>
    <a
      href={`/${slug}/`}
      class="inline-block border border-[#6D28D9] text-[#A78BFA] text-xs px-3 py-1.5 rounded hover:bg-[#6D28D9]/10 transition-colors"
    >
      Leer artículo →
    </a>
  </div>
</article>
```

- [ ] **Commit:**

```bash
git add source/components/PostCard.astro
git commit -m "style: restyle PostCard with badge, dark theme and read button"
```

---

### Task 6: Actualizar TransparencyBlock.astro

**Files:**
- Modify: `source/components/TransparencyBlock.astro`

- [ ] **Reemplazar el contenido completo de `source/components/TransparencyBlock.astro`:**

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

<aside class="mt-12 border border-[#6D28D9]/30 rounded-lg p-6 bg-[#6D28D9]/5">
  <h3 class="text-xs font-semibold text-[#8B5CF6] uppercase tracking-widest mb-4">
    Metadatos de generación
  </h3>
  <dl class="space-y-2 text-sm">
    <div class="flex gap-2">
      <dt class="text-[#A0A0C0] shrink-0">Modelo:</dt>
      <dd class="font-mono text-[#E8E8F0]">{generatedBy}</dd>
    </div>
    <div class="flex gap-2">
      <dt class="text-[#A0A0C0] shrink-0">Generado el:</dt>
      <dd class="text-[#E8E8F0]">{formattedDate}</dd>
    </div>
    <div class="flex gap-2">
      <dt class="text-[#A0A0C0] shrink-0">Revisado:</dt>
      <dd class="text-[#E8E8F0]">
        {humanReviewed ? '✓ Revisado por humano' : '⚠ Sin revisión humana'}
      </dd>
    </div>
    <div class="flex gap-2 mt-4 pt-4 border-t border-[#6D28D9]/20">
      <dt class="text-[#A0A0C0] shrink-0 mt-0.5">Prompt base:</dt>
      <dd class="text-[#E8E8F0] italic">"{promptBase}"</dd>
    </div>
  </dl>
</aside>
```

- [ ] **Commit:**

```bash
git add source/components/TransparencyBlock.astro
git commit -m "style: update TransparencyBlock to dark cyberpunk theme"
```

---

### Task 7: Actualizar PostLayout.astro

**Files:**
- Modify: `source/layouts/PostLayout.astro`

- [ ] **Reemplazar el contenido completo de `source/layouts/PostLayout.astro`:**

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
        <span class="inline-block bg-[#6D28D9] text-white text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded-[3px]">
          {category}
        </span>
        <span class="text-[#3A3A54]">·</span>
        <time class="text-xs text-[#A0A0C0]" datetime={pubDate.toISOString()}>
          {formattedDate}
        </time>
        <span class="text-[#3A3A54]">·</span>
        <span class="text-xs text-[#A0A0C0]">{readingTime}</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold leading-tight mb-4 text-[#E8E8F0]">
        {title}
      </h1>
      <p class="text-lg text-[#A0A0C0]">{description}</p>
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
      prose-headings:text-[#E8E8F0]
      prose-p:text-[#C8C8E0]
      prose-a:text-[#8B5CF6] prose-a:no-underline hover:prose-a:underline
      prose-code:font-mono prose-code:text-sm prose-code:text-[#E8E8F0]
      prose-pre:bg-[#24243A]
      prose-li:text-[#C8C8E0]
      prose-strong:text-[#E8E8F0]">
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

- [ ] **Commit:**

```bash
git add source/layouts/PostLayout.astro
git commit -m "style: update PostLayout to dark cyberpunk theme"
```

---

### Task 8: Actualizar index.astro

**Files:**
- Modify: `source/pages/index.astro`

- [ ] **Reemplazar el contenido completo de `source/pages/index.astro`:**

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
      <p class="text-2xl sm:text-3xl font-bold leading-snug mb-4 text-[#E8E8F0]">
        {SITE.description}
      </p>
      <p class="text-[#A0A0C0]">
        Contenido sobre inteligencia artificial generado por{' '}
        <a href="/como-funciona/" class="text-[#8B5CF6] hover:underline">Claude (Anthropic)</a>,
        con revisión humana y arquitectura pública.
      </p>
    </section>

    <section>
      <h2 class="text-xs font-semibold text-[#A0A0C0] uppercase tracking-widest mb-6 pb-3 border-b border-[#2A2A40]">
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
            readingTime={calcReadingTime(post.body ?? '')}
          />
        ))}
      </div>
    </section>
  </div>
</BaseLayout>
```

- [ ] **Commit:**

```bash
git add source/pages/index.astro
git commit -m "style: update index page to dark cyberpunk theme"
```

---

### Task 9: Actualizar archivo.astro

**Files:**
- Modify: `source/pages/archivo.astro`

- [ ] **Reemplazar el contenido completo de `source/pages/archivo.astro`:**

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
    <h1 class="text-3xl sm:text-4xl font-bold mb-4 text-[#E8E8F0]">Archivo</h1>
    <p class="text-[#A0A0C0] mb-8">
      {posts.length} {posts.length === 1 ? 'artículo' : 'artículos'} publicados
    </p>

    <div class="flex flex-wrap gap-2 mb-10">
      <span class="text-sm text-[#A0A0C0] self-center">Categorías:</span>
      {categories.map(cat => (
        <span class="text-xs font-medium px-3 py-1 rounded-full border border-[#6D28D9]/50 text-[#A78BFA]">
          {cat}
        </span>
      ))}
    </div>

    <ul class="divide-y divide-[#2A2A40]">
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
                  <span class="inline-block bg-[#6D28D9] text-white text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded-[3px]">
                    {post.data.category}
                  </span>
                  <span class="text-xs text-[#A0A0C0]">· {calcReadingTime(post.body ?? '')}</span>
                </div>
                <a
                  href={`/${post.id}/`}
                  class="font-medium text-[#E8E8F0] hover:text-[#8B5CF6] transition-colors"
                >
                  {post.data.title}
                </a>
                <p class="text-sm text-[#A0A0C0] mt-1 line-clamp-1">
                  {post.data.description}
                </p>
              </div>
              <time
                class="text-sm text-[#A0A0C0] shrink-0"
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

- [ ] **Commit:**

```bash
git add source/pages/archivo.astro
git commit -m "style: update Archivo page to dark cyberpunk theme"
```

---

### Task 10: Actualizar sobre.astro y como-funciona.astro

**Files:**
- Modify: `source/pages/sobre.astro`
- Modify: `source/pages/como-funciona.astro`

- [ ] **Reemplazar el bloque `class` del `<div class="prose ...">` en `source/pages/sobre.astro`:**

Cambiar:
```astro
<div class="prose prose-lg max-w-none
  prose-headings:font-bold
  prose-a:text-[#7C3AED] prose-a:no-underline hover:prose-a:underline">
```
Por:
```astro
<div class="prose prose-lg max-w-none
  prose-headings:font-bold prose-headings:text-[#E8E8F0]
  prose-p:text-[#C8C8E0]
  prose-li:text-[#C8C8E0]
  prose-strong:text-[#E8E8F0]
  prose-a:text-[#8B5CF6] prose-a:no-underline hover:prose-a:underline">
```

También cambiar el `<h1>` para que tenga color explícito:
```astro
<h1 class="text-3xl sm:text-4xl font-bold mb-8 text-[#E8E8F0]">Sobre el proyecto</h1>
```

- [ ] **Reemplazar el bloque `class` del `<div class="prose ...">` en `source/pages/como-funciona.astro`:**

Cambiar:
```astro
<div class="prose prose-lg max-w-none
  prose-headings:font-bold
  prose-a:text-[#7C3AED] prose-a:no-underline hover:prose-a:underline
  prose-code:font-mono prose-code:text-sm
  prose-pre:bg-[#F4F4F4] dark:prose-pre:bg-[#1A1A1A]">
```
Por:
```astro
<div class="prose prose-lg max-w-none
  prose-headings:font-bold prose-headings:text-[#E8E8F0]
  prose-p:text-[#C8C8E0]
  prose-li:text-[#C8C8E0]
  prose-strong:text-[#E8E8F0]
  prose-a:text-[#8B5CF6] prose-a:no-underline hover:prose-a:underline
  prose-code:font-mono prose-code:text-sm prose-code:text-[#E8E8F0]
  prose-pre:bg-[#24243A]">
```

También cambiar el `<h1>`:
```astro
<h1 class="text-3xl sm:text-4xl font-bold mb-8 text-[#E8E8F0]">Cómo funciona</h1>
```

- [ ] **Commit:**

```bash
git add source/pages/sobre.astro source/pages/como-funciona.astro
git commit -m "style: update Sobre and Como-funciona pages to dark cyberpunk theme"
```

---

### Task 11: Verificación final

- [ ] **Arrancar el servidor de desarrollo:**

```bash
npm run dev
```

- [ ] **Abrir http://localhost:4321 y verificar página a página:**
  - [ ] Inicio — fondo oscuro, tarjetas con badge morado sólido, botón "Leer artículo →"
  - [ ] Un artículo — header del post con badge, prose oscura legible, TransparencyBlock
  - [ ] Archivo — badges en lista, separadores oscuros
  - [ ] Sobre — texto legible sobre fondo oscuro
  - [ ] Cómo funciona — código y pre con fondo oscuro

- [ ] **Build de producción limpio:**

```bash
npm run build
```

Esperado: sin errores ni warnings de tipos.

- [ ] **Commit final si todo está bien:**

```bash
git add -A
git commit -m "style: complete cyberpunk dark theme rollout"
```
