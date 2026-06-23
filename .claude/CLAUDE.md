# IdentidadArtificial — Claude Code Setup

Local `.claude/` guidance for this project. Root `CLAUDE.md` = global rules. These = project-specific.

## Quick Start

```bash
npm run dev           # Astro dev server
npm run build         # build:data → OG → astro build (order matters)
npm run test          # Node test runner
npm run deploy        # build + wrangler deploy (auto en CI al push a main vía .github/workflows/deploy.yml)
```

**Deploy automático.** Push a `main` → `.github/workflows/deploy.yml` → build + wrangler deploy + indexnow. `npm run deploy` para deploy local.

## Key Paths

- **Source:** `source/` (not `src/`)
- **Content:** `source/content/blog/` (MDX posts)
- **Generated data:** `source/data/generated/` (TS build artifacts — don't edit)
- **Components:** `source/components/` (Astro + React)
- **Assets:** `source/assets/post/` (images)
- **Scripts:** `scripts/generate-*.mjs` (AI generation pipeline)
- **Config:** `astro.config.mjs`, `wrangler.toml`, `.dev.vars`

## Build Pipeline

1. `npm run build:data` → Generate knowledge map, post insights, editorial radar
2. `npm run build:og` → Satori + resvg OG images from frontmatter
3. `astro build` → Static output + Cloudflare Worker adapter

Skipping step 1 = broken build.

## Architecture

**Astro 6 + Cloudflare Workers hybrid:**
- Static assets: served from Workers
- Dynamic API: `source/pages/api/search-console/report.json.ts` (prerender: false)
- Middleware: 410 Gone for 7 retired URLs
- Content schema: enforces AI provenance (generatedBy, generatedAt, promptBase, humanReviewed)

## Instructions

See `instructions/` for code style, naming conventions, security rules.

## Memory & Progress

See `memory/` for:
- Project decisions & why
- What's done, what's next
- Context for future sessions

## Agents

See `agents/` for architect and reviewer guidance.
