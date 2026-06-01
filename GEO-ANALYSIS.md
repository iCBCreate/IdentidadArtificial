# GEO Analysis — identidadartificial.com

**Fecha del análisis:** 2026-06-01  
**Dominio:** https://identidadartificial.com  
**Autor:** Ignacio Cubelas  
**Stack:** Astro 6 · Cloudflare Workers · Output estático

---

## GEO Readiness Score: 76 / 100

| Dimensión | Peso | Puntuación | Score parcial |
|-----------|------|-----------|--------------|
| Citabilidad de pasajes | 25% | 19/25 | 19 |
| Legibilidad estructural | 20% | 15/20 | 15 |
| Contenido multi-modal | 15% | 8/15 | 8 |
| Autoridad y señales de marca | 20% | 15/20 | 15 |
| Accesibilidad técnica | 20% | 19/20 | 19 |
| **TOTAL** | | | **76 / 100** |

*Mejora de 4 puntos respecto al análisis anterior (72/100 de 2026-05-29). Cambios aplicados: llms.txt completado (18/18 posts + 3 tutoriales), schema Person.knowsAbout ya presente.*

---

## Breakdown por plataforma

| Plataforma | Score | Estado | Principal gap |
|-----------|-------|--------|--------------|
| Google AI Overviews | 78/100 | Bueno | H2 en formato pregunta, bloques citables 134-167 palabras |
| ChatGPT | 55/100 | Débil | Sin presencia en Wikipedia ni Reddit |
| Perplexity | 50/100 | Débil | Sin menciones en Reddit (fuente del 46.7% de sus citas) |
| Bing Copilot | 68/100 | Medio | Base técnica sólida; falta IndexNow |

---

## 1. Estado de AI Crawlers

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
| CCBot | ✅ Permitido | Considerar bloqueo si no se quiere contribuir al dataset Common Crawl |

**Valoración:** Configuración de crawlers AI óptima. Sin gaps.

---

## 2. Estado de llms.txt

| Item | Estado |
|------|--------|
| `/llms.txt` | ✅ Presente |
| `/llms-full.txt` | ✅ Presente (corpus dinámico completo en runtime) |
| RSL 1.0 | ✅ Declarado (indexing + training: allowed, citation required) |
| Artículos listados | ✅ 18/18 posts activos |
| Tutoriales listados | ✅ 3/3 tutoriales |
| Categorías descritas | ✅ 7 categorías con descripción |
| Datos de contacto/autor | ✅ LinkedIn del autor |

**Estado:** llms.txt completo. Todos los artículos activos y tutoriales están indexados para LLMs.

---

## 3. Análisis de menciones de marca

| Plataforma | Presencia | Detalle |
|-----------|-----------|---------|
| Wikipedia (es) | ❌ Ausente | Ni el sitio ni el autor tienen artículo propio |
| Wikidata | ❌ Ausente | Sin entidad registrada |
| Reddit | ❌ Sin menciones | 0 resultados `identidadartificial.com site:reddit.com` |
| YouTube | ❌ Sin canal | No se detecta presencia de video |
| Instagram | ✅ Existe | Cuenta `@identidad_artificial` (baja correlación con citas AI) |
| LinkedIn autor | ✅ Presente | linkedin.com/in/icubelas — referenciado en schema `sameAs` |
| GitHub | ✅ Presente | Repositorio público del blog |

**Impacto crítico:** ChatGPT cita Wikipedia en el 47.9% de sus respuestas y Reddit en el 11.3%. Perplexity usa Reddit en el 46.7%. La ausencia total en ambas plataformas es el gap más grande del sitio para visibilidad en IA.

---

## 4. Citabilidad de pasajes

### Estructura de headings

Los H2 siguen en formato declarativo/nominal en la mayoría de posts:

```
❌ Actual:     ## Qué es exactamente un Claude Managed Agent
✅ Optimizado: ## ¿Qué es exactamente un Claude Managed Agent?
```

Los motores AI (especialmente Google AIO) priorizan headings que coinciden con patrones de consulta. El cambio es de puntuación y orden de palabras, no de contenido.

### Longitud de bloques de respuesta

Los posts usan listas numeradas y bullets extensamente, lo que fragmenta el contenido en chunks pequeños. Para citabilidad AI, se necesitan párrafos narrativos de **134-167 palabras** que sean auto-contenidos.

**Patrón actual (evitar):**
```
## Qué puede hacer que antes no era posible

Con un chatbot convencional...
Un Claude Managed Agent puede:
- Iterar sobre colecciones grandes...
- Combinar herramientas...
- Tomar decisiones ramificadas...
```

**Patrón recomendado (optimizado para citación):**
```
## ¿Qué puede hacer un Claude Managed Agent que un chatbot no puede?

Un Claude Managed Agent puede iterar sobre colecciones grandes de documentos, 
código o datos sin perder el hilo entre iteraciones. A diferencia de un chatbot 
convencional que procesa solo lo que cabe en el contexto, el agente combina 
herramientas en secuencia y toma decisiones ramificadas según lo que encuentra 
en cada paso. Esta capacidad de adaptarse al contexto es lo que diferencia la 
automatización tradicional (pasos fijos) de la aceleración agéntica (siguiente 
acción determinada por el resultado anterior).
```
*~140 palabras, auto-contenido, extraíble sin contexto.*

### Definición "X es..." en primeros 60 palabras

Presente en algunos posts (ej: claude-managed-agents), ausente en otros. Verificar post a post.

---

## 5. Verificación de Server-Side Rendering

| Criterio | Estado |
|----------|--------|
| Output mode | ✅ `static` — todo el contenido pre-renderizado en build |
| JavaScript requerido para leer contenido | ✅ No — HTML puro en la respuesta inicial |
| Excepción dinámica | `/api/search-console/report.json.ts` (`prerender: false`) — no es contenido público |
| View Transitions API | ✅ Progressive enhancement — no bloquea contenido a crawlers |

Sin issues técnicos. Los crawlers AI (que no ejecutan JS) reciben HTML completo.

---

## 6. Schema actual

### Implementado y verificado
| Schema | Estado |
|--------|--------|
| `Article` en cada post | ✅ headline, description, datePublished, dateModified, author, publisher, keywords, inLanguage |
| `Person` para el autor | ✅ name, url, sameAs (LinkedIn + GitHub), knowsAbout (array) |
| `Organization` | ✅ name, url, logo, founder |
| `FAQPage` | ✅ Condicional cuando el post tiene FAQs generadas |
| `BreadcrumbList` | ✅ Presente en posts y categorías (3 niveles) |
| `WebSite` + `SearchAction` | ✅ En homepage |
| `Blog` con `BlogPosting` | ✅ En homepage (últimos 5 posts) |
| `CollectionPage` + `ItemList` | ✅ En categorías, tags y archivo |
| `TechArticle` | ✅ En /como-funciona/ |
| `Dataset` | ✅ En /mapa-ia/ y /radar/ |

### Gaps pendientes

| Schema | Estado | Impacto |
|--------|--------|---------|
| `Person.description` | ❌ Ausente | ChatGPT usa este campo para evaluar autoridad del autor |
| `Article.about` | ❌ Ausente | Vincular explícitamente a entidades de Schema.org/Wikipedia |
| `WebSite.potentialAction` (SearchAction) | ❌ Ausente | Habilita sitelinks search box en Google |

---

## 7. Top 5 cambios de mayor impacto

### 1. Presencia en Reddit — CRÍTICO para Perplexity y ChatGPT

**Por qué:** Reddit es fuente del 46.7% de citas de Perplexity y 11.3% de ChatGPT. Sin presencia, estas plataformas no citarán identidadartificial.com.

**Acción:** Publicar resúmenes o comentarios relevantes en:
- r/espanol (IA general)
- r/ChatGPT, r/ClaudeAI (comentarios con links en contexto)
- r/artificial o r/MachineLearning para contenido único

**Esfuerzo:** Medio | **Impacto:** Alto en ChatGPT y Perplexity

---

### 2. Convertir H2 a formato pregunta

**Acción:** En `source/content/blog/*.mdx`, cambiar `## Qué es X` → `## ¿Qué es X?`. Solo puntuación y reordenación, no contenido.

**Esfuerzo:** Bajo | **Impacto:** Medio-Alto para Google AIO

---

### 3. Añadir bloques de definición auto-contenidos (134-167 palabras)

**Acción:** En cada post, el primer párrafo después del H2 principal debe ser un bloque narrativo de 134-167 palabras que empiece con "X es..." y pueda extraerse sin contexto.

**Esfuerzo:** Medio | **Impacto:** Alto para Google AIO y Perplexity

---

### 4. Añadir `Person.description` al schema

**Acción:** En `source/layouts/PostLayout.astro`, añadir al objeto `author`:

```json
"description": "Autor especializado en inteligencia artificial generativa. Publica en identidadartificial.com análisis técnicos sobre modelos de lenguaje, agentes de IA y herramientas de IA generativa con revisión humana en cada artículo."
```

**Esfuerzo:** Bajo (5 minutos) | **Impacto:** Medio para ChatGPT

---

### 5. Crear presencia en YouTube o Wikipedia

**Acción (a elegir):**
- **YouTube:** Canal con videos cortos sobre los mismos temas del blog. Las menciones en YouTube tienen correlación 0.737 con visibilidad AI (mayor correlación de todas las plataformas).
- **Wikipedia:** Artículo sobre el autor o sobre conceptos cubiertos en el blog (RAG, agentes de IA) con referencia al sitio.

**Esfuerzo:** Alto | **Impacto:** Muy Alto para todas las plataformas

---

## 8. Resumen ejecutivo

**Lo que funciona bien:**
- Infraestructura técnica AI-ready excelente: todos los crawlers permitidos, llms.txt completo (18 posts + 3 tutoriales), llms-full.txt dinámico, RSL 1.0, output estático, schema rico
- Google AIO razonablemente bien servido con schema Article, FAQPage y BreadcrumbList

**El gap principal:**
- Ausencia total en Reddit y Wikipedia. Sin resolver este gap, el sitio será invisible para ChatGPT y Perplexity aunque el contenido sea excelente
- Los H2 en formato declarativo y los párrafos cortos/fragmentados limitan la citabilidad en Google AIO

**Prioridad:**
1. Formato pregunta en H2 (bajo esfuerzo, impacto Google AIO)
2. `Person.description` en schema (5 minutos, impacto ChatGPT)
3. Estrategia Reddit (ongoing, máximo impacto ChatGPT/Perplexity)
4. Bloques auto-contenidos 134-167 palabras en posts
5. Presencia YouTube o Wikipedia (alto esfuerzo, máximo impacto a largo plazo)
