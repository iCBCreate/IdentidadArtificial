# Plan de remediación — Indexación Google Search Console

**Fecha:** 2026-07-13
**Propiedad:** `sc-domain:identidadartificial.com`
**Fuente de datos:** export CSV de GSC (6 incidencias) + URL Inspection API (124 URLs, `reports/indexing-inspection-2026-07-13.json`) + verificación HTTP en vivo.

---

## 1. Resumen ejecutivo

Google reporta 59 URLs no indexadas repartidas en 5 buckets. **La mayoría NO son errores reales**: son URLs retiradas que ya devuelven 410/404 correctamente, o páginas con `noindex` intencionado (paginación). El ruido proviene de **2 bugs sistémicos** que hacen que Google clasifique mal las URLs retiradas y de **higiene de taxonomía** (tags thin). Solo ~6 URLs son contenido vivo legítimo que merece indexarse.

| Bucket GSC | Nº | Diagnóstico | Acción real |
|---|---|---|---|
| No encontrado (404) | 26 | Legacy WordPress, correcto. Wildcards = patrones GSC | Consolidar a 410; 1 redirect |
| Rastreada: sin indexar | 18 | Mezcla: 410 ya OK + resources + tags thin + posts vivos | Empujar solo los vivos |
| Excluida por noindex | 10 | Paginación (esperado) + retiradas mal clasificadas | Fix bug 410 |
| Página con redirección | 4 | http→https, www→non-www, slug viejo. **Todo sano** | Ninguna |
| Soft 404 | 1 | URL ya en 410, clasificación obsoleta | Fix bug 410 |

---

## 2. Los 2 bugs sistémicos (causa raíz)

### BUG 1 — La respuesta 410 emite `noindex`
`source/middleware.ts` (`GONE_HTML`) devuelve status **410** pero además incluye `<meta name="robots" content="noindex,nofollow">` y la cabecera `x-robots-tag: noindex, nofollow`. Señales en conflicto: Google prioriza el `noindex` y clasifica las URLs retiradas como **"Excluida por noindex"** o **"Soft 404"** en lugar de **"No encontrada (gone)"**, retrasando su eliminación.

- **Verificado en vivo:** `/ia-entrenamiento-pokemon/` → `HTTP/2 410` + `x-robots-tag: noindex` → aparece en bucket noindex.
- **Fix:** quitar el `noindex` (meta + cabecera) de `GONE_HTML`. Un 410 ya significa "desaparecida"; el `noindex` sobra y confunde.
- **Impacto:** ~13 URLs migran de noindex/soft404 → gone y se eliminan más rápido.

### BUG 2 — La capa estática se procesa ANTES que el middleware
Con `output: 'static'`, Cloudflare sirve **assets prerenderizados** y reglas de **`public/_redirects`** antes de ejecutar el Worker (`middleware.ts`). Por tanto varias entradas de `GONE_PATHS` son **código muerto**:

- **Verificado:** `/tag/anthropyc/` → `HTTP/2 301 → /archivo/` (gana `_redirects`, NO el 410 del middleware).
- **Verificado:** `/pagina/4,5,6/` → `HTTP/2 200` (existen como asset; hay 33 posts / PAGE_SIZE 6 = 6 páginas). El 410 de `GONE_PATHS` nunca se aplica.
- **Fix:** purgar de `GONE_PATHS` las rutas que tienen asset estático o regla en `_redirects` (`/pagina/4/`, `/pagina/5/`, `/pagina/6/`, `/tag/anthropyc/`).

---

## 3. Diagnóstico por URL (inventario de acción)

### A. Fix BUG 1 — limpiar 410 (ya en 410, mal clasificadas)
`/ia-entrenamiento-pokemon/`, `/openai-lanza-gpt-oss-novedades-2025/`, `/chatgpt-image-generation-gpt-image-1/`, `/chatgpt-agent-revolucion-openai/`, `/tag/comet/`, `/tag/hugging-face/`, `/ultimas-novedades-claude-mythos-anthropic/` (soft404), `/tag/reflexion/`, `/tag/agentes-de-ia/`, `/tag/gemini/`, `/tag/grok/`, `/tag/chatgpt-agent/`, `/ia-expendedora-san-francisco-projet-vend/`, `/meta-refuerza-laboratorio-superinteligencia-fichajes-altman/`, `/chatgpt-5-novedades-lanzamiento-2025`(+`/`).

### B. Consolidar 404 → 410 (legacy que hoy da 404 genérico)
Confirmar muertas y añadir a `GONE_PATHS`: `/tag/openclaw/`, `/tag/deepmind/`, `/tag/programacion/`, `/tag/perplexity/`, `/tag/arquitectura/`, `/tag/chatgpt/`, `/tag/claude-code/`, `/tag/inversion/`, `/tag/gpt-image-2/`, `/comet-navegador-perplexity-analisis/`, `/novedades-gemini-3-google/`, `/ultimas-filtraciones-openai-agii/`, `/chatgpt-5-novedades-2025/`.
- Ya cubiertas (410 vía prefix/feed-strip): `/category/*`, `/tag/*/feed/`, `/wp-admin/*`, `/wp-content/*`, `/firebase-studio-.../feed/`.
- Wildcards (`/*`, `/sitemap*`, `/wp-content/uploads/*`) = patrones representativos de GSC, ignorar.

### C. Redirect de recuperación
`/blog/nvidia-rtx-spark/` → **404**, pero el post real vive en `/nvidia-rtx-spark/` (indexado). Añadir `301` en `_redirects`.

### D. Tags thin vivos (200, "crawled not indexed")
`/tag/apple/`, `/tag/google/`, `/tag/claude/`, `/tag/openai/` → 200 pero Google no indexa (pocas entradas). **Decisión de política** (ver Fase 3).

### E. Contenido vivo legítimo a empujar (upside real de tráfico)
`/anthropic-fable-mythos-suspension-gobierno-eeuu/` (200), `/tutoriales/que-indexan-realmente-los-llms/` (200), y los "unknown to Google" recién publicados: `/airbus-ia-aterrizaje-autonomo/`, `/agentes-autonomos-2026-arquitectura-y-limites/`, `/anthropic-fable-mythos-vuelta-gobierno-eeuu/`, `/prompt-engineering-vs-loop-engineering/`, `/gpt-5-5-cyber-vs-mythos-fable-acceso-restringido/`.
- ⚠️ **Canibalización:** coexisten `anthropic-fable-mythos-suspension-*` y `anthropic-fable-mythos-vuelta-*` (mismo tema, EEUU/Fable/Mythos). Diferenciar o serie con interlink.

### F. Sin acción (sano)
Bucket "Página con redirección" (4): http→https, www→non-www, `/sobre-el-proyecto/`→`/sobre/`. Canonicalización correcta. `/api/news-ticker.json`, `/rss.xml`: recursos no-página; opcional `X-Robots-Tag: noindex`.

---

## 4. Plan orquestado (modelos · agentes · skills)

**Criterio de asignación:**
- **Opus 4.8** → decisiones de estrategia/juicio editorial (política de tags, canibalización).
- **Sonnet 5** → implementación estándar con criterio (qué URLs, on-page).
- **Haiku 4.5** → ediciones mecánicas y ejecución de scripts.
- **cavecrew-builder** → edición quirúrgica 1-2 ficheros (ideal para `middleware.ts` / `_redirects`).
- **cavecrew-investigator** → confirmación read-only de URLs (no romper vivas).
- **cavecrew-reviewer / skill `code-review`** → gate de revisión del diff.
- **post-reviewer** → valida frontmatter + SEO de MDX.

### FASE 1 — Bugs sistémicos (máximo ROI, arregla ~13 URLs con 2 edits)
| Tarea | Modelo | Agente | Skill |
|---|---|---|---|
| T1.1 Quitar `noindex` (meta + `x-robots-tag`) de `GONE_HTML` | Haiku 4.5 | cavecrew-builder | workers-best-practices, verify |
| T1.2 Purgar `GONE_PATHS` muertas (`/pagina/4,5,6/`, `/tag/anthropyc/`) | Sonnet 5 | cavecrew-builder | seo |
| Gate diff Fase 1 | Sonnet 5 | cavecrew-reviewer | code-review |

### FASE 2 — Señal "gone" consistente (404 → 410 limpio)
| Tarea | Modelo | Agente | Skill |
|---|---|---|---|
| T2.1 Confirmar que cada legacy del bucket B sigue muerta | Sonnet 5 | cavecrew-investigator | seo |
| T2.2 Añadir legacy confirmadas a `GONE_PATHS` | Sonnet 5 | cavecrew-builder | seo |
| T2.3 `/blog/nvidia-rtx-spark/` → 301 en `_redirects` | Haiku 4.5 | cavecrew-builder | seo |

### FASE 3 — Higiene de taxonomía (tags thin)
| Tarea | Modelo | Agente | Skill |
|---|---|---|---|
| T3.1 **Decisión**: noindex tags con <N posts vs consolidar vs enriquecer | **Opus 4.8** | Plan | seo, brainstorming |
| T3.2 Implementar en `source/pages/tag/[tag].astro` (noindex condicional / canonical) | Sonnet 5 | cavecrew-builder | seo |
| T3.3 (opcional) `X-Robots-Tag: noindex` en `/api/news-ticker.json` | Haiku 4.5 | cavecrew-builder | workers-best-practices |

### FASE 4 — Empujar indexación de contenido vivo
| Tarea | Modelo | Agente | Skill |
|---|---|---|---|
| T4.1 Resolver canibalización suspension/vuelta (diferenciar título/meta/intención + interlink) | **Opus 4.8** | general-purpose | seo |
| T4.2 Reforzar on-page + `BlogPosting` schema (title 50-60, meta 120-160) en posts no indexados | Sonnet 5 | post-reviewer | seo |
| T4.3 Enlazado interno: desde posts indexados fuertes → posts no indexados | Sonnet 5 | cavecrew-builder | seo |
| T4.4 `npm run indexnow` de las URLs vivas afectadas | Haiku 4.5 | main thread | — |

### FASE 5 — Revisión, deploy y verificación
| Tarea | Modelo | Agente | Skill |
|---|---|---|---|
| T5.1 Review integral del diff | Opus 4.8 | cavecrew-reviewer | code-review |
| T5.2 `npm run build` + `npm run test` | Haiku 4.5 | main thread | verify |
| T5.3 Deploy: push a `main` (CI auto: build + wrangler + indexnow) | — | main thread | wrangler |
| T5.4 GSC: "Validar corrección" por incidencia + "Solicitar indexación" de URLs vivas | — | usuario (manual) | — |
| T5.5 Monitor a 7-14 días: re-run `scripts/inspect-all.mjs`, comparar buckets | Haiku 4.5 | main thread | verify |

---

## 5. Métricas de éxito (revisar a 14 días)

- **Soft 404:** 1 → 0.
- **Excluida por noindex:** 10 → solo paginación (`/pagina/2..6/`, esperado y correcto).
- **No encontrado (404):** los legacy migran a "gone" y decrecen; sin URLs nuevas inesperadas.
- **Rastreada sin indexar:** los ~6 posts vivos pasan a "Indexada"; resto (410/resources) se limpia.
- **Página con redirección:** se mantiene (sano), no requiere acción.
- KPI global: nº total de "no indexadas involuntarias" → tender a 0 (solo quedan noindex intencionados).

## 6. Orden de ejecución recomendado
1. **Fase 1** (1 commit, arregla el grueso del ruido). Deploy.
2. **Fase 2 + 3** (1 commit). Deploy.
3. **Fase 4** (1-2 commits, contenido). Deploy + IndexNow.
4. **Fase 5.4** manual en GSC tras cada deploy.
5. **Fase 5.5** monitor y segunda iteración si procede.

> Riesgo/seguridad: todos los cambios son en `middleware.ts`, `_redirects`, `[tag].astro` y MDX. Cada fase pasa por gate de review antes de deploy. El deploy a `main` es irreversible-a-producción → confirmar antes de push.
