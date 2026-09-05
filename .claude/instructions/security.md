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

## Astro Server Output + Workers

- `output: 'server'` with content routes explicitly prerendered
- Static assets are served through the Cloudflare `ASSETS` binding
- Runtime endpoints validate input and authentication in the Worker

Never put secrets in static files or URLs.

## CORS & CSP

- **CORS:** Handled by Cloudflare (restricted to origin)
- **CSP:** Enforced via `_headers` file
- **SameSite cookies:** Set to `Strict`

All requests validated. No cross-origin data leaks.

## Metrics Dashboard

- Never persist the bearer token in browser storage or place it in a URL
- Keep it only in the live page state for the current request flow
- Validate authentication on every request to the metrics endpoint

## Dependency Security

- `npm audit` before every build
- No `npm install` without reviewing `package-lock.json` diff
- Review version ranges and the lockfile together

Vulnerabilities block deploy. Fix first.

## 410 Gone

Retired posts serve 410 via middleware. No data leaked, no redirects to new URLs. Clean exit.

## Audit Trail

For operational evidence, check the available provider logs:
- Wrangler deploy logs
- Cloudflare Workers analytics
- Search Console API calls

Keep audit trail clean. No sensitive data in logs.
