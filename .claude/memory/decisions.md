# Decisiones Arquitectónicas

## Build-Time First (No Runtime IA)

**Decisión:** Generar todo lo posible al build. APIs externas solo si necesario.

**Por qué:**
- Velocidad: sin latencia en runtime
- Caché: static output servido desde edge
- Simplicidad: no dependencia de servicios externos en request path
- Costo: una ejecución de scripts vs. miles de API calls

**Implementación:**
- `scripts/generate-*.mjs` → TS generado en `source/data/generated/`
- OG images: Satori + resvg pre-build
- Post insights: análisis offline
- API dinámica solo: Google Search Console (reporte de performance)

## Static Astro + Cloudflare Workers Hybrid

**Decisión:** `output: 'static'` con adapter Cloudflare para API dinámica.

**Por qué:**
- Static = fast, cheap, edge caching
- Workers = serverless para endpoints dinámicos
- Hybrid = best of both

**Trade-off:** Middleware + prerender: false en archivo específico. Requiere wrangler config correcto.

## Esquema Zod para Provenance IA

**Decisión:** Validar frontmatter con Zod. Build falla sin `generatedBy`, `generatedAt`, `promptBase`, `humanReviewed`.

**Por qué:**
- Transparency: cada post sabe origen IA
- Audit trail: cuándo fue generado, qué prompt
- Cumplimiento: legal + ética

**Enforcement:** Build-time. No secreto. Validado.

## 410 Gone, No Redirects

**Decisión:** Posts retirados sirven HTTP 410. Sin redireccion a nuevas URLs.

**Por qué:**
- Clean exit: usuarios saben "no existe"
- No link juice leak: SEO no sigue 410
- Seguridad: no exponemos estructura interna

## MDX Sin JSX en Posts

**Decisión:** Posts = prose limpia. Componentes en Astro (layouts), no embebidos en MDX.

**Por qué:**
- Content limpio: MDX es Markdown puro (portable)
- Mantenibilidad: cambios de UI no requieren editar posts
- LLM-friendly: texto sin sintaxis Astro

## Google Search Console API

**Decisión:** Integración GSC vía OAuth. Tokens en `.dev.vars`, secrets en Cloudflare.

**Por qué:**
- Metrics: saber qué busca Google
- Submit sitemap: notification automática
- Seguridad: no hardcoded tokens

## Tailwind v4 Nativo CSS

**Decisión:** Tailwind v4 (nativas CSS variables). No Sass/LESS.

**Por qué:**
- Performance: mejor tree-shaking
- Mantenibilidad: CSS estándar
- Dark mode: native CSS variables

## Categories Enum, No Freeform

**Decisión:** Categorías validadas en enum. No values arbitrarios.

**Por qué:**
- Consistency: navegación, filters predecibles
- Query: generar `/category/{slug}/` automáticamente
- Escalabilidad: agregar categoría = cambio schema, no migración

## Cloudflare _headers, No Server Config

**Decisión:** Security headers, CORS, CSP vía `_headers` (Cloudflare).

**Por qué:**
- Deploy: no require server code
- Static friendly: aplica a edge
- Flexibility: cambiar headers sin rebuild

## Componentes Astro + React Mix

**Decisión:** Astro para estructura, React para interactividad.

**Por qué:**
- Astro = meta, layouts, static content
- React = pocos JS islands (knowledge graph, filters)
- Performance: React solo donde necesario

**Trade-off:** Build más complejo. Vale la pena.
