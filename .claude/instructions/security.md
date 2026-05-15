# Security Rules

## Secrets Management

**Never commit secrets.** Period.

- `.dev.vars` = gitignored (local dev only)
- Copy from `.dev.vars.example` for local setup
- Production secrets → `wrangler secret put` (Cloudflare)
- OAuth tokens, API keys, DB passwords = always in secrets, never in code

## Google Search Console

- **OAuth flow:** `npm run gsc:oauth` (one-time, writes refresh token to `.dev.vars`)
- **Refresh token:** Stored in `.dev.vars` with mode `0o600` (owner read-only)
- **API reports:** `npm run gsc:report`, `gsc:inspect`, `gsc:submit-sitemap`

Tokens expire. Re-run `gsc:oauth` if needed.

## Frontmatter Validation

Content schema enforces AI provenance:
- `generatedBy`: Which LLM created this
- `generatedAt`: ISO 8601 timestamp
- `promptBase`: The prompt used (for tracing)
- `humanReviewed`: Boolean (true/false, lowercase)

Invalid frontmatter = build fails. Non-negotiable.

## Static Build + Workers Hybrid

- Static assets: served from edge
- Dynamic endpoint (`/api/search-console/report.json`): Workers function
- Middleware: 410 Gone for retired URLs (no sensitive info in 410s)

Never put secrets in static files or URLs.

## CORS & CSP

- **CORS:** Handled by Cloudflare (restricted to origin)
- **CSP:** Enforced via `_headers` file
- **SameSite cookies:** Set to `Strict`

All requests validated. No cross-origin data leaks.

## Metrics Dashboard

- Bearer token stored in `sessionStorage` (memory only, not persistent)
- Cleared on tab close
- No token in URL or local storage

Metrics endpoint requires valid token. Validate on every request.

## Dependency Security

- `npm audit` before every build
- No `npm install` without reviewing `package-lock.json` diff
- Locked versions in `package.json` (no `^` or `~`)

Vulnerabilities block deploy. Fix first.

## 410 Gone

Retired posts serve 410 via middleware. No data leaked, no redirects to new URLs. Clean exit.

## Audit Trail

All AWS / Cloudflare operations logged. Check:
- Wrangler deploy logs
- Cloudflare Workers analytics
- Search Console API calls

Keep audit trail clean. No sensitive data in logs.
