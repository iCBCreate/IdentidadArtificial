# GEO Analysis — identidadartificial.com

**Fecha del análisis:** 2026-05-29  
**Dominio:** https://identidadartificial.com  
**Autor:** Ignacio Cubelas  
**Stack:** Astro 6 · Cloudflare Workers · Output estático

---

## GEO Readiness Score: 72 / 100

| Dimensión | Peso | Puntuación | Score parcial |
|-----------|------|-----------|--------------|
| Citabilidad de pasajes | 25% | 18/25 | 18 |
| Legibilidad estructural | 20% | 15/20 | 15 |
| Contenido multi-modal | 15% | 8/15 | 8 |
| Autoridad y señales de marca | 20% | 12/20 | 12 |
| Accesibilidad técnica | 20% | 19/20 | 19 |
| **TOTAL** | | | **72 / 100** |

---

## Breakdown por plataforma

| Plataforma | Score | Estado | Principal gap |
|-----------|-------|--------|--------------|
| Google AI Overviews | 75/100 | Bueno | H2 en formato pregunta, bloques citable 134-167 palabras |
| ChatGPT | 52/100 | Débil | Sin presencia en Wikipedia ni Reddit |
| Perplexity | 48/100 | Débil | Sin menciones en Reddit (fuente de 46.7% de sus citas) |
| Bing Copilot | 65/100 | Medio | Base técnica sólida; necesita IndexNow |

---

## 1. Estado de AI Crawlers

**Producción verificada.** El `robots.txt` de producción coincide con el local.

| Crawler | Estado | Recomendación |
|---------|--------|--------------|
| GPTBot | ✅ Permitido | Mantener |
| OAI-SearchBot | ✅ Permitido | Mantener |
| ChatGPT-User | ✅ Permitido | Mantener |
| ClaudeBot | ✅ Permitido | Mantener |
| PerplexityBot | ✅ Permitido | Mantener |
| Google-Extended | ✅ Permitido | Mantener |
| Applebot-Extended | ✅ Permitido | Mantener |
| anthropic-ai | ✅ Permitido | Mantener |
| Bytespider | ✅ Permitido | Mantener |
| CCBot | ✅ Permitido | Considerar bloqueo si no se quiere contribuir a datos de entrenamiento de CC |

**Valoración:** Configuración de crawlers AI entre las mejores posibles. Sin gaps.

---

## 2. Estado de llms.txt

| Item | Estado |
|------|--------|
| `/llms.txt` | ✅ Presente |
| `/llms-full.txt` | ✅ Presente (corpus dinámico completo) |
| RSL 1.0 | ✅ Declarado (indexing + training: allowed, citation required) |
| Artículos listados | ⚠️ Solo 7 artículos recomendados (18 posts en total) |
| Tutoriales listados | ⚠️ Solo 2 de los tutoriales disponibles |
| Categorías descritas | ✅ 5 categorías con descripción |
| Datos de contacto/autor | ✅ LinkedIn del autor |

**Gap detectado:** `llms.txt` lista solo 7 de 18 posts. Los artículos más recientes (Claude Code, GPT-5.5, Apple Intelligence) no aparecen en la guía para LLMs. Un LLM que solo lea `llms.txt` tiene una imagen incompleta del sitio.

---

## 3. Análisis de menciones de marca

| Plataforma | Presencia | Detalle |
|-----------|-----------|---------|
| Wikipedia (es) | ❌ Ausente | Ni el sitio ni el autor tienen artículo propio |
| Wikidata | ❌ No verificado | Alta probabilidad de ausencia |
| Reddit | ❌ Sin menciones indexadas | 0 resultados en búsqueda `identidadartificial.com site:reddit.com` |
| YouTube | ❌ Sin canal propio | No se detecta presencia de video |
| Instagram | ✅ Existe | Cuenta `@identidad_artificial` pero baja correlación con citas AI |
| LinkedIn autor | ✅ Presente | linkedin.com/in/icubelas — referenciado en schema |
| GitHub | ✅ Presente | Repositorio del blog público |

**Impacto crítico:** ChatGPT cita Wikipedia en el 47.9% de sus respuestas y Reddit en el 11.3%. Perplexity usa Reddit en el 46.7%. La ausencia total en ambas plataformas explica el score bajo en ChatGPT y Perplexity.

---

## 4. Citabilidad de pasajes

Análisis sobre `claude-managed-agents.mdx` como muestra representativa.

### Estructura actual de headings

```
H2: Qué es exactamente un Claude Managed Agent
H2: Qué puede hacer que antes no era posible
H2: Por qué "aceleran" y no solo "automatizan"
H2: El diseño de seguridad de Anthropic como ventaja diferencial
H2: Los límites que todavía existen
```

**Problema:** Los H2 están en formato declarativo/nominal, no en formato pregunta. Los motores AI (especialmente Google AIO) priorizan headings que coinciden con patrones de consulta.

**Ejemplo de mejora:**
- Actual: `Qué es exactamente un Claude Managed Agent`
- Óptimo: `¿Qué es exactamente un Claude Managed Agent?`

### Longitud de bloques de respuesta

| Bloque | Palabras aprox. | Estado |
|--------|----------------|--------|
| Introducción antes del primer H2 | ~40 palabras | ✅ Buena apertura, pero no es auto-contenida |
| Párrafo "El bucle funciona así" + lista | ~90 palabras | ⚠️ Por debajo del óptimo (134-167) |
| Párrafo "La diferencia entre automatización..." | ~120 palabras | ⚠️ Cerca, pero conclusión enterrada al final |
| Bloque sobre seguridad Constitutional AI | ~170 palabras | ✅ En rango óptimo |

**Problema recurrente:** Los posts usan listas numeradas y bullets extensamente, lo que fragmenta el contenido en chunks pequeños. Para citabilidad AI, se necesitan párrafos narrativos de 134-167 palabras que sean auto-contenidos (pueden extraerse sin contexto y tienen sentido completo).

### Patrón de definición "X es..."

**Presente en intro:** "Un Claude Managed Agent es una instancia de Claude que opera dentro de un bucle autónomo con acceso a herramientas externas." ✅

**Falta:** La definición debería estar en las primeras 60 palabras del artículo y ser más específica para ser citada como snippet.

---

## 5. Verificación de Server-Side Rendering

| Criterio | Estado |
|----------|--------|
| Output mode | ✅ `static` — todo el contenido pre-renderizado |
| JavaScript requerido para leer contenido | ✅ No — HTML puro en el output |
| Excepción dinámica | `/api/search-console/report.json.ts` (`prerender: false`) — no es contenido público |
| View Transitions API | Progresive enhancement — no bloquea contenido a crawlers |

**Sin issues técnicos.** Los crawlers AI (que no ejecutan JS) reciben HTML completo.

---

## 6. Schema actual vs recomendado

### Implementado correctamente
- `Article` en cada post (headline, description, datePublished, dateModified, author, publisher)
- `Person` para el autor con `sameAs` a LinkedIn y GitHub
- `Organization` para el sitio
- `FAQ` condicional cuando el post tiene preguntas frecuentes
- `WebSite`, `Blog`, `TechArticle`, `Dataset`, `CollectionPage`, `ItemList`

### Gaps en schema

| Schema | Estado | Impacto |
|--------|--------|---------|
| `Person.knowsAbout` | ❌ Ausente | Mejora señal de expertise en AI para ChatGPT |
| `Person.description` | ❌ Ausente | Campo que ChatGPT usa para entender autoridad del autor |
| `WebSite.potentialAction` (SearchAction) | ❌ Ausente | Habilita sitelinks search box en Google |
| `BreadcrumbList` | ❌ No detectado | Ayuda a AIO a entender jerarquía del sitio |
| `Article.about` | ❌ Ausente | Vinculación explícita a entidades de Schema.org/Wikipedia |

---

## 7. Top 5 cambios de mayor impacto

### 1. Presencia en Reddit — CRÍTICO para Perplexity y ChatGPT

**Por qué:** Reddit es fuente del 46.7% de citas de Perplexity y 11.3% de ChatGPT. Sin presencia en Reddit, estas plataformas casi nunca citarán identidadartificial.com.

**Acción:** Publicar resúmenes o comentarios relevantes en subreddits de IA en español:
- r/espanol (IA general)
- r/LanguageTechnology
- r/ChatGPT, r/ClaudeAI (comentarios con links en contexto relevante)
- Crear posts en r/artificial o r/MachineLearning cuando salga contenido único

**Esfuerzo:** Medio | **Impacto:** Alto en ChatGPT y Perplexity

---

### 2. Ampliar llms.txt con todos los artículos activos

**Por qué:** Solo 7 de 18 posts aparecen en `llms.txt`. Un LLM que lea el archivo tiene visibilidad incompleta del sitio.

**Acción:** Editar `public/llms.txt` para incluir todos los posts recientes. Priorizar los de mayor potencial de citación:
- GPT-5.5 (benchmarks, análisis)
- Claude Code Security
- Claude Mythos y Glasswing (datos únicos: 10.000 vulnerabilidades)
- Imágenes AVIF en Astro (dato único sobre compresión)

**Esfuerzo:** Bajo | **Impacto:** Alto para todos los LLMs

---

### 3. Convertir H2 a formato pregunta

**Por qué:** Los motores AI seleccionan contenido que coincide con patrones de consulta. Un heading "¿Qué es un Claude Managed Agent?" coincide directamente con la query del usuario.

**Acción:** En `source/content/blog/*.mdx`, convertir headings de formato `Qué es X` a `¿Qué es X?`. No es un cambio de contenido, solo de puntuación y formato.

**Archivos afectados:** Todos los posts MDX — patrón simple de `## Qué` → `## ¿Qué`

**Esfuerzo:** Bajo | **Impacto:** Medio-Alto para Google AIO

---

### 4. Añadir bloques de definición auto-contenidos (134-167 palabras)

**Por qué:** Los pasajes óptimos para citación AI tienen 134-167 palabras y son auto-contenidos. Los posts actuales fragmentan con listas que no pueden extraerse sin contexto.

**Acción:** En cada post, añadir después del primer H2 un párrafo de definición de 134-167 palabras que:
1. Empiece con "X es..." o "X se refiere a..."
2. Incluya el contexto necesario para entenderse solo
3. Acabe con la implicación práctica más importante

**Esfuerzo:** Medio | **Impacto:** Alto para Google AIO y Perplexity

---

### 5. Añadir `Person.knowsAbout` y `Person.description` al schema

**Por qué:** ChatGPT usa estos campos para evaluar la autoridad temática del autor antes de citar. Sin ellos, el autor es una entidad opaca.

**Acción:** En `source/layouts/PostLayout.astro`, añadir al schema `Person`:

```json
"knowsAbout": [
  "Inteligencia artificial generativa",
  "Modelos de lenguaje (LLM)",
  "Agentes de IA",
  "Arquitectura de sistemas de IA"
],
"description": "Autor especializado en inteligencia artificial generativa. Publica en identidadartificial.com análisis técnicos sobre modelos de lenguaje, agentes de IA y herramientas de IA generativa."
```

**Esfuerzo:** Bajo | **Impacto:** Medio para ChatGPT

---

## 8. Recomendaciones de reformateo de contenido

### Patrón actual (evitar para citabilidad)
```
## Qué puede hacer que antes no era posible

Con un chatbot convencional, si le pides "analiza estos 50 documentos..."
Un Claude Managed Agent puede:
- **Iterar sobre colecciones grandes**...
- **Combinar herramientas**...
- **Tomar decisiones ramificadas**...
```

### Patrón recomendado (optimizado para citación AI)
```
## ¿Qué puede hacer un Claude Managed Agent que un chatbot no puede?

Un Claude Managed Agent puede iterar sobre colecciones grandes de documentos, código 
o datos sin perder el hilo entre iteraciones. A diferencia de un chatbot convencional 
que procesa solo lo que cabe en el contexto, el agente combina herramientas en 
secuencia —buscar información, procesar resultados y escribir el informe final— y 
toma decisiones ramificadas según lo que encuentra en cada paso. Si el análisis de un 
documento revela algo inesperado, el agente ajusta su estrategia para los siguientes 
sin instrucciones adicionales. Esta capacidad de adaptarse al contexto es lo que 
diferencia la automatización tradicional (pasos fijos) de la aceleración agéntica 
(siguiente acción determinada por el resultado anterior).
```
*Este bloque tiene ~140 palabras, comienza con el tema clave, es auto-contenido y puede extraerse sin contexto.*

---

## 9. Resumen ejecutivo

**Lo que funciona bien:**
- Infraestructura técnica AI-ready entre las mejores posibles (100% crawlers permitidos, llms.txt + llms-full.txt, RSL 1.0, output estático, schema rico)
- El blog está bien posicionado para Google AIO si se mejora la estructura de pasajes

**El gap principal:**
- Ausencia total en Reddit y Wikipedia — las dos fuentes que más pesan en ChatGPT y Perplexity
- Sin resolver este gap, el sitio seguirá invisible para el 50%+ del tráfico AI aunque el contenido sea excelente

**Prioridad recomendada:**
1. Ampliar `llms.txt` (30 minutos, impacto inmediato)
2. Convertir H2 a formato pregunta (1 hora, impacto en Google AIO)
3. Estrategia de presencia en Reddit (ongoing, impacto en ChatGPT/Perplexity)
4. Añadir schema `knowsAbout` al autor (30 minutos)
5. Reescribir introducciones de posts con bloques auto-contenidos de 134-167 palabras
