# Identidad Artificial — Diseño de la web
**Fecha:** 2026-04-21
**Versión:** 1.0
**Basado en:** [`SRS_IdentidadArtificial_v1.pdf`](../../SRS_IdentidadArtificial_v1.pdf)

---

## 1. Resumen del proyecto

Identidad Artificial es un sitio web estático sobre inteligencia artificial y tecnología. Su característica diferenciadora es que el contenido es generado por Claude (Anthropic), con revisión humana obligatoria antes de publicar. El propio pipeline de generación es parte del producto: la web documenta cómo funciona y expone la arquitectura al lector.

**Frase del hero:** *"Un archivo inexacto de lo que pienso mientras intento entenderlo"*

---

## 2. Stack tecnológico

| Pieza | Tecnología |
|---|---|
| Framework | Astro (plantilla minimal, sin andamiaje de plantilla blog) |
| Estilos | Tailwind CSS v4 |
| Contenido | MDX (.mdx) en `src/content/blog/` |
| Despliegue | Cloudflare Pages |
| Repositorio | GitHub (público) |
| Agente de contenido | Claude vía Claude Code |
| Analytics | Cloudflare Web Analytics (sin cookies) |
| RSS | @astrojs/rss |
| Sitemap | @astrojs/sitemap |

---

## 3. Arquitectura y estructura de archivos

```
identidad-artificial/
├── src/
│   ├── content/
│   │   └── blog/              ← Posts en .mdx
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro
│   │   └── TransparencyBlock.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── pages/
│   │   ├── index.astro        ← Home
│   │   ├── sobre.astro
│   │   ├── como-funciona.astro
│   │   ├── archivo.astro
│   │   ├── [slug].astro       ← Post individual
│   │   └── rss.xml.js
│   └── styles/
│       └── global.css
├── public/                    ← Imágenes, favicon
├── src/content/config.ts      ← Schema del frontmatter
├── src/config.ts              ← Configuración global del sitio
├── astro.config.mjs
└── package.json
```

---

## 4. Páginas

| Ruta | Descripción | Prioridad |
|---|---|---|
| `/` | Home: hero + grid de últimos posts | Alta |
| `/[slug]/` | Post individual con TransparencyBlock al pie | Alta |
| `/sobre/` | Quién es Ignacio Cubelas y qué es el proyecto | Alta |
| `/como-funciona/` | Pipeline técnico con código real | Alta |
| `/archivo/` | Todos los posts, filtrables por categoría | Media |
| `/rss.xml` | Feed RSS automático (últimos 20 posts) | Alta |

---

## 5. Componentes

### Header.astro
Nombre del sitio + navegación principal (Home, Sobre, Cómo funciona, Archivo).

### Footer.astro
Links secundarios + crédito + enlace al repositorio público de GitHub.

### PostCard.astro
Tarjeta usada en el grid de la home y en el archivo. Contiene: imagen hero, título, categoría, fecha, extracto y tiempo de lectura estimado.

### TransparencyBlock.astro
Bloque al pie de cada post. Es el componente más característico del proyecto. Muestra:
- Modelo de IA usado (`generatedBy`)
- Fecha de generación (`generatedAt`)
- Prompt base (`promptBase`)
- Si fue revisado por humano (`humanReviewed`)

### BaseLayout.astro
Envuelve todas las páginas. Gestiona: `<head>`, metaetiquetas SEO, Open Graph, Twitter Card, modo claro/oscuro, Google Fonts, Header y Footer.

### PostLayout.astro
Extiende BaseLayout. Añade la estructura específica de un artículo: imagen de cabecera, título, fecha, categoría, tiempo de lectura, cuerpo MDX y TransparencyBlock.

---

## 6. Sistema de contenido

### Frontmatter estándar

```yaml
---
title: 'Título del post'
description: 'Descripción para SEO'
pubDate: 2026-04-21
category: 'inteligencia-artificial'
tags: ['llm', 'agentes']
heroImage: '/images/agentes-de-ia.jpg'
generatedBy: 'claude-sonnet-4-6'
generatedAt: '2026-04-21T10:00:00Z'
promptBase: 'Explica qué son los agentes de IA...'
humanReviewed: true
---
```

El archivo `src/content/config.ts` define el schema Zod que valida estos campos en tiempo de build. Si falta un campo obligatorio, Astro lanza un error antes de desplegar.

### Posts de ejemplo
Se crearán 3 posts iniciales para validar que todo el sistema funciona correctamente antes de automatizar la generación.

---

## 7. Identidad visual

### Colores

| Elemento | Modo claro | Modo oscuro |
|---|---|---|
| Fondo | `#FFFFFF` | `#0F0F0F` |
| Texto principal | `#111111` | `#F0F0F0` |
| Texto secundario | `#666666` | `#999999` |
| Acento | `#7C3AED` | `#7C3AED` |
| Fondo código inline | `#F4F4F4` | `#1A1A1A` |

### Modo claro/oscuro
Se activa automáticamente según la preferencia del sistema operativo del visitante (`prefers-color-scheme`), usando la clase `dark:` de Tailwind. Sin botón de cambio manual en v1.0.

### Tipografía
- **Inter** para todo el texto: titulares en peso 700-800, cuerpo en 400 a 17-18px con interlineado 1.7
- **JetBrains Mono** para bloques de código
- Ambas self-hosted para evitar dependencias externas

### Principio visual
El contenido es el protagonista. Sin animaciones, sin sombras decorativas, sin elementos que distraigan. El acento violeta (`#7C3AED`) aparece en enlaces, etiquetas de categoría y el TransparencyBlock.

---

## 8. Pipeline de publicación

```
1. Se define el tema del post
         ↓
2. Claude genera el archivo .mdx completo
   (título, cuerpo, frontmatter con metadatos de transparencia)
         ↓
3. Revisión humana obligatoria del contenido
         ↓
4. git add . && git commit -m "post: título" && git push
         ↓
5. Cloudflare Pages detecta el push
   → ejecuta npm run build
   → despliega en ~60 segundos
         ↓
6. El post aparece en identidadartificial.com
```

### Configuración de Cloudflare Pages
- Comando de build: `npm run build`
- Directorio de salida: `dist`
- Variables de entorno: gestionadas en el panel de Cloudflare, nunca en el repositorio

---

## 9. Requisitos no funcionales (resumen)

- Lighthouse Performance ≥ 90 en mobile
- 0 KB de JavaScript enviado al cliente por defecto
- Imágenes en WebP con lazy loading
- Metaetiquetas únicas + Open Graph + Twitter Card en cada página
- Sitemap XML + RSS activos y validados
- Sin credenciales en el repositorio
- Contraste AA según WCAG 2.1

---

## 10. Fuera de alcance — v1.0

- Newsletter o suscripción por email
- Sistema de comentarios
- Búsqueda interna
- Internacionalización (i18n)
- Pipeline de generación completamente autónomo sin revisión humana

---

## 11. Criterios de aceptación — v1.0

- [ ] Web desplegada en identidadartificial.com vía Cloudflare Pages
- [ ] Al menos 3 posts publicados con frontmatter completo
- [ ] Página `/como-funciona/` documenta el pipeline real con código
- [ ] Repositorio público con README explicativo
- [ ] RSS y sitemap activos y validados
- [ ] Lighthouse Performance ≥ 90 en mobile
- [ ] Sin credenciales expuestas en el repositorio
