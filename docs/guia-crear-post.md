# Guía para crear un post en Identidad Artificial

Lee esta guía completa antes de generar cualquier contenido. El incumplimiento de cualquier punto puede romper el build o producir un post que no encaje con el resto del blog.

---

## Contexto del blog

**Identidad Artificial** es un blog técnico en español sobre IA generativa. El tono es técnico pero accesible: explica conceptos reales con rigor, sin hype ni sensacionalismo. Los posts cubren modelos, agentes, arquitectura, conceptos fundamentales y herramientas.

**Audiencia:** desarrolladores, diseñadores y profesionales con interés en IA. Saben qué es un LLM, un prompt o una API, pero no son necesariamente investigadores.

---

## Stack técnico

- Astro 6 + MDX
- Contenido en `source/content/blog/`
- Imágenes en `source/assets/post/`
- Schema validado con Zod en `source/content.config.ts`

---

## Nombre del archivo

Formato: `slug-del-post.mdx`

Reglas:
- Solo minúsculas, guiones, sin acentos ni caracteres especiales
- El slug es también la URL: `identidadartificial.com/slug-del-post/`
- Debe ser descriptivo y contener la keyword principal

Ejemplo: `gpt-image-2-razonamiento-visual.mdx`

---

## Frontmatter obligatorio

Todo post debe comenzar con este bloque entre `---`. Todos los campos son obligatorios salvo los marcados como opcionales.

```yaml
---
title: 'Título del post entre comillas simples'
description: 'Descripción de 150-160 caracteres. Debe resumir el post con keywords relevantes.'
pubDate: 2026-05-01
category: 'Modelos'
tags: ['tag1', 'tag2', 'tag3']
generatedBy: 'nombre-del-modelo-usado'
generatedAt: '2026-05-01T10:00:00Z'
promptBase: 'El prompt exacto o descripción del encargo que originó este post.'
humanReviewed: true
heroImage: '../../assets/post/nombre-imagen.jpg'   # opcional
correctionNote: 'Texto si el post corrige una versión anterior errónea.'  # opcional
---
```

### Descripción de cada campo

| Campo | Tipo | Descripción |
|---|---|---|
| `title` | string | Título H1 del post. Claro, con keyword principal, sin clickbait. |
| `description` | string | Meta description para SEO. 150-160 caracteres. |
| `pubDate` | fecha | Fecha de publicación en formato `YYYY-MM-DD`. |
| `category` | string | Categoría principal. Ver lista abajo. |
| `tags` | array | 3-5 tags en kebab-case. Sin mayúsculas. |
| `generatedBy` | string | Identificador del modelo que generó el post. Ej: `gemini-2.5-pro`, `gpt-4o`, `claude-sonnet-4-6`. |
| `generatedAt` | ISO 8601 | Fecha y hora de generación. Ej: `2026-05-01T10:00:00Z`. |
| `promptBase` | string | Resumen del prompt o encargo original. Transparencia sobre el origen. |
| `humanReviewed` | boolean | `true` si un humano revisó y aprobó el post antes de publicar. |
| `heroImage` | ruta relativa | Opcional. Ruta relativa desde el MDX hasta la imagen en `source/assets/post/`. |
| `correctionNote` | string | Opcional. Solo si el post corrige errores de una versión anterior. Visible en el bloque de transparencia. |

### Categorías válidas

Usa exactamente uno de estos valores (respetando mayúsculas/minúsculas):

- `Modelos`
- `Inteligencia Artificial`
- `Conceptos`
- `Arquitectura`
- `Herramientas`
- `Ética`
- `Tendencias`

---

## Imagen hero (opcional pero recomendado)

Si el post tiene imagen principal:

1. **Guarda la imagen** en `source/assets/post/nombre-descriptivo.jpg` (o `.png`)
2. **Nombra el archivo** en inglés, descriptivo, sin espacios: `ai-reasoning-model-screen.jpg`
3. **Referencia en frontmatter** con ruta relativa desde el MDX:
   ```yaml
   heroImage: '../../assets/post/ai-reasoning-model-screen.jpg'
   ```
4. **No pongas `<Image />` en el cuerpo del MDX** — el layout ya renderiza la heroImage automáticamente en el header

El alt text de la imagen se genera automáticamente a partir del `title`.

Si usas una imagen de Pexels u otra fuente, añade el crédito en el primer párrafo del post.

---

## Estructura del contenido

### Longitud
- Mínimo 600 palabras, óptimo 900-1400 palabras
- Posts más cortos no dan valor suficiente, más largos pierden foco

### Estructura recomendada

```
Párrafo de apertura — contexto y por qué importa (NO empieces con "En este post...")

## Sección principal 1

## Sección principal 2

## Sección principal 3

(Opcional) ## Lo que sigue siendo difícil / Limitaciones

## Por qué es relevante ahora / Conclusión breve

Sources:
- [Título fuente](URL)
```

### Estilo y tono

- **Técnico pero accesible.** Explica el concepto, no solo lo nombres.
- **Sin hype.** Frases como "revolucionará el mundo" o "cambiará todo para siempre" están prohibidas.
- **Concreto.** Usa ejemplos reales, casos de uso específicos, comparaciones con versiones anteriores.
- **En español.** Todo el contenido en español. Los nombres de modelos, APIs y términos técnicos se dejan en inglés.
- **Sin emojis.**
- **Sin comillas tipográficas** — usa `"comillas"` estándar o negritas para énfasis.

### Markdown permitido en MDX

- Headings `##` y `###` (no uses `#`, eso es el título)
- **Negritas** para conceptos clave
- Tablas comparativas cuando sean útiles
- Bloques de código con lenguaje especificado:
  ````
  ```bash
  comando de ejemplo
  ```
  ````
- Listas con `-`
- Links: `[texto](URL)`

### Lo que NO hacer

- No uses `<img>` HTML directo — usa frontmatter `heroImage`
- No importes componentes en el MDX a menos que sea estrictamente necesario
- No añadas estilos inline
- No repitas el título como primer heading

---

## Sources (fuentes)

Al final del post, añade las fuentes reales consultadas:

```markdown
Sources:
- [Título del artículo](https://url-real.com)
- [Otro artículo](https://otra-url.com)
```

**IMPORTANTE:** Solo incluye fuentes que hayas consultado realmente. No inventes URLs. Si no tienes acceso a fuentes actuales, indícalo en `correctionNote` o no publiques el post hasta verificarlo.

---

## Verificación antes de guardar

Antes de guardar el archivo, comprueba:

- [ ] Frontmatter completo y sin errores de sintaxis YAML
- [ ] `pubDate` en formato `YYYY-MM-DD` (sin comillas)
- [ ] `generatedAt` en formato ISO 8601 con `Z` al final
- [ ] `tags` en kebab-case y minúsculas
- [ ] `category` exactamente como aparece en la lista de categorías válidas
- [ ] `humanReviewed: true` solo si fue revisado por un humano
- [ ] Fuentes reales al final del post
- [ ] Sin `<Image />` en el cuerpo si `heroImage` está en frontmatter
- [ ] Imagen guardada en `source/assets/post/` si se referencia

---

## Ejemplo de post completo

```mdx
---
title: 'Gemini 2.5 Pro: razonamiento multimodal en contextos largos'
description: 'Google lanzó Gemini 2.5 Pro en mayo de 2026. Contexto de 2M tokens, razonamiento nativo sobre vídeo e imagen, y benchmark MMLU superior a GPT-4o.'
pubDate: 2026-05-10
category: 'Modelos'
tags: ['google', 'gemini', 'multimodal', 'razonamiento', 'contexto-largo']
generatedBy: 'gemini-2.5-pro'
generatedAt: '2026-05-10T11:00:00Z'
promptBase: 'Analiza las capacidades de Gemini 2.5 Pro: contexto de 2M tokens, razonamiento sobre vídeo, benchmarks comparados con GPT-4o y Claude 3.7. Tono técnico, ejemplos concretos.'
humanReviewed: true
heroImage: '../../assets/post/gemini-2-5-pro-interface.jpg'
---

Google presentó **Gemini 2.5 Pro** el 10 de mayo de 2026 con una capacidad que ningún modelo de producción había alcanzado hasta ahora: procesar y razonar sobre **2 millones de tokens** en una sola llamada.

## Por qué 2M de tokens cambia el tipo de tarea posible

...

Sources:
- [Introducing Gemini 2.5 Pro — Google DeepMind](https://deepmind.google/...)
```

---

## Tras crear el archivo

1. Guarda el `.mdx` en `source/content/blog/`
2. Si hay imagen, guárdala en `source/assets/post/`
3. Ejecuta `npm run build` para verificar que no hay errores
4. Haz commit y push — Cloudflare despliega automáticamente
