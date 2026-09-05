# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo.

## Commands

```bash
npm run dev           # dev server
npm run build         # build:data → OG images → astro build (run in order)
npm run test          # node --test tests/*.test.mjs
npm run preview       # build + wrangler dev local
npm run deploy        # build + wrangler deploy usando dist/server/wrangler.json
```

**Deploy automático.** Push a `main` despliega vía `.github/workflows/deploy.yml` (build + wrangler deploy + indexnow). `npm run deploy` sigue disponible para deploy local.

**Build order matters:** `build:data` generates TS files in `source/data/generated/` Astro imports. Skip = build breaks.

## Architecture

Astro 7 server output on Cloudflare Workers. Source root `source/` (not `src/`), set via `srcDir: './source'` in `astro.config.mjs`.

**Content pipeline:**
1. `scripts/generate-*.mjs` → writes `source/data/generated/*.ts` (knowledge map, post insights, editorial radar)
2. `scripts/generate-og.mjs` → generates OG images from frontmatter via Satori + resvg
3. `astro build` → Cloudflare Worker bundle + prerendered routes
4. `scripts/validate-build.mjs` → validates the generated deployment artifact

**Server output with explicit prerendering:** `output: 'server'`, `session: false` and the Cloudflare adapter. Content pages declare `prerender = true`; runtime APIs declare `prerender = false`. Wrangler exposes generated client files through the `ASSETS` binding.

**Middleware** (`source/middleware.ts`): handles canonical redirects, retired URLs and response headers. Check the implementation before documenting a specific runtime status.

**Content schema** (`source/content.config.ts`): all posts require AI provenance fields — `generatedBy`, `generatedAt`, `promptBase`, `humanReviewed`. Validated with Zod. Invalid frontmatter = build fails.

## Creating blog posts

Posts in `source/content/blog/` as `.mdx`. Guide: `docs/guia-crear-post.md`.

**Frontmatter that commonly breaks the build:**
- `pubDate`: no quotes → `pubDate: 2026-05-01`
- `generatedAt`: quoted ISO 8601 → `generatedAt: '2026-05-01T10:00:00Z'`
- `humanReviewed`: lowercase boolean → `true` or `false`
- `tags`: kebab-case lowercase → `['llm', 'openai']`
- `category`: exact match from enum → `'Modelos'` not `'modelos'`
- `heroImage`: relative path from MDX → `'../../assets/post/filename.jpg'`

**Valid categories:** `Modelos`, `Inteligencia Artificial`, `Conceptos`, `Arquitectura`, `Herramientas`, `Ética`, `Tendencias`

Hero images in `source/assets/post/`. No `<Image />` or `<img>` in MDX body — `heroImage` frontmatter only.

## Generated data files

`source/data/generated/*.ts` = build artifacts. Don't edit manually. Regenerate with `npm run build:data`. Files `* 2.ts` / `* 2.astro` = stale merge conflict dupes, delete.

## Secrets and local dev

Copy `.dev.vars.example` → `.dev.vars` for local creds. Prod secrets in Cloudflare via `npx wrangler secret put`. `.dev.vars` gitignored.

Google Search Console scripts: `npm run gsc:oauth` (one-time auth), `npm run gsc:report`, `npm run gsc:inspect`, `npm run gsc:submit-sitemap`.

## Sitemap exclusions

Excluded pages in `EXCLUDED_SITEMAP_PATHS` in `astro.config.mjs`. Retired posts + pagination excluded there.
