# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo.

## Commands

```bash
npm run dev           # dev server
npm run build         # build:data → OG images → astro build (run in order)
npm run test          # node --test tests/*.test.mjs
npm run preview       # build + wrangler dev local
npm run deploy        # build + wrangler deploy (manual — not automatic)
```

**Deploy is manual.** Push to `main` does NOT auto-deploy. Must run `npm run deploy` explicitly after verifying build passes.

**Build order matters:** `build:data` generates TS files in `source/data/generated/` Astro imports. Skip = build breaks.

## Architecture

Astro 6 static site on Cloudflare Workers. Source root `source/` (not `src/`), set via `srcDir: './source'` in `astro.config.mjs`.

**Content pipeline:**
1. `scripts/generate-*.mjs` → writes `source/data/generated/*.ts` (knowledge map, post insights, editorial radar)
2. `scripts/generate-og.mjs` → generates OG images from frontmatter via Satori + resvg
3. `astro build` → static output + Cloudflare Worker adapter

**Hybrid static + Workers:** `output: 'static'` but needs `@astrojs/cloudflare` adapter: `source/pages/api/search-console/report.json.ts` has `prerender = false` → Workers function. Rest = static assets.

**Middleware** (`source/middleware.ts`): returns HTTP 410 for 7 retired URLs. Dead tag pages (`tag/comet.astro`, `tag/hugging-face.astro`) use `GoneLayout` for static 410s.

**Content schema** (`source/content.config.ts`): all posts require AI provenance fields — `generatedBy`, `generatedAt`, `promptBase`, `humanReviewed`. Validated with Zod. Invalid frontmatter = build fails.

## Creating blog posts

Posts in `source/content/blog/` as `.mdx`. Guide: `docs/guia-crear-post.md`.

**Frontmatter that commonly breaks the build:**
- `pubDate`: no quotes → `pubDate: 2026-05-01`
- `generatedAt`: quoted ISO 8601 → `generatedAt: '2026-05-01T10:00:00Z'`
- `humanReviewed`: lowercase boolean → `true` or `false`
- `tags`: kebab-case lowercase → `['llm', 'openai']`
- `category`: exact match from enum → `'Modelos'` not `'modelos'`
- `heroImage`: relative path from MDX → `'../../assets/post/filename.png'`

**Valid categories:** `Modelos`, `Inteligencia Artificial`, `Conceptos`, `Arquitectura`, `Herramientas`, `Ética`, `Tendencias`

Hero images in `source/assets/post/`. No `<Image />` or `<img>` in MDX body — `heroImage` frontmatter only.

## Generated data files

`source/data/generated/*.ts` = build artifacts. Don't edit manually. Regenerate with `npm run build:data`. Files `* 2.ts` / `* 2.astro` = stale merge conflict dupes, delete.

## Secrets and local dev

Copy `.dev.vars.example` → `.dev.vars` for local creds. Prod secrets in Cloudflare via `npx wrangler secret put`. `.dev.vars` gitignored.

Google Search Console scripts: `npm run gsc:oauth` (one-time auth), `npm run gsc:report`, `npm run gsc:inspect`, `npm run gsc:submit-sitemap`.

## Sitemap exclusions

Excluded pages in `EXCLUDED_SITEMAP_PATHS` in `astro.config.mjs`. Retired posts + pagination excluded there.