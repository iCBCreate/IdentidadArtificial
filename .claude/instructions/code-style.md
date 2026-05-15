# Code Style

## JavaScript/TypeScript

- **Format:** Astro, Node, React
- **Spacing:** 2-space indent
- **Semicolons:** Yes
- **Quotes:** Single `'` for strings, backticks for templates
- **Comments:** Only on non-obvious logic. No `// why we do this` — that's commit message territory

## Naming

- **Variables/functions:** `camelCase` (English)
- **Constants:** `UPPER_SNAKE_CASE`
- **Classes/types:** `PascalCase`
- **Files:** kebab-case (`.astro`, `.tsx`, `.ts`)
- **Components:** PascalCase filenames matching export

## CSS / Tailwind v4

- Class-based only (no inline styles)
- Tailwind v4 syntax (native CSS variables)
- Dark mode via `dark:` prefix
- Responsive: mobile-first, `sm:`, `md:`, `lg:`

## Astro

- Components in `source/components/`
- Props typed with interfaces
- No JSX in blog posts (use Markdown)
- Import content via `getCollection()` in layouts

## React (if embedded)

- Functional components only
- Hooks for state
- Props typed (TypeScript)
- No prop drilling — use Context if needed

## Generated Files

Never edit `source/data/generated/*.ts`. Regenerate with `npm run build:data`.

Stale dupes (`* 2.ts`, `* 2.astro`) = delete.

## Build Artifacts

`.astro-cache/`, `dist/`, `node_modules/` = never commit.

Gitignore enforces this. Verify before push.
