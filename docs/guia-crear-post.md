# Guía para crear un post en Identidad Artificial

Lee esta guía completa antes de generar cualquier contenido. El incumplimiento de cualquier punto puede romper el build o producir un post que no encaje con el resto del blog.

---

## Contexto del blog

**Identidad Artificial** es un medio divulgativo en español sobre inteligencia artificial, dirigido principalmente a personas no técnicas. No presupongas que el lector conoce términos como LLM, prompt o API.

**Sigue la línea editorial:** consulta [Línea editorial de Identidad Artificial](./linea-editorial.md) antes de redactar. La prioridad es que el lector entienda qué ha ocurrido, por qué importa y cómo puede afectarle.

---

## Stack técnico

- Astro 7 + MDX
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
heroImage: '../../assets/post/nombre-imagen.png'
correctionNote: 'Texto si el post corrige una versión anterior errónea.'  # opcional
reviewNotes: 'Notas sobre la revisión realizada.'  # opcional
sourceQuality: 'Alta'  # opcional: Alta | Media | Baja
confidenceLevel: 'Alta'  # opcional: Alta | Media | Baja
claimsReviewed: ['claim 1', 'claim 2']  # opcional
---
```

### Descripción de cada campo

| Campo | Tipo | Descripción |
|---|---|---|
| `title` | string | Título H1 del post. Claro, con keyword principal, sin clickbait. |
| `description` | string | Meta description para SEO. 150-160 caracteres. |
| `pubDate` | fecha | Fecha de publicación en formato `YYYY-MM-DD`. Sin comillas. |
| `category` | string | Categoría principal. Ver lista abajo. |
| `tags` | array | 3-5 tags en kebab-case. Sin mayúsculas. |
| `generatedBy` | string | Identificador del modelo que generó el post. Ej: `gemini-2.5-pro`, `gpt-4o`, `claude-sonnet-4-6`. |
| `generatedAt` | ISO 8601 | Fecha y hora de generación. Ej: `2026-05-01T10:00:00Z`. Entre comillas simples. |
| `promptBase` | string | Resumen del prompt o encargo original. Transparencia sobre el origen. |
| `humanReviewed` | boolean | `true` si un humano revisó y aprobó el post antes de publicar. Siempre en minúsculas: `true` o `false`. |
| `heroImage` | ruta relativa | **Obligatorio.** Ruta relativa desde el MDX hasta la imagen en `source/assets/post/`. Se usa para web (AVIF optimizado) y para og:image en RRSS (JPEG 1200×630). Ver sección imagen. |
| `correctionNote` | string | Opcional. Solo si el post corrige errores de una versión anterior. Visible en el bloque de transparencia. |
| `reviewNotes` | string | Opcional. Notas de revisión humana sobre el contenido, precisión o cambios realizados. |
| `sourceQuality` | enum | Opcional. Calidad de las fuentes consultadas: `'Alta'`, `'Media'` o `'Baja'`. |
| `confidenceLevel` | enum | Opcional. Confianza en la precisión del contenido: `'Alta'`, `'Media'` o `'Baja'`. |
| `claimsReviewed` | array | Opcional. Lista de afirmaciones clave que fueron verificadas durante la revisión humana. |

### Categorías válidas

Usa exactamente uno de estos valores (respetando mayúsculas/minúsculas):

- `Modelos`
- `Inteligencia Artificial`
- `Conceptos`
- `Arquitectura`
- `Herramientas`
- `Ética`

---

## Imagen hero (obligatoria)

Todos los posts deben tener `heroImage`. Es la imagen que aparece en la cabecera del post, en las cards de la home y como imagen de previsualización en redes sociales (og:image / twitter:image).

### Cómo funciona el pipeline de imagen

Una sola imagen fuente genera dos versiones automáticamente durante el build:

- **Web** → Astro optimiza la imagen a AVIF con múltiples resoluciones (responsive). Se sirve desde `/_astro/nombre-hash.avif`.
- **RRSS (og:image)** → PostLayout genera un JPEG 1200×630 a partir de la misma imagen y lo usa como `og:image` y `twitter:image`. Es lo que ven LinkedIn, X, WhatsApp y cualquier scraper de metadatos al compartir el enlace.

Si no se define `heroImage`, el fallback para og:image es la imagen Satori generada por `generate-og.mjs` (`/og/{slug}.png`), que muestra el título sobre fondo oscuro con la marca del blog. Esa imagen es genérica — **siempre es mejor tener heroImage**.

### Requisito editorial: portada con texto

La `heroImage` de un post debe ser una portada editorial identificable a primera vista. **No basta con una ilustración abstracta o una imagen genérica**: debe incluir texto legible relacionado con el título del artículo.

Reglas obligatorias:

- Genera una imagen nueva y específica para el post; no reutilices la hero de otro artículo salvo que el usuario lo pida expresamente.
- Incluye el nombre del tema o modelo y un titular breve. Usa el título real del post como referencia, pero adapta su longitud para que sea legible en móvil y en las cards.
- El texto debe ser exacto, estar dentro de márgenes seguros y tener contraste suficiente. Revisa visualmente ortografía, mayúsculas, acentos y guiones.
- No añadas texto inventado, logos, marcas de agua ni pseudo-texto ilegible.
- Si la imagen se genera con IA, conserva `*Imagen generada con IA.*` como primera línea del body.

Para una portada generada con IA, la petición debe especificar como mínimo: uso editorial, **1200×630 px (1,91:1)**, composición, texto literal, jerarquía tipográfica, contraste y elementos que deben evitarse. Después de generarla, inspecciona la imagen antes de actualizar `heroImage`.

### Pasos

1. **Guarda la imagen** en `source/assets/post/nombre-descriptivo.png` (acepta `.png` o `.jpg`)
2. **Nombra el archivo** en inglés, descriptivo, sin espacios: `ai-reasoning-model-screen.png`
3. **Referencia en frontmatter** con ruta relativa desde el MDX:
   ```yaml
   heroImage: '../../assets/post/ai-reasoning-model-screen.png'
   ```
4. **No pongas `<Image />` ni `<img>` en el cuerpo del MDX** para repetir la heroImage. Excepción: puedes usar `<Image />` para una figura o captura imprescindible para explicar el artículo, con `alt` descriptivo y fuente/crédito.

### Requisitos de la imagen fuente

- **Formato:** PNG o JPG
- **Ratio obligatorio para nuevas portadas:** 1200×630 px (ratio 1,91:1) — coincide exactamente con og:image estándar y evita recortes en RRSS y en las tarjetas
- **Fondo:** preferiblemente oscuro o con contraste claro; fondos blancos funcionan en og:image pero quedan mal en las cards de la home (diseño oscuro)
- **Peso:** sin límite estricto — Astro comprime agresivamente a AVIF durante el build

El alt text de la imagen se genera automáticamente a partir del `title`.

**Todas las imágenes deben tener crédito**, independientemente de si tienen derechos de autor. Añádelo como primera línea del body (antes del primer párrafo), en cursiva:

| Tipo de imagen | Formato de crédito |
|----------------|-------------------|
| Pexels | `*Foto: Nombre Autor / [Pexels](https://www.pexels.com/photo/ID).*` |
| Captura de pantalla | `*Captura de pantalla de [Marca](https://url-marca.com).*` |
| IA generada | `*Imagen generada con IA.*` |
| Diagrama / gráfico propio | `*Elaboración propia.*` |
| Logotipo de tercero | `*Logotipo de [Marca](https://url-marca.com).*` |

---

## Investigación y calidad editorial

Antes de redactar, convierte el encargo en una pregunta concreta y prepara una lista breve de afirmaciones que el artículo tendrá que sostener. Para cada afirmación importante, comprueba la fuente, la fecha, la cifra exacta, el alcance de la evidencia y el nivel de confianza.

Prioriza fuentes primarias: documentación oficial, papers originales, repositorios de los autores, datos publicados por el proveedor y organismos evaluadores. Usa fuentes secundarias para encontrar pistas, pero verifica en la fuente original cualquier cifra, fecha, causalidad o afirmación técnica relevante.

Separa siempre estas tres capas: **hecho medido** (lo que muestran directamente los datos), **interpretación** (lo que los autores creen que significa) e **hipótesis o pregunta abierta** (lo que todavía no está demostrado).

No presentes correlación como causalidad. No inventes detalles de arquitectura, entrenamiento, hardware, disponibilidad, precios o rendimiento. Si una fuente reconoce una limitación, inclúyela junto a la afirmación que limita. Cuando el tema sea actual, comprueba la fecha y la versión concreta del producto o benchmark.

---

## Estructura del contenido

### Longitud
No existe un mínimo ni un objetivo fijo de palabras. Escribe lo necesario para explicar la noticia con claridad y rigor; elimina lo que no ayude a comprenderla. La extensión no sustituye una explicación suficiente ni demuestra por sí sola calidad o indexabilidad.

### Estructura recomendada

Prioriza este orden, adaptándolo a cada historia: qué ha pasado → qué significa → ejemplo cotidiano → por qué importa → cómo funciona (si hace falta) → limitaciones e incertidumbres → contexto imprescindible → qué conviene observar ahora. La entradilla tiene un máximo de dos frases. No fuerces secciones que no aporten; incluye las limitaciones cuando existan y termina con una idea concreta, no con una repetición.

### Estilo y tono

Aplica los criterios de la [línea editorial](./linea-editorial.md): explica antes de nombrar, prioriza consecuencias, usa ejemplos cotidianos y desarrolla una idea por párrafo. Define las siglas y términos técnicos la primera vez que sean necesarios. Distingue hechos, declaraciones empresariales, resultados preliminares e hipótesis. Conserva el rigor y evita hype, lenguaje académico, tono corporativo, párrafos densos y datos que no ayuden a comprender.

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

- No uses `<Image />` ni `<img>` HTML en el cuerpo — usa frontmatter `heroImage`
- No importes componentes en el MDX a menos que sea estrictamente necesario
- No añadas estilos inline
- No repitas el título como primer heading `#`

---

## SEO y citabilidad por motores de IA (GEO)

Estas reglas afectan directamente si Google indexa el post y si sistemas como ChatGPT, Perplexity o Claude lo citan en sus respuestas.

### Keyword en las primeras 100 palabras

La keyword principal debe aparecer de forma natural en el primer párrafo. No en el heading — en el texto del párrafo de apertura.

### Jerarquía de headings

Usa siempre `##` para secciones principales y `###` para subsecciones. No saltes niveles. Una jerarquía clara es lo que permite a los motores de IA extraer y citar fragmentos correctamente.

### Enlazado interno

Enlaza a otros posts cuando ayuden a entender el tema o aporten contexto. Usa un anchor text descriptivo; no añadas enlaces solo para alcanzar una cantidad.

- **Correcto:** `Para entender cómo funciona el bucle de un agente, [qué son los agentes de IA](/que-son-los-agentes-de-ia/) explica la mecánica base.`
- **Incorrecto:** `Para más información [haz clic aquí](/que-son-los-agentes-de-ia/).`

Los links van dentro del texto del post, no en una sección aparte al final.

### Afirmaciones citables

Sustenta las afirmaciones centrales con fuentes consultadas y datos concretos cuando ayuden a explicar la noticia. No añadas cifras ni afirmaciones solo para hacer el artículo más citable.

- **Citable:** "Claude Managed Agents expone la infraestructura de agentes a través de la API y desde Claude.ai en planes Team y Enterprise."
- **No citable:** "Esta tecnología está disponible para usuarios de pago."

### Formato answer-first

Para secciones que responden a una pregunta concreta, pon la respuesta en las primeras 1-2 frases del párrafo antes de desarrollarla. Facilita que los motores de IA citen el fragmento sin necesitar contexto adicional.

---

## Sources (fuentes)

Al final del post, añade las fuentes reales consultadas:

```markdown
## Fuentes
- [Título del artículo](https://url-real.com)
- [Otro artículo](https://otra-url.com)
```

**IMPORTANTE:** Solo incluye fuentes que hayas consultado realmente. No inventes URLs. Si no tienes acceso a fuentes actuales, indícalo en `correctionNote` o no publiques el post hasta verificarlo.

---

## Errores frecuentes que rompen el build

Estos son los errores más comunes que cometen los modelos de IA al generar posts:

| Error | Incorrecto | Correcto |
|---|---|---|
| `pubDate` con comillas | `pubDate: '2026-05-01'` | `pubDate: 2026-05-01` |
| `humanReviewed` en mayúsculas | `humanReviewed: True` | `humanReviewed: true` |
| Categoría con error tipográfico | `category: 'modelos'` | `category: 'Modelos'` |
| `generatedAt` sin comillas | `generatedAt: 2026-05-01T10:00:00Z` | `generatedAt: '2026-05-01T10:00:00Z'` |
| `tags` en mayúsculas | `tags: ['LLM', 'OpenAI']` | `tags: ['llm', 'openai']` |
| `heroImage` con ruta incorrecta | `heroImage: 'assets/post/img.png'` | `heroImage: '../../assets/post/img.png'` |
| Imagen referenciada pero no guardada | el archivo `.mdx` menciona una imagen que no existe en `source/assets/post/` | guarda primero el archivo de imagen, luego referéncialo |
| `<Image />` o `<img>` en el cuerpo | usar etiquetas de imagen dentro del contenido MDX | usa solo `heroImage` en frontmatter |
| Título repetido como `#` heading | primer heading del body es el título | empieza directamente con el párrafo de apertura |
| URLs inventadas en Sources | poner URLs plausibles pero no verificadas | solo URLs reales que hayas consultado |

---

## Verificación antes de guardar

Antes de guardar el archivo, comprueba:

- [ ] Frontmatter completo y sin errores de sintaxis YAML
- [ ] `pubDate` en formato `YYYY-MM-DD` (sin comillas)
- [ ] `generatedAt` en formato ISO 8601 con `Z` al final (entre comillas simples)
- [ ] `humanReviewed` es `true` o `false` en minúsculas
- [ ] `tags` en kebab-case y minúsculas
- [ ] `category` exactamente como aparece en la lista de categorías válidas
- [ ] Fuentes reales al final del post
- [ ] `heroImage` definida (obligatorio — sin ella no hay og:image para RRSS)
- [ ] Imagen guardada en `source/assets/post/` antes de referenciarla
- [ ] La portada es nueva y específica para este post, salvo autorización expresa para reutilizarla
- [ ] La portada contiene texto editorial legible y exacto relacionado con el título
- [ ] El texto de la portada se ha revisado visualmente en desktop y móvil o con una previsualización equivalente
- [ ] Ruta de `heroImage` empieza por `../../assets/post/`
- [ ] Imagen nueva en 1200×630 px (1,91:1), comprobada antes de referenciarla
- [ ] Sin `<Image />` ni `<img>` para repetir la heroImage; cualquier figura adicional usa `<Image />`, tiene `alt` descriptivo y crédito
- [ ] La extensión responde a lo que necesita la historia; no hay relleno para alcanzar un mínimo
- [ ] Keyword principal en el primer párrafo (primeras 100 palabras)
- [ ] Los enlaces internos aportan contexto y usan anchor text descriptivo
- [ ] Hay ejemplos cotidianos cuando ayudan a entender ideas abstractas
- [ ] Los términos técnicos necesarios se explican antes de usarse como conocidos
- [ ] Las afirmaciones importantes tienen fuente primaria enlazada
- [ ] Se han separado hechos medidos, interpretaciones e hipótesis
- [ ] Las cifras incluyen unidad, versión, configuración o alcance cuando sea necesario
- [ ] Las limitaciones relevantes aparecen junto a las conclusiones
- [ ] El artículo supera la revisión final de `docs/linea-editorial.md`

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
heroImage: '../../assets/post/gemini-2-5-pro-interface.png'
---

Google presentó **Gemini 2.5 Pro** el 10 de mayo de 2026 con una capacidad que ningún modelo de producción había alcanzado hasta ahora: procesar y razonar sobre **2 millones de tokens** en una sola llamada.

## Por qué 2M de tokens cambia el tipo de tarea posible

...

## Fuentes
- [Introducing Gemini 2.5 Pro — Google DeepMind](https://deepmind.google/...)
```

---

## Tras crear el archivo

1. Guarda el `.mdx` en `source/content/blog/`
2. Si hay imagen, guárdala en `source/assets/post/` (`.png` o `.jpg`)
3. Ejecuta `npm run build` para verificar que no hay errores de validación
   - Este comando ejecuta automáticamente: `build:data` (genera TS con datos) → `generate-og` (crea OG images desde frontmatter) → `astro build` (valida y compila)
   - Si falla, el error indicará qué está mal en el frontmatter o el MDX
4. Haz commit en una rama y abre un pull request para revisión. Tras aprobarlo, fusiónalo en `main`; el workflow de GitHub Actions ejecuta el build, el despliegue a Cloudflare y `npm run indexnow`.
5. Si el despliegue se hace fuera de CI, verifica primero que la URL pública devuelve `200` y que el post aparece en `sitemap-index.xml`; después ejecuta `npm run indexnow`.

**El orden importa:** primero build (y que pase), luego commit y revisión del pull request, después fusión en `main` y despliegue. Envía las URLs a IndexNow solo cuando la versión pública exista. Si `npm run build` falla, corrige antes de continuar.
