# Tutoriales Collection — Design Spec

**Date:** 2026-05-18  
**Status:** Design  
**Scope:** New content collection + section page for beginner AI tutorials in Spanish

---

## Context

IdentidadArtificial targets advanced AI audiences. Gap exists: Spanish-speaking users without foundational AI knowledge need actionable tutorials (configure ChatGPT, Claude, custom GPTs, skills). New `/tutoriales/` section bridges this.

**Goal:** Separate, self-contained tutorial system parallel to blog. Beginner-focused, step-by-step, minimal text. Reusable pattern for future content types.

---

## Architecture

### New Files

| File | Purpose |
|---|---|
| `source/content/tutoriales/` | MDX content directory (new collection) |
| `source/pages/tutoriales/index.astro` | Tutorial listing page |
| `source/pages/tutoriales/[slug].astro` | Individual tutorial page |

### Modified Files

| File | Change |
|---|---|
| `source/content.config.ts` | Add `tutoriales` collection with schema |
| `source/components/Header.astro` | Add nav link `Tutoriales` (between "Cómo funciona" and "Mapa IA") |

### Unchanged

- `blog` collection — no impact
- Build pipeline (`build:data`, OG generation) — tutoriales don't integrate yet
- Middleware, routing, middleware — all automatic via Astro file-based routing

---

## Content Schema

### Collection Definition

```typescript
// In source/content.config.ts

const tutorialesCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    herramienta: z.enum(['ChatGPT', 'Claude', 'Gemini', 'General']),
    dificultad: z.enum(['Principiante', 'Intermedio']),
    tiempoEstimado: z.string(), // "5 min", "10 min", "15 min"
    heroImage: image().optional(),
    // AI Provenance (consistent with blog)
    generatedBy: z.string(),
    generatedAt: z.coerce.date(),
    promptBase: z.string(),
    humanReviewed: z.boolean(),
    correctionNote: z.string().optional(),
  }),
});

// Export in collections object
export const collections = {
  blog: blogCollection,
  tutoriales: tutorialesCollection,
};
```

### Example Frontmatter

```yaml
---
title: "Configurar ChatGPT por primera vez"
description: "Guía rápida para principiantes: crear cuenta, primeras preguntas, settings básicos"
pubDate: 2026-05-20
herramienta: "ChatGPT"
dificultad: "Principiante"
tiempoEstimado: "5 min"
generatedBy: "Claude 3.5 Sonnet"
generatedAt: "2026-05-19T14:30:00Z"
promptBase: "Create beginner-friendly tutorial on first ChatGPT setup for Spanish speakers"
humanReviewed: true
---
```

---

## Pages

### `/tutoriales/index.astro` — Listing Page

**Layout:** Follows existing pattern (like `radar.astro`, `mapa-ia.astro`)

**Structure:**
- Hero section: eyebrow label "Aprende IA", `<h1>Tutoriales</h1>`, subtitle targeting beginners ("Guías prácticas para empezar con herramientas de IA")
- Content body: flat grid of tutorial cards (no pagination, no filters for now)

**Card Display:**
- Title
- Description (1-2 lines)
- Tool badge (ChatGPT | Claude | Gemini | General)
- Difficulty badge (Principiante | Intermedio) — color-coded
- Estimated time ("5 min")
- Link to tutorial

**Sorting:** By `pubDate` DESC (newest first). No manual sort order field needed.

### `/tutoriales/[slug].astro` — Individual Tutorial

**Layout:** Extends `BaseLayout` (same as blog posts)

**Structure:**
- Page title + metadata row: `[Herramienta] · [Dificultad] · [Tiempo Estimado]`
- Byline: "Por [generatedBy] · Actualizado [pubDate formatted]"
- Content body: MDX rendered
- Related tutorials (optional future): list of 3 other tutorials by same tool

**Styling:** Reuse blog post styles. MDX components available (same as blog).

---

## Navigation

Add to `navLinks` in `source/components/Header.astro`:

```typescript
const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/sobre/', label: 'Sobre' },
  { href: '/como-funciona/', label: 'Cómo funciona' },
  { href: '/tutoriales/', label: 'Tutoriales' },  // NEW
  { href: '/mapa-ia/', label: 'Mapa IA' },
  { href: '/radar/', label: 'Radar' },
  { href: '/archivo/', label: 'Archivo' },
]
```

Nav auto-highlights `/tutoriales/` when path matches.

---

## Content Format Guidelines

**MDX Content:**
- Use plain MDX (same as blog)
- Heading hierarchy: `<h2>` for sections (no `<h1>` — title in frontmatter)
- Ordered lists (`1. 2. 3.`) for step-by-step instructions
- Code blocks for CLI/config examples
- Images: place in `source/assets/post/`, reference via relative path
- Keep prose concise, beginner-friendly

**Example structure:**
```markdown
## Paso 1: Crear cuenta

Visita [openai.com](https://openai.com). Haz clic en "Sign Up".

## Paso 2: Primeras preguntas

Escribe una pregunta simple:

> "¿Qué es inteligencia artificial?"

## Paso 3: Explorar settings

Abre Settings (esquina arriba a la derecha)...
```

---

## Build & Deployment

No changes to build pipeline required.

- `npm run build` works as-is (Astro auto-discovers collections)
- Deploy: `npm run deploy` (no wrangler config changes)
- Tutoriales content is SSG (static), not dynamic API

---

## Future Extensions

Not in scope, but planned:

- Tutorial filtering by tool (client-side or generated index)
- "Related tutorials" component on detail pages
- OG image generation for tutorial cards
- Tutorial-specific analytics (time to completion)
- Video embeds in tutorial body (iframe support)

---

## Verification

**Build test:**
```bash
npm run build
# Should succeed with tutoriales collection loaded
```

**Dev server:**
```bash
npm run dev
# Visit http://localhost:3000/tutoriales/
# Visit http://localhost:3000/tutoriales/[any-slug]/
```

**Content validation:**
- Missing required fields → build fails with Zod error
- Invalid `herramienta` or `dificultad` enum → build fails
- Invalid `pubDate` or `generatedAt` → build fails

**Navigation test:**
- Nav link appears in header
- Active state highlights on `/tutoriales/*` paths

---

## Files to Modify

1. **`source/content.config.ts`** — add tutoriales collection
2. **`source/components/Header.astro`** — add nav link
3. **Create `source/pages/tutoriales/index.astro`**
4. **Create `source/pages/tutoriales/[slug].astro`**
5. **Create `source/content/tutoriales/` directory**

---

## Constraints & Decisions

| Decision | Reasoning |
|----------|-----------|
| Separate collection (not blog category) | Clean separation. Easier to manage schema differences. Allows future independent tooling. |
| No subcategories initially | YAGNI. Filter by tool can be added client-side later. Flat list scales to 50+ tutorials. |
| Mandatory AI provenance fields | Maintains site's transparency stance. All content (human or AI-assisted) documented. |
| No pagination | Expected content volume: 20-30 tutorials. Flat list loads fast. Add pagination if >50. |
| MDX format (not database) | Consistent with blog. Version control built-in. Works with existing deployment. |

