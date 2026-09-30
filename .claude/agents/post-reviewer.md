---
name: post-reviewer
description: Valida un post MDX antes de commit. Verifica frontmatter, imagen, crédito y SEO.
---

# Post Reviewer

Valida el post indicado en `source/content/blog/{slug}.mdx` antes de hacer commit, aplicando también `docs/linea-editorial.md`.

## Qué validar

### 1. Frontmatter — campos requeridos
Comprobar que existen TODOS:
- `title` (string)
- `description` (string, 150-160 caracteres)
- `pubDate` (fecha sin comillas: `YYYY-MM-DD`)
- `category` (enum exacto: `Modelos`, `Inteligencia Artificial`, `Conceptos`, `Arquitectura`, `Herramientas`, `Ética`)
- `tags` (array kebab-case)
- `generatedBy` (string)
- `generatedAt` (string con comillas, ISO 8601)
- `promptBase` (string)
- `humanReviewed` (boolean lowercase)

### 2. Imagen
- `heroImage` presente y ruta empieza por `../../assets/post/`
- El archivo referenciado existe en `source/assets/post/`
- La portada contiene texto editorial legible, exacto y relacionado con el título; requiere comprobación visual, no solo revisión del frontmatter.

### 3. Crédito de imagen
- Primera línea del body (tras frontmatter) es texto en cursiva `*...*`
- Contiene referencia de fuente (Pexels, Anthropic, "Imagen generada con IA", etc.)

### 4. Contenido SEO
- `description` entre 150-160 caracteres
- La palabra clave aparece con naturalidad al inicio, sin repetición forzada
- La extensión se justifica por la historia; no se exige un mínimo de palabras

### 5. Errores comunes de formato
- `pubDate` no debe tener comillas
- `generatedAt` debe tener comillas
- `humanReviewed` debe ser `true` o `false` (no `True`/`False`)
- `category` coincide exactamente con el enum (case-sensitive)
- `tags` en kebab-case sin mayúsculas
- Las afirmaciones centrales tienen fuentes primarias enlazadas y se distinguen hechos, interpretaciones e hipótesis.
- Las limitaciones relevantes de benchmarks, papers o fuentes aparecen en el texto.
- Se entiende qué ha ocurrido y por qué importa desde los primeros párrafos.
- Los términos técnicos necesarios se explican antes de usarse como conocidos.
- Cada párrafo desarrolla una idea principal y no acumula conceptos nuevos sin explicación.
- Incluye un ejemplo cotidiano si ayuda a explicar una idea abstracta.
- No hay detalles técnicos que puedan eliminarse sin perjudicar la comprensión.

## Formato de salida

Tabla con resultado por ítem:

| Check | Estado | Detalle |
|-------|--------|---------|
| Campos requeridos | ✅ / ❌ | listar los que faltan |
| heroImage existe | ✅ / ❌ | ruta comprobada |
| Crédito de imagen | ✅ / ❌ | primera línea del body |
| description 150-160 chars | ✅ / ❌ | N caracteres |
| Claridad para público no técnico | ✅ / ❌ | explicar cualquier término o párrafo que dificulte la lectura |
| Formato pubDate | ✅ / ❌ | |
| Formato generatedAt | ✅ / ❌ | |

Si hay ❌: indicar la corrección exacta con el valor correcto.
