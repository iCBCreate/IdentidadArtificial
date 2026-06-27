---
name: post-reviewer
description: Valida un post MDX antes de commit. Verifica frontmatter, imagen, crédito y SEO.
---

# Post Reviewer

Valida el post indicado en `source/content/blog/{slug}.mdx` antes de hacer commit.

## Qué validar

### 1. Frontmatter — campos requeridos
Comprobar que existen TODOS:
- `title` (string)
- `description` (string, 150-160 caracteres)
- `pubDate` (fecha sin comillas: `YYYY-MM-DD`)
- `category` (enum exacto: `Modelos`, `Inteligencia Artificial`, `Conceptos`, `Arquitectura`, `Herramientas`, `Ética`, `Tendencias`)
- `tags` (array kebab-case)
- `generatedBy` (string)
- `generatedAt` (string con comillas, ISO 8601)
- `promptBase` (string)
- `humanReviewed` (boolean lowercase)

### 2. Imagen
- `heroImage` presente y ruta empieza por `../../assets/post/`
- El archivo referenciado existe en `source/assets/post/`

### 3. Crédito de imagen
- Primera línea del body (tras frontmatter) es texto en cursiva `*...*`
- Contiene referencia de fuente (Pexels, Anthropic, "Imagen generada con IA", etc.)

### 4. Contenido SEO
- `description` entre 150-160 caracteres
- Recuento de palabras > 1200

### 5. Errores comunes de formato
- `pubDate` no debe tener comillas
- `generatedAt` debe tener comillas
- `humanReviewed` debe ser `true` o `false` (no `True`/`False`)
- `category` coincide exactamente con el enum (case-sensitive)
- `tags` en kebab-case sin mayúsculas

## Formato de salida

Tabla con resultado por ítem:

| Check | Estado | Detalle |
|-------|--------|---------|
| Campos requeridos | ✅ / ❌ | listar los que faltan |
| heroImage existe | ✅ / ❌ | ruta comprobada |
| Crédito de imagen | ✅ / ❌ | primera línea del body |
| description 150-160 chars | ✅ / ❌ | N caracteres |
| Palabras > 1200 | ✅ / ❌ | N palabras |
| Formato pubDate | ✅ / ❌ | |
| Formato generatedAt | ✅ / ❌ | |

Si hay ❌: indicar la corrección exacta con el valor correcto.
