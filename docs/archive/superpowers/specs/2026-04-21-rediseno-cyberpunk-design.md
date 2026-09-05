# Rediseño Visual Cyberpunk — Identidad Artificial

## Objetivo
Transformar toda la web a un estilo oscuro cyberpunk coherente, inspirado en la captura de referencia (SRC/Captura de pantalla 2026-04-21 a las 11.07.54.png), con fondo legible (no excesivamente negro).

## Paleta de colores aprobada

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#1C1C2C` | Fondo de página |
| `--color-surface` | `#24243A` | Fondo de tarjetas |
| `--color-border` | `#2E2E48` | Bordes generales |
| `--color-border-subtle` | `#2A2A40` | Bordes header/footer |
| `--color-text` | `#E8E8F0` | Texto principal |
| `--color-muted` | `#A0A0C0` | Texto secundario/meta |
| `--color-accent` | `#7C3AED` | Morado principal (sin cambio) |
| `--color-accent-badge` | `#6D28D9` | Fondo badge categoría |
| `--color-accent-btn-text` | `#A78BFA` | Texto botón "Leer artículo" |

## Cambios por archivo

### `source/styles/global.css`
- Reemplazar `bg-white` por el color de fondo `#1C1C2C`
- Reemplazar `dark:bg-[#0F0F0F]` — el modo oscuro pasa a ser el único modo
- Eliminar lógica light/dark: la web es siempre oscura
- Actualizar colores de texto, code, pre

### `source/components/Header.astro`
- Fondo: `#1C1C2C`, borde inferior: `#2A2A40`
- Links nav: `#A0A0C0`, activo: `#8B5CF6`

### `source/components/Footer.astro`
- Fondo: `#1C1C2C`, borde superior: `#2A2A40`
- Texto y links: `#A0A0C0`

### `source/components/PostCard.astro`
- Fondo tarjeta: `#24243A`, borde: `#2E2E48`
- Badge categoría: fondo `#6D28D9`, texto blanco
- Título: `#E8E8F0`
- Descripción/meta: `#A0A0C0`
- Añadir botón "Leer artículo →" con borde `#6D28D9` y texto `#A78BFA`
- Eliminar el separador `·` en color claro, usar `#3A3A54`

### `source/layouts/BaseLayout.astro`
- Añadir `class="bg-[#1C1C2C]"` al `<html>` o `<body>` para evitar flash blanco

### `source/pages/index.astro`
- Texto hero: `#E8E8F0`
- Subtítulo: `#A0A0C0`
- Label "Últimas entradas": `#A0A0C0`, borde inferior `#2A2A40`

### Otras páginas (`sobre.astro`, `como-funciona.astro`, `archivo.astro`, `[slug].astro`)
- Aplicar los mismos colores de texto y fondo para coherencia

## Notas
- No se cambia la tipografía (Inter Variable se mantiene)
- No se cambia el layout (grid 2 columnas, max-w-3xl, se mantiene)
- El botón "Leer artículo →" se añade al PostCard (actualmente no existe)
- No hay modo claro: la web es siempre oscura
