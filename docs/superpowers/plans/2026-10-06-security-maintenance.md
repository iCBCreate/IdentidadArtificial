# Site security maintenance implementation plan

Goal: implement the approved 2026-10-06 plan and deliver a reviewable PR without publication.
Architecture: preserve the public API and static site; fix total remote-body deadline, update compatible dependency lines, validate from main.
Spec: user-approved plan in this chat; Codex Security scan 49e0e8fc-8ac5-44dd-aef5-715281c192d5.

## Constraints
- Base: refreshed origin/main in an isolated checkout; preserve editorial checkout.
- Total remote download deadline 8000 ms; response cap 1048576 bytes; existing HTTPS/CORS/rate limit/JSON/status contracts.
- readLimitedResponse(response: Response, maxBytes: number, signal?: AbortSignal): Promise<Response>.
- Cancel rejected bodies and interrupted readers without awaiting indefinite cancellation; cleanup timers/listeners in finally.
- Astro 7.3.6, Cloudflare adapter 14.3.4, MDX 7.0.8, Transformers 4.3.1, Wrangler 4.148.0, Tailwind/Vite 4.3.3; remaining packages inside existing ranges.
- No incompatible OpenAI/tokenizer/TypeScript/MDX/Satori migrations; no force audit fix or Typography parser major override.
- All Sharp copies >=0.35.5; Node 22 LTS, minimum 22.18.0, CI 22.x.
- Critical/high audit warnings block ready status; moderate/low without compatible fixes documented individually.
- No production deployment, OAuth permission change, DNS/private-network research or shared rate limiter.

## Review focus
- Pending reader cancellation must not hold the timeout/error response open.
- Already-aborted signals must not consume the response.
- Size and redirect early exits must release remote resources.
- Wasm files must match updated Transformers runtime and route CSP.
- Build-generated editorial data must not enter maintenance commits.

### Task 1: Correct total remote download deadline
- [x] Add route regressions with fake timers, controlled streams, fetch boundary mock and HTMLRewriter stub.
- [x] Observe failure for stalled/dripping body, missing cancellation, already-aborted signal.
- [x] Implement optional signal, total 8000 ms deadline, finally cleanup and cancellation.
- [x] Verify successful JSON/200, timeout/408, redirect/422, oversize/413, network error/502 and cleanup.
- [x] Run focused tests and full suite; commit source and tests only.

### Task 2: Compatible dependencies and runtime
- [x] Update direct minimums and compatible remaining ranges/lock; review every audit warning.
- [x] Use only compatible patched overrides when necessary and test them; leave incompatible-only critical/high warnings as blockers and document moderate/low exceptions.
- [x] Set Node minimum/CI, correct Renovate note, verify Wasm copying.
- [x] npm ci, tests, astro check, build, diff check, final audit and local UI verification; commit dependency/runtime files only.

### Task 3: Documentation and reviewable PR
- [ ] Record baseline/final versions, audit, tests, route/sitemap baseline, UI checks and limitations.
- [ ] Fresh whole-branch review; fix actionable findings with regression tests.
- [ ] Commit docs separately, push the isolated branch, create and attach PR; draft if blockers remain.
- [ ] Publication is a later approved phase: record active version, deploy, verify active version/HTTP/sitemap/APIs, monitor 30 minutes, rollback if regression.
