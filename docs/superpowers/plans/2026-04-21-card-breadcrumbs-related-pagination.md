# Card + Breadcrumbs + RelatedPosts + Pagination — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 UI components to the Identidad Artificial Astro 6 blog: enhanced PostCard (featured variant), Breadcrumbs, RelatedPosts, and Pagination (3 posts/page on home + archivo).

**Architecture:** Static Astro site. Pagination uses `getStaticPaths` + `paginate()` in new route files (`pages/pagina/[page].astro`, `pages/archivo/pagina/[page].astro`). All components are `.astro` server-side only (no client JS). Existing `index.astro` and `archivo.astro` serve page 1; new files serve pages 2+.

**Tech Stack:** Astro 6, Tailwind CSS v4, TypeScript, `astro:content` collections.

---

## File Map

- **Modify:** `source/components/PostCard.astro` — add `featured?: boolean` prop
- **Modify:** `source/pages/index.astro` — 3-col grid, first post featured, slice to 3, add Pagination
- **Modify:** `source/layouts/PostLayout.astro` — add Breadcrumbs + RelatedPosts
- **Modify:** `source/pages/[slug].astro` — pass `allPosts` + `calcReadingTime` to PostLayout
- **Modify:** `source/pages/archivo.astro` — slice to 3, add Pagination
- **Create:** `source/components/Breadcrumbs.astro`
- **Create:** `source/components/RelatedPosts.astro`
- **Create:** `source/components/Pagination.astro`
- **Create:** `source/pages/pagina/[page].astro`
- **Create:** `source/pages/archivo/pagina/[page].astro`

---

### Task 1: PostCard featured variant

**Files:**
- Modify: `source/components/PostCard.astro`
- Modify: `source/pages/index.astro`

- [ ] **Step 1: Update PostCard.astro** — add `featured` prop, change badge style

Replace the Props interface and badge markup:

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
  featured?: boolean
}

const { title, description, pubDate, category, slug, heroImage, readingTime, featured = false } = Astro.props

const formattedDate = pubDate.toLocaleDateString('es-ES', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
---

<article class={`group bg-[#1C1C2E] border border-[#2E2E48] rounded-lg overflow-hidden hover:border-[#6D28D9] hover:shadow-[0_0_20px_rgba(109,40,217,0.12)] transition-all${featured ? ' sm:col-span-2' : ''}`}>
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
      {featured ? (
        <span class="inline-block bg-[#6D28D9] text-white text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded-[3px]">
          {category}
        </span>
      ) : (
        <span class="inline-block border border-[#6D28D9] text-[#A78BFA] text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded-[3px]">
          {category}
        </span>
      )}
      <span class="text-[#3A3A54]">·</span>
      <time class="text-xs text-[#A0A0C0]" datetime={pubDate.toISOString()}>
        {formattedDate}
      </time>
      <span class="text-[#3A3A54]">·</span>
      <span class="text-xs text-[#A0A0C0]">{readingTime}</span>
    </div>
    <h2 class={`font-bold mb-2 text-[#E8E8F0] group-hover:text-white transition-colors leading-snug${featured ? ' text-lg' : ' text-base'}`}>
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

- [ ] **Step 2: Update index.astro grid** — 3 columns, first post featured (this step is done in Task 4 when index.astro is fully rewritten for pagination; skip for now — just verify PostCard compiles)

- [ ] **Step 3: Build and check**

```bash
cd /Users/ignaciocubelasfortes/Documents/Antigravity/IdentidadArtificial && npm run build 2>&1 | tail -20
```

Expected: build succeeds, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add source/components/PostCard.astro
git commit -m "feat: add featured variant to PostCard"
```

---

### Task 2: Breadcrumbs component

**Files:**
- Create: `source/components/Breadcrumbs.astro`
- Modify: `source/layouts/PostLayout.astro`

- [ ] **Step 1: Create Breadcrumbs.astro**

```astro
---
interface Props {
  category: string
  title: string
}

const { category, title } = Astro.props
const truncated = title.length > 42 ? title.slice(0, 42) + '…' : title
---

<nav class="flex items-center gap-2 text-xs text-[#A0A0C0] mb-4" aria-label="Breadcrumb">
  <a href="/" class="hover:text-[#A78BFA] transition-colors" aria-label="Inicio">⌂</a>
  <span class="text-[#3A3A54]">›</span>
  <a href="/archivo/" class="hover:text-[#A78BFA] transition-colors">{category}</a>
  <span class="text-[#3A3A54]">›</span>
  <span class="text-[#E8E8F0]">{truncated}</span>
</nav>
```

- [ ] **Step 2: Add Breadcrumbs to PostLayout.astro**

In `source/layouts/PostLayout.astro`, add the import and place the component before the category badge:

```astro
---
import BaseLayout from './BaseLayout.astro'
import TransparencyBlock from '../components/TransparencyBlock.astro'
import Breadcrumbs from '../components/Breadcrumbs.astro'
// ... rest of imports and props unchanged
---

<BaseLayout title={title} description={description} image={heroImage}>
  <article class="max-w-3xl mx-auto px-6 py-12">
    <header class="mb-10">
      <Breadcrumbs category={category} title={title} />
      <div class="flex items-center gap-2 mb-4 flex-wrap">
        <!-- badge, date, readingTime — unchanged -->
      </div>
      <!-- h1, description — unchanged -->
    </header>
    <!-- rest unchanged -->
  </article>
</BaseLayout>
```

- [ ] **Step 3: Build and check**

```bash
cd /Users/ignaciocubelasfortes/Documents/Antigravity/IdentidadArtificial && npm run build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add source/components/Breadcrumbs.astro source/layouts/PostLayout.astro
git commit -m "feat: add Breadcrumbs component to article pages"
```

---

### Task 3: RelatedPosts component

**Files:**
- Create: `source/components/RelatedPosts.astro`
- Modify: `source/layouts/PostLayout.astro`
- Modify: `source/pages/[slug].astro`

- [ ] **Step 1: Create RelatedPosts.astro**

```astro
---
import type { CollectionEntry } from 'astro:content'

interface Props {
  currentSlug: string
  category: string
  allPosts: CollectionEntry<'blog'>[]
  calcReadingTime: (text: string) => string
}

const { currentSlug, category, allPosts, calcReadingTime } = Astro.props

const related = allPosts
  .filter(p => p.data.category === category && p.id !== currentSlug)
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3)
---

{related.length > 0 && (
  <section class="mt-16 mb-10">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-[#E8E8F0] uppercase tracking-widest">Más sobre {category}</h3>
      <a href="/archivo/" class="text-xs text-[#A78BFA] underline hover:text-[#E8E8F0] transition-colors">Ver archivo →</a>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {related.map(post => (
        <a
          href={`/${post.id}/`}
          class="block bg-[#1C1C2E] border border-[#2A2A40] rounded-lg p-4 hover:border-[#6D28D9] transition-all"
        >
          <span class="inline-block bg-[#6D28D9] text-white text-[8px] font-bold tracking-[1px] uppercase px-2 py-0.5 rounded-[2px] mb-2">
            {post.data.category}
          </span>
          <p class="text-xs font-semibold text-[#E8E8F0] leading-snug mb-1 line-clamp-3">{post.data.title}</p>
          <p class="text-[10px] text-[#A0A0C0]">
            {post.data.pubDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            · {calcReadingTime(post.body ?? '')}
          </p>
        </a>
      ))}
    </div>
  </section>
)}
```

- [ ] **Step 2: Update PostLayout.astro props and markup**

Add `allPosts` and `calcReadingTime` to PostLayout's Props interface and place `RelatedPosts` between the prose content and `TransparencyBlock`:

```astro
---
import BaseLayout from './BaseLayout.astro'
import TransparencyBlock from '../components/TransparencyBlock.astro'
import Breadcrumbs from '../components/Breadcrumbs.astro'
import RelatedPosts from '../components/RelatedPosts.astro'
import type { CollectionEntry } from 'astro:content'

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
  slug: string
  allPosts: CollectionEntry<'blog'>[]
  calcReadingTime: (text: string) => string
}

const {
  title, description, pubDate, category, heroImage,
  generatedBy, generatedAt, promptBase, humanReviewed,
  readingTime, slug, allPosts, calcReadingTime,
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
      <Breadcrumbs category={category} title={title} />
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
      prose-a:text-[#A78BFA] prose-a:no-underline hover:prose-a:underline
      prose-code:font-mono prose-code:text-sm prose-code:text-[#E8E8F0]
      prose-pre:bg-[#24243A]
      prose-li:text-[#C8C8E0]
      prose-strong:text-[#E8E8F0]">
      <slot />
    </div>

    <RelatedPosts
      currentSlug={slug}
      category={category}
      allPosts={allPosts}
      calcReadingTime={calcReadingTime}
    />

    <TransparencyBlock
      generatedBy={generatedBy}
      generatedAt={generatedAt}
      promptBase={promptBase}
      humanReviewed={humanReviewed}
    />
  </article>
</BaseLayout>
```

- [ ] **Step 3: Update [slug].astro** — fetch all posts and pass to layout

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
    props: { post, allPosts: posts },
  }))
}

const { post, allPosts } = Astro.props
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
  readingTime={calcReadingTime(post.body ?? '')}
  slug={post.id}
  allPosts={allPosts}
  calcReadingTime={calcReadingTime}
>
  <Content />
</PostLayout>
```

- [ ] **Step 4: Build and check**

```bash
cd /Users/ignaciocubelasfortes/Documents/Antigravity/IdentidadArtificial && npm run build 2>&1 | tail -20
```

Expected: build succeeds, no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add source/components/RelatedPosts.astro source/layouts/PostLayout.astro source/pages/[slug].astro
git commit -m "feat: add RelatedPosts component to article pages"
```

---

### Task 4: Pagination component + paginated home page

**Files:**
- Create: `source/components/Pagination.astro`
- Create: `source/pages/pagina/[page].astro`
- Modify: `source/pages/index.astro`

- [ ] **Step 1: Create Pagination.astro**

```astro
---
interface Props {
  currentPage: number
  totalPages: number
  totalPosts: number
  baseUrl: string      // "/" for home, "/archivo/" for archivo
  paginaUrl: string    // "/pagina/" for home, "/archivo/pagina/" for archivo
}

const { currentPage, totalPages, totalPosts, baseUrl, paginaUrl } = Astro.props

function pageUrl(n: number): string {
  return n === 1 ? baseUrl : `${paginaUrl}${n}/`
}

// Build page numbers to show: always show 1, last, current ±1, with ellipsis
const pages: (number | 'ellipsis')[] = []
for (let i = 1; i <= totalPages; i++) {
  if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
    pages.push(i)
  } else if (pages[pages.length - 1] !== 'ellipsis') {
    pages.push('ellipsis')
  }
}
---

<div class="mt-12">
  <div class="flex items-center justify-center gap-1.5">
    {currentPage === 1 ? (
      <span class="w-9 h-9 flex items-center justify-center rounded-md border border-[#2A2A40] text-[#A0A0C0] opacity-30 text-base cursor-default">‹</span>
    ) : (
      <a href={pageUrl(currentPage - 1)} class="w-9 h-9 flex items-center justify-center rounded-md border border-[#2A2A40] text-[#A0A0C0] hover:border-[#6D28D9] hover:text-[#E8E8F0] transition-all text-base">‹</a>
    )}

    {pages.map(p =>
      p === 'ellipsis' ? (
        <span class="text-[#A0A0C0] text-sm px-1">…</span>
      ) : p === currentPage ? (
        <span class="w-9 h-9 flex items-center justify-center rounded-md bg-[#6D28D9] border border-[#6D28D9] text-white font-bold text-sm">{p}</span>
      ) : (
        <a href={pageUrl(p)} class="w-9 h-9 flex items-center justify-center rounded-md border border-[#2A2A40] text-[#A0A0C0] hover:border-[#6D28D9] hover:text-[#E8E8F0] transition-all text-sm">{p}</a>
      )
    )}

    {currentPage === totalPages ? (
      <span class="w-9 h-9 flex items-center justify-center rounded-md border border-[#2A2A40] text-[#A0A0C0] opacity-30 text-base cursor-default">›</span>
    ) : (
      <a href={pageUrl(currentPage + 1)} class="w-9 h-9 flex items-center justify-center rounded-md border border-[#2A2A40] text-[#A0A0C0] hover:border-[#6D28D9] hover:text-[#E8E8F0] transition-all text-base">›</a>
    )}
  </div>
  <p class="text-center text-xs text-[#A0A0C0] mt-3">Página {currentPage} de {totalPages} · {totalPosts} artículos</p>
</div>
```

- [ ] **Step 2: Create pages/pagina/[page].astro** — pages 2+ of home

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../../layouts/BaseLayout.astro'
import PostCard from '../../components/PostCard.astro'
import Pagination from '../../components/Pagination.astro'
import { SITE } from '../../config'

const PAGE_SIZE = 3

function calcReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min`
}

export async function getStaticPaths() {
  const allPosts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )
  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)
  // page 1 is served by index.astro, generate pages 2..N
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    params: { page: String(i + 2) },
    props: { page: i + 2, totalPages, allPosts },
  }))
}

const { page, totalPages, allPosts } = Astro.props
const posts = allPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
---

<BaseLayout title={`${SITE.name} — Página ${page}`} description={SITE.description}>
  <div class="max-w-3xl mx-auto px-6 py-16">
    <section class="mb-16">
      <p class="text-2xl sm:text-3xl font-bold leading-snug mb-4 text-[#E8E8F0]">
        {SITE.description}
      </p>
      <p class="text-[#A0A0C0]">
        Contenido sobre inteligencia artificial generado por{' '}
        <a href="/como-funciona/" class="text-[#E8E8F0] underline underline-offset-2 hover:text-[#A78BFA] transition-colors">Claude (Anthropic)</a>,
        con revisión humana y arquitectura pública.
      </p>
    </section>

    <section>
      <h2 class="text-xs font-semibold text-[#A0A0C0] uppercase tracking-widest mb-6 pb-3 border-b border-[#2A2A40]">
        Últimas entradas
      </h2>
      <div class="grid gap-6 sm:grid-cols-3">
        {posts.map((post, i) => (
          <PostCard
            title={post.data.title}
            description={post.data.description}
            pubDate={post.data.pubDate}
            category={post.data.category}
            slug={post.id}
            heroImage={post.data.heroImage}
            readingTime={calcReadingTime(post.body ?? '')}
            featured={i === 0 && page === 1}
          />
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalPosts={allPosts.length}
        baseUrl="/"
        paginaUrl="/pagina/"
      />
    </section>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Update index.astro** — show page 1 with 3 posts + Pagination + 3-col grid + featured first post

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../layouts/BaseLayout.astro'
import PostCard from '../components/PostCard.astro'
import Pagination from '../components/Pagination.astro'
import { SITE } from '../config'

const PAGE_SIZE = 3

function calcReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min`
}

const allPosts = (await getCollection('blog')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
)
const posts = allPosts.slice(0, PAGE_SIZE)
const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)
---

<BaseLayout title={SITE.name} description={SITE.description}>
  <div class="max-w-3xl mx-auto px-6 py-16">
    <section class="mb-16">
      <p class="text-2xl sm:text-3xl font-bold leading-snug mb-4 text-[#E8E8F0]">
        {SITE.description}
      </p>
      <p class="text-[#A0A0C0]">
        Contenido sobre inteligencia artificial generado por{' '}
        <a href="/como-funciona/" class="text-[#E8E8F0] underline underline-offset-2 hover:text-[#A78BFA] transition-colors">Claude (Anthropic)</a>,
        con revisión humana y arquitectura pública.
      </p>
    </section>

    <section>
      <h2 class="text-xs font-semibold text-[#A0A0C0] uppercase tracking-widest mb-6 pb-3 border-b border-[#2A2A40]">
        Últimas entradas
      </h2>
      <div class="grid gap-6 sm:grid-cols-3">
        {posts.map((post, i) => (
          <PostCard
            title={post.data.title}
            description={post.data.description}
            pubDate={post.data.pubDate}
            category={post.data.category}
            slug={post.id}
            heroImage={post.data.heroImage}
            readingTime={calcReadingTime(post.body ?? '')}
            featured={i === 0}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={1}
          totalPages={totalPages}
          totalPosts={allPosts.length}
          baseUrl="/"
          paginaUrl="/pagina/"
        />
      )}
    </section>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Build and check**

```bash
cd /Users/ignaciocubelasfortes/Documents/Antigravity/IdentidadArtificial && npm run build 2>&1 | tail -20
```

Expected: build succeeds. With only 3 posts and PAGE_SIZE=3, totalPages=1 so pagination won't render on home yet — that's correct.

- [ ] **Step 5: Commit**

```bash
git add source/components/Pagination.astro source/pages/pagina/[page].astro source/pages/index.astro
git commit -m "feat: add Pagination component and paginated home page"
```

---

### Task 5: Paginated archivo page

**Files:**
- Create: `source/pages/archivo/pagina/[page].astro`
- Modify: `source/pages/archivo.astro`

**Note:** Astro allows having both `pages/archivo.astro` and `pages/archivo/` directory. `archivo.astro` serves `/archivo/` (page 1) and `archivo/pagina/[page].astro` serves `/archivo/pagina/2/` etc.

- [ ] **Step 1: Create pages/archivo/pagina/[page].astro**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../../../layouts/BaseLayout.astro'
import Pagination from '../../../components/Pagination.astro'

const PAGE_SIZE = 3

function calcReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min`
}

export async function getStaticPaths() {
  const allPosts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )
  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    params: { page: String(i + 2) },
    props: { page: i + 2, totalPages, allPosts },
  }))
}

const { page, totalPages, allPosts } = Astro.props
const posts = allPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
const categories = [...new Set(allPosts.map((p: any) => p.data.category))]
---

<BaseLayout
  title={`Archivo — Página ${page}`}
  description="Todos los artículos publicados en Identidad Artificial."
>
  <div class="max-w-3xl mx-auto px-6 py-12">
    <h1 class="text-3xl sm:text-4xl font-bold mb-4 text-[#E8E8F0]">Archivo</h1>
    <p class="text-[#A0A0C0] mb-8">
      {allPosts.length} {allPosts.length === 1 ? 'artículo' : 'artículos'} publicados
    </p>

    <div class="flex flex-wrap gap-2 mb-10">
      <span class="text-sm text-[#A0A0C0] self-center">Categorías:</span>
      {categories.map((cat: string) => (
        <span class="text-xs font-medium px-3 py-1 rounded-full border border-[#6D28D9]/50 text-[#A78BFA]">
          {cat}
        </span>
      ))}
    </div>

    <ul class="divide-y divide-[#2A2A40]">
      {posts.map((post: any) => {
        const formattedDate = post.data.pubDate.toLocaleDateString('es-ES', {
          year: 'numeric', month: 'long', day: 'numeric',
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
                <a href={`/${post.id}/`} class="font-medium text-[#E8E8F0] hover:text-[#A78BFA] transition-colors">
                  {post.data.title}
                </a>
                <p class="text-sm text-[#A0A0C0] mt-1 line-clamp-1">{post.data.description}</p>
              </div>
              <time class="text-sm text-[#A0A0C0] shrink-0" datetime={post.data.pubDate.toISOString()}>
                {formattedDate}
              </time>
            </div>
          </li>
        )
      })}
    </ul>

    <Pagination
      currentPage={page}
      totalPages={totalPages}
      totalPosts={allPosts.length}
      baseUrl="/archivo/"
      paginaUrl="/archivo/pagina/"
    />
  </div>
</BaseLayout>
```

- [ ] **Step 2: Update archivo.astro** — slice to PAGE_SIZE=3, add Pagination

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../layouts/BaseLayout.astro'
import Pagination from '../components/Pagination.astro'

const PAGE_SIZE = 3

function calcReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min`
}

const allPosts = (await getCollection('blog')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
)
const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)
const posts = allPosts.slice(0, PAGE_SIZE)
const categories = [...new Set(allPosts.map(p => p.data.category))]
---

<BaseLayout
  title="Archivo"
  description="Todos los artículos publicados en Identidad Artificial."
>
  <div class="max-w-3xl mx-auto px-6 py-12">
    <h1 class="text-3xl sm:text-4xl font-bold mb-4 text-[#E8E8F0]">Archivo</h1>
    <p class="text-[#A0A0C0] mb-8">
      {allPosts.length} {allPosts.length === 1 ? 'artículo' : 'artículos'} publicados
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
          year: 'numeric', month: 'long', day: 'numeric',
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
                <a href={`/${post.id}/`} class="font-medium text-[#E8E8F0] hover:text-[#A78BFA] transition-colors">
                  {post.data.title}
                </a>
                <p class="text-sm text-[#A0A0C0] mt-1 line-clamp-1">{post.data.description}</p>
              </div>
              <time class="text-sm text-[#A0A0C0] shrink-0" datetime={post.data.pubDate.toISOString()}>
                {formattedDate}
              </time>
            </div>
          </li>
        )
      })}
    </ul>

    {totalPages > 1 && (
      <Pagination
        currentPage={1}
        totalPages={totalPages}
        totalPosts={allPosts.length}
        baseUrl="/archivo/"
        paginaUrl="/archivo/pagina/"
      />
    )}
  </div>
</BaseLayout>
```

- [ ] **Step 3: Build and check**

```bash
cd /Users/ignaciocubelasfortes/Documents/Antigravity/IdentidadArtificial && npm run build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 4: Commit and push**

```bash
git add source/pages/archivo/pagina/[page].astro source/pages/archivo.astro
git commit -m "feat: add pagination to archivo page"
git push origin main
```
