# Contexto del Proyecto

## ¿Qué es IdentidadArtificial?

Blog + showcase de IA generativa. Astro 6 on Cloudflare Workers. Posts sobre modelos, arquitectura, herramientas IA.

Arquitectura build-time: scripts generan knowledge map, post insights, editorial radar al compilar.

## Tech Stack

- **Frontend:** Astro 6, React (componentes), Tailwind CSS v4
- **Backend:** Cloudflare Workers, Node.js scripts
- **Database:** Ninguno (estático + APIs)
- **Content:** MDX (posts), esquema Zod (validación frontmatter)
- **Hosting:** Cloudflare Pages + Workers

## Build Time vs Runtime

**Decisión:** Genera todo al build, no en runtime.

- `build:data` → scripts Python/Node generan datos IA
- OG images: Satori + resvg (pre-build)
- Editorial radar: análisis posts → TS generado
- API dinámica: solo Google Search Console `/api/search-console/report.json`

Por qué: velocidad, caché, no depender de APIs en runtime.

## Posts & Categorías

11 posts publicados. Categorías enum-validated:
- Modelos
- Inteligencia Artificial
- Conceptos
- Arquitectura
- Herramientas
- Ética
- Tendencias

Todos requieren AI provenance: `generatedBy`, `generatedAt`, `promptBase`, `humanReviewed`.

## URLs Retiradas

7 URLs sirviendo 410 Gone via middleware. Dead tag pages (`/tag/comet/`, `/tag/hugging-face/`) no redirigen, terminan con 410.

## Integración GSC

Google Search Console API en `/api/search-console/report.json`. Token OAuth en `.dev.vars`. Script `gsc:submit-sitemap` auto-notifica a GSC.

## OG Images

11 imágenes generadas (una por post). Satori renderiza HTML → PNG. Hosted en Cloudflare.
