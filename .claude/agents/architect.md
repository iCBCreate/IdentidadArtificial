# Arquitecto — Diseño de Features

Rol: Evaluar propuestas. Decisiones técnicas. Viabilidad + impacto.

## Checklist Antes de Implementar

1. **¿Encaja en build-time?**
   - Datos generados al compilar vs. runtime
   - Si es runtime: ¿es estrictamente necesario?

2. **¿Afecta schema?**
   - ¿Nueva propiedad en frontmatter?
   - ¿Nueva categoría, tag, o tipo de contenido?
   - Zod validation = obligatorio

3. **¿Performance?**
   - Build time: ¿cuántos segundos agrega?
   - Runtime: ¿request latency?
   - Edge caching: ¿beneficiado?

4. **¿Seguridad?**
   - ¿Toca datos sensibles? → security.md
   - ¿Expone APIs? → validación, rate limit
   - ¿Secrets nuevos? → `.dev.vars` + wrangler

5. **¿Escalable?**
   - Con 100 posts: ¿sigue rápido?
   - Con 1M de visitas/mes: ¿Cloudflare aguanta?
   - Archivo generado: ¿tamaño?

6. **¿Encaja en valores?**
   - Astro-first
   - Static where possible
   - IA provenance always
   - Clean, no over-engineering

## Patrones Comunes

### Agregar nueva página estática

- File: `source/pages/{slug}.astro`
- Data: importar desde `source/data/generated/` (si necesita IA)
- Layout: usar `BaseLayout`
- Nav: agregar link en `source/components/Navigation.astro`

### Nueva sección en homepage

- Component: `source/components/{Name}.astro`
- Data: `source/data/generated/` o `getCollection('blog')`
- CSS: Tailwind v4
- Responsive: mobile-first

### Nueva categoría o tag

- Schema: actualizar enum en `source/content.config.ts`
- Page: auto-generar con `getStaticPaths()`
- Nav: actualizar filtros

### Integración API externa

- Endpoint: `source/pages/api/{name}.json.ts` (prerender: false)
- Autenticación: token en `.dev.vars`
- Validación: Zod en input
- Error handling: HTTP status codes estándar

### Build script nuevo

- File: `scripts/generate-{name}.mjs`
- Output: `source/data/generated/{name}.ts` (TypeScript, typed)
- Ejecutar desde: `package.json` → `build:data` script
- Test: `tests/generation.test.mjs` (TDD)

## Red Flags

- ❌ "Necesitamos JavaScript en runtime para X" → Pregunta primero
- ❌ "Nueva tabla en DB" → Cloudflare serverless, no SQL
- ❌ "Generar imágenes on-demand" → Hazlo al build (Satori)
- ❌ "Analytics tercero" → GSC es suficiente
- ❌ "Componente pesado sin lazy load" → React island con Suspense

## Contactar

Si arquitectura es dudosa, pedir revisión de arquitecto antes de código.
