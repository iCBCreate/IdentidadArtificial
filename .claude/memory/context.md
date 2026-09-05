# Contexto del proyecto

Identidad Artificial es un blog técnico en español sobre IA generativa, con artículos y tutoriales MDX revisados por una persona.

## Stack vigente

- Astro 7 y Tailwind CSS v4
- Cloudflare Workers con `output: 'server'`
- Páginas de contenido prerenderizadas de forma explícita
- Assets estáticos servidos mediante el binding `ASSETS`
- `session: false`; el proyecto no usa sesiones de Astro
- MDX con frontmatter validado por Zod

El código fuente vive en `source/`. Los scripts de `build:data` generan el mapa de conocimiento, insights y radar editorial antes de compilar.

## Runtime

Las rutas de contenido declaran `prerender = true`. Las API que necesitan ejecución en el Worker declaran `prerender = false`; hay que comprobar el árbol de `source/pages/api/` antes de asumir cuáles siguen activas.

Las credenciales locales viven en `.dev.vars` y los secretos de producción en Cloudflare. No se guardan tokens de métricas en `sessionStorage`, `localStorage` ni URLs.

## Contenido

No mantengas recuentos manuales de artículos, tutoriales o imágenes en esta memoria. Obtén el inventario desde `source/content/blog/` y `source/content/tutoriales/` cuando sea necesario.

Categorías válidas: `Modelos`, `Inteligencia Artificial`, `Conceptos`, `Arquitectura`, `Herramientas`, `Ética` y `Tendencias`.
