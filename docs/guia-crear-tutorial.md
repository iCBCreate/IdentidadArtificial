# Guía para crear un tutorial en Identidad Artificial

Lee esta guía completa antes de generar cualquier tutorial. El incumplimiento de cualquier punto puede romper el build o producir un tutorial que no encaje con el resto de la sección.

---

## Contexto de tutoriales

**Tutoriales en Identidad Artificial** son guías prácticas paso a paso para principiantes que quieren aprender a usar herramientas de IA. El tono es directo, accesible y orientado a la acción: explica qué hacer y por qué, sin tecnicismos innecesarios.

**Audiencia:** personas sin experiencia técnica previa que quieren empezar a usar ChatGPT, Claude, Gemini u otras herramientas. Los tutoriales deben ser autosuficientes — alguien sin contexto previo debe poder seguirlos.

---

## Stack técnico

- Astro 6 + MDX
- Contenido en `source/content/tutoriales/`
- Imágenes en `source/assets/post/`
- Schema validado con Zod en `source/content.config.ts`

---

## Nombre del archivo

Formato: `slug-del-tutorial.mdx`

Reglas:
- Solo minúsculas, guiones, sin acentos ni caracteres especiales
- El slug es también la URL: `identidadartificial.com/tutoriales/slug-del-tutorial/`
- Debe ser descriptivo y contener la palabra clave principal

Ejemplo: `chatgpt-primeros-pasos.mdx` → `/tutoriales/chatgpt-primeros-pasos/`

---

## Frontmatter obligatorio

Todo tutorial debe comenzar con este bloque entre `---`. Todos los campos son obligatorios salvo los marcados como opcionales.

```yaml
---
title: 'Título del tutorial entre comillas simples'
description: 'Descripción de 150-160 caracteres. Resumen práctico de lo que aprenderá.'
pubDate: 2026-05-01
herramienta: 'ChatGPT'
dificultad: 'Principiante'
tiempoEstimado: '10 minutos'
generatedBy: 'nombre-del-modelo-usado'
generatedAt: '2026-05-01T10:00:00Z'
promptBase: 'El prompt exacto o descripción del encargo que originó este tutorial.'
humanReviewed: true
heroImage: '../../assets/post/nombre-imagen.png'   # opcional
correctionNote: 'Texto si el tutorial corrige una versión anterior errónea.'  # opcional
---
```

### Descripción de cada campo

| Campo | Tipo | Descripción |
|---|---|---|
| `title` | string | Título H1 del tutorial. Claro, con verbo de acción. Ej: "Cómo usar ChatGPT para resumir textos" |
| `description` | string | Meta description para SEO. 150-160 caracteres. Resumen práctico. |
| `pubDate` | fecha | Fecha de publicación en formato `YYYY-MM-DD`. Sin comillas. |
| `herramienta` | enum | Herramienta principal: `'ChatGPT'`, `'Claude'`, `'Gemini'` o `'General'`. |
| `dificultad` | enum | Nivel: `'Principiante'` o `'Intermedio'`. |
| `tiempoEstimado` | string | Tiempo aproximado. Ej: `'10 minutos'`, `'15 minutos'`, `'30 minutos'`. |
| `generatedBy` | string | Identificador del modelo que generó el tutorial. Ej: `gemini-2.5-pro`, `gpt-4o`, `claude-sonnet-4-6`. |
| `generatedAt` | ISO 8601 | Fecha y hora de generación. Ej: `2026-05-01T10:00:00Z`. Entre comillas simples. |
| `promptBase` | string | Resumen del prompt o encargo original. Transparencia sobre el origen. |
| `humanReviewed` | boolean | `true` si un humano revisó y aprobó el tutorial antes de publicar. Siempre en minúsculas: `true` o `false`. |
| `heroImage` | ruta relativa | Opcional. Ruta relativa desde el MDX hasta la imagen en `source/assets/post/`. Ver sección imagen. |
| `correctionNote` | string | Opcional. Solo si el tutorial corrige errores de una versión anterior. Visible en el bloque de transparencia. |

### Valores válidos

**herramienta:**
- `'ChatGPT'`
- `'Claude'`
- `'Gemini'`
- `'General'` (para tutoriales aplicables a múltiples herramientas)

**dificultad:**
- `'Principiante'`
- `'Intermedio'`

---

## Imagen hero (opcional pero recomendado)

Si el tutorial tiene imagen principal:

1. **Guarda la imagen** en `source/assets/post/nombre-descriptivo.png` (acepta `.png` o `.jpg`)
2. **Nombra el archivo** en inglés, descriptivo, sin espacios: `chatgpt-prompt-writing.png`
3. **Referencia en frontmatter** con ruta relativa desde el MDX:
   ```yaml
   heroImage: '../../assets/post/chatgpt-prompt-writing.png'
   ```
4. **No pongas `<Image />` ni `<img>` en el cuerpo del MDX** — el layout ya renderiza la heroImage automáticamente en el header. Astro convierte la imagen a `.webp` optimizado durante el build.

El alt text de la imagen se genera automáticamente a partir del `title`.

---

## Estructura del contenido

### Longitud
- Mínimo 400 palabras, óptimo 600-1000 palabras
- Tutoriales cortos y enfocados son mejores que largos y desenfocados
- Cada paso debe ser simple, una acción clara

### Estructura recomendada

```
Párrafo de apertura — qué aprenderás y por qué es útil (máx 2-3 frases)

## Qué necesitas

- Requisito 1
- Requisito 2

## Paso 1: [Acción concreta]

Explicación de por qué. Captura de pantalla si es confuso.

## Paso 2: [Acción concreta]

## Paso 3: [Acción concreta]

## Resultado

Qué deberías ver o haber conseguido.

## Próximos pasos (opcional)

Qué puedes hacer después de completar este tutorial.
```

### Estilo y tono

- **Directo y práctico.** "Haz esto" no "podrías considerar hacer esto".
- **Accesible para principiantes.** Sin asumir conocimiento técnico previo.
- **Con ejemplos reales.** Capturas de pantalla, prompts exactos, resultados esperados.
- **Sin hype.** Explica qué hace la herramienta, no promesas de magia.
- **En español.** Todo el contenido en español. Los nombres de herramientas y términos técnicos se dejan en inglés.
- **Sin emojis.**
- **Sin comillas tipográficas** — usa `"comillas"` estándar o negritas para énfasis.

### Markdown permitido en MDX

- Headings `##` y `###` (no uses `#`, eso es el título)
- **Negritas** para botones, términos clave o acciones
- Listas con `-`
- Listas ordenadas con `1.`, `2.`, etc.
- Bloques de código con lenguaje especificado:
  ````
  ```text
  Ejemplo de prompt o respuesta esperada
  ```
  ````
- Links: `[texto](URL)`
- Blockquotes para consejos o advertencias: `> Consejo: ...`

### Lo que NO hacer

- No uses `<Image />` ni `<img>` HTML en el cuerpo — usa frontmatter `heroImage`
- No importes componentes en el MDX a menos que sea estrictamente necesario
- No añadas estilos inline
- No repitas el título como primer heading `#`
- No asumas que el lector sabe qué es un prompt o una API — explica brevemente si es la primera vez que aparece

---

## Errores frecuentes que rompen el build

| Error | Incorrecto | Correcto |
|---|---|---|
| `pubDate` con comillas | `pubDate: '2026-05-01'` | `pubDate: 2026-05-01` |
| `humanReviewed` en mayúsculas | `humanReviewed: True` | `humanReviewed: true` |
| `herramienta` con error tipográfico | `herramienta: 'chatgpt'` | `herramienta: 'ChatGPT'` |
| `dificultad` sin capitalizar | `dificultad: 'principiante'` | `dificultad: 'Principiante'` |
| `generatedAt` sin comillas | `generatedAt: 2026-05-01T10:00:00Z` | `generatedAt: '2026-05-01T10:00:00Z'` |
| `heroImage` con ruta incorrecta | `heroImage: 'assets/post/img.png'` | `heroImage: '../../assets/post/img.png'` |
| Imagen referenciada pero no guardada | el archivo `.mdx` menciona una imagen que no existe en `source/assets/post/` | guarda primero el archivo de imagen, luego referéncialo |
| `<Image />` o `<img>` en el cuerpo | usar etiquetas de imagen dentro del contenido MDX | usa solo `heroImage` en frontmatter |
| Título repetido como `#` heading | primer heading del body es el título | empieza directamente con el párrafo de apertura |

---

## Checklist antes de publicar

- [ ] Archivo nombrado en minúsculas con guiones
- [ ] Todos los campos obligatorios en frontmatter
- [ ] `herramienta` es uno de: ChatGPT, Claude, Gemini, General
- [ ] `dificultad` es Principiante o Intermedio
- [ ] `tiempoEstimado` está en un formato sensato (ej: "10 minutos")
- [ ] `pubDate` sin comillas
- [ ] `generatedAt` con comillas simples
- [ ] `humanReviewed` en minúsculas (true o false)
- [ ] Mínimo 400 palabras
- [ ] Cada paso es una acción clara, no teoría
- [ ] No hay `<Image />` ni `<img>` en el cuerpo
- [ ] Si usas imagen hero, existe en `source/assets/post/`
- [ ] El tutorial se puede seguir sin contexto previo
- [ ] No hay emojis
- [ ] No hay URLs inventadas
