# Lighthouse Audit — IdentidadArtificial.com
**Fecha:** 29 de abril de 2026  
**Herramienta:** Lighthouse 12.x  
**Build:** producción local (`astro build`) sobre Chromium (Playwright)  
**Páginas auditadas:** Home, artículo individual (`/claude-managed-agents/`), archivo (`/archivo/`)

---

## Resumen de puntuaciones

| Página | Dispositivo | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| Home | Desktop | **100** | 95 | **100** | **100** |
| Home | Mobile | **100** | 95 | **100** | **100** |
| Artículo | Mobile | **100** | **100** | **100** | **100** |
| Archivo | Mobile | **100** | **100** | **100** | **100** |

---

## Métricas de rendimiento (Home)

| Métrica | Mobile | Desktop | Umbral verde |
|---|---|---|---|
| First Contentful Paint (FCP) | 0.9 s | 0.2 s | < 1.8 s |
| Largest Contentful Paint (LCP) | 1.6 s | 0.4 s | < 2.5 s |
| Total Blocking Time (TBT) | 0 ms | 0 ms | < 200 ms |
| Cumulative Layout Shift (CLS) | 0 | 0 | < 0.1 |
| Speed Index | 0.9 s | 0.2 s | < 3.4 s |
| Time to Interactive (TTI) | 1.6 s | 0.4 s | < 3.8 s |
| TTFB | 10 ms | 20 ms | < 800 ms |

Todos los Core Web Vitals están en zona verde en ambos dispositivos.

---

## Único fallo encontrado — Accessibility (Home)

**Auditoría:** `target-size` (WCAG 2.5.8)  
**Puntuación:** 95/100 en Home (páginas interiores pasan al 100%)

### Descripción

Los botones `.dot` del componente `AITimeline` tenían un tamaño de **20×20 px**, inferior al mínimo de 24×24 px exigido por WCAG 2.5.8 para objetivos táctiles. Lighthouse detectó el botón de **DeepSeek V3** como el más afectado, con un espacio de clic efectivo de solo 10.8 px horizontalmente al quedar parcialmente solapado por el punto adyacente.

```
Selector: div.tl-inner > div.lane > div.lane-track > button.dot
Snippet:  <button class="dot" style="left: 58.33%" data-name="DeepSeek V3" ...>
Error:    Target has insufficient size (10.8px × 24px, debe ser ≥ 24px × 24px)
```

### Corrección aplicada

En `source/components/AITimeline.astro`:

- **Antes:** `width: 20px; height: 20px` (con override `24px` solo en `@media (max-width: 640px)`)
- **Después:** `width: 24px; height: 24px` como valor base para todos los breakpoints
- Se eliminó el pseudo-elemento `::after` (44×44 px) que Lighthouse no contabiliza para el cálculo de área táctil
- Se eliminó la media query redundante `@media (max-width: 640px)` para el tamaño del punto

---

## SEO — puntos verificados (todos ✅)

- `<title>` y `<meta description>` presentes y correctos
- `rel=canonical` válido
- `hreflang` correcto
- `robots.txt` válido
- Sin bloqueos de indexación
- Links con texto descriptivo
- HTTP 200 en todas las páginas auditadas
- `sitemap-index.xml` generado por `@astrojs/sitemap`

---

## Best Practices — puntos verificados (todos ✅)

- HTTPS activo (Cloudflare Workers)
- CSP efectiva contra XSS
- `X-Frame-Options` / COOP configurados
- Sin APIs deprecated
- Sin cookies de terceros
- Imágenes con aspect ratio correcto
- Imágenes servidas a resolución adecuada
- HSTS con política fuerte
- `charset` definido correctamente
- Trusted Types contra DOM-based XSS
- Sin errores de consola

---

## Optimizaciones de rendimiento activas (verificadas)

- Imágenes en formato **AVIF** con lazy loading (build pipeline Astro)
- Sin CSS o JS sin usar
- Sin recursos que bloquean el render
- Sin JavaScript en el critical path (0 ms TBT)
- Fuentes con `font-display` adecuado
- Compresión activa via Cloudflare
- Headers de caché gestionados por `_headers` (Cloudflare Pages)
- Site estático pre-renderizado (sin SSR en rutas de contenido)

---

## Recomendaciones futuras (no críticas)

| Prioridad | Mejora | Impacto |
|---|---|---|
| Baja | Verificar que todos los dots de AITimeline con posiciones cercanas (< 24 px) no se solapen en pantallas intermedias (768–1024 px) | Accessibility |
| Baja | Añadir `aria-label` explícito a los dots con nombre del modelo (actualmente depende de `data-name`) | Accessibility |
| Baja | Revisar contraste de texto en modo claro si se añade en el futuro | Accessibility |
