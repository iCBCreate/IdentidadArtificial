# Diseño: Card mejorada, Breadcrumbs, RelatedPosts, Pagination

## Objetivo

Añadir 4 componentes nuevos al blog Identidad Artificial (Astro 6 + Tailwind CSS v4, tema cyberpunk oscuro), respetando el sistema de colores existente.

## Componentes

### 1. PostCard mejorada (`PostCard.astro`)
**Cambio:** La tarjeta destacada (primer post) ocupa 2 columnas en la cuadrícula. Las demás tienen badge outline (borde violeta, sin fondo sólido).

- Badge: primer post → `bg-[#6D28D9] text-white` (sólido). Resto → `border border-[#6D28D9] text-[#A78BFA]` (outline).
- La cuadrícula en `index.astro` pasa de `sm:grid-cols-2` a `sm:grid-cols-3`. El primer post tiene `sm:col-span-2`.
- Props sin cambios. La lógica "es el primero" la gestiona el padre (index.astro) pasando prop `featured?: boolean`.

### 2. Breadcrumbs (`Breadcrumbs.astro`)
**Nuevo componente.** Aparece en `PostLayout.astro` encima del badge de categoría.

- Markup: `⌂ Inicio › [Categoría] › [Título truncado]`
- `⌂ Inicio` → `href="/"`
- `[Categoría]` → `href="/archivo/"` (sin filtrado por ahora, solo redirige al archivo)
- Título truncado (max ~40 chars con `…`)
- Props: `category: string`, `title: string`

### 3. RelatedPosts (`RelatedPosts.astro`)
**Nuevo componente.** Al pie de cada artículo (en `PostLayout.astro`), antes de `TransparencyBlock`.

- Recibe todos los posts + post actual. Filtra por misma categoría, excluye el actual, toma los 3 más recientes.
- Header: "Más sobre [Categoría]" + enlace "Ver archivo →" (`href="/archivo/"`)
- Cuadrícula 3 columnas (colapsa a 1 en móvil).
- Cada tarjeta: badge categoría (sólido), título, fecha + tiempo de lectura.
- Props: `currentSlug: string`, `category: string`, `allPosts: CollectionEntry<'blog'>[]`, función `calcReadingTime`.

### 4. Pagination
**Nuevo componente (`Pagination.astro`).** Usado en `index.astro` y `archivo.astro`.

- 3 artículos por página.
- Botones: ‹ prev, números, … (ellipsis si >5 páginas), › next.
- Página activa: `bg-[#6D28D9]`. Desactivado: `opacity-30`.
- Info: "Página X de Y · N artículos"
- Las páginas usan rutas estáticas: `/`, `/pagina/2/`, `/pagina/3/`, … (excepto página 1 que es la raíz).
- `index.astro` se convierte en `[...page].astro` con `paginate()` de Astro.
- `archivo.astro` igual: `archivo/index.astro` + `archivo/[...page].astro` o una sola ruta con `paginate()`.

## Sistema de colores (consistencia)
- Fondo tarjeta: `#1C1C2E` / borde: `#2E2E48`
- Hover borde: `#6D28D9` con sombra `rgba(109,40,217,0.12)`
- Badge sólido: `#6D28D9` texto blanco
- Badge outline: borde `#6D28D9` texto `#A78BFA`
- Texto principal: `#E8E8F0`, secundario: `#A0A0C0`, separador: `#3A3A54`
- Botón paginación activo: `bg-[#6D28D9]`
