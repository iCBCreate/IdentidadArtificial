---
name: nuevo-post
description: Crea un nuevo post en source/content/blog/ con frontmatter válido, heroImage e imageCredit
---

# Skill: nuevo-post

Crea un post nuevo en `source/content/blog/` siguiendo el schema exacto del proyecto. Pide al usuario el tema/URL fuente si no se ha especificado.

## Checklist de creación

### 1. Nombre del archivo
- Kebab-case, sin acentos, sin mayúsculas
- Patrón: `slug-descriptivo.mdx`

### 2. Frontmatter (orden obligatorio)

```yaml
---
title: 'Título del post'
description: 'Descripción SEO de exactamente 150-160 caracteres.'
pubDate: YYYY-MM-DD          # SIN comillas
category: 'Modelos'          # enum: Modelos | Inteligencia Artificial | Conceptos | Arquitectura | Herramientas | Ética | Tendencias
tags:
  - kebab-case
  - sin-mayusculas
generatedBy: 'claude-sonnet-4-6'
generatedAt: 'YYYY-MM-DDTHH:MM:SSZ'   # CON comillas, ISO 8601
promptBase: 'Prompt o consigna original.'
humanReviewed: false         # boolean lowercase, sin comillas
heroImage: '../../assets/post/nombre-imagen.png'
sourceQuality: 'Alta'        # opcional: Alta | Media | Baja
confidenceLevel: 'Alta'      # opcional: Alta | Media | Baja
---
```

### 3. Primera línea del body (crédito de imagen)

| Tipo | Formato |
|------|---------|
| Pexels | `*Foto: Nombre Autor / [Pexels](https://www.pexels.com/photo/ID).*` |
| Captura | `*Captura de pantalla de [Marca](https://url).*` |
| IA generada | `*Imagen generada con IA.*` |
| Diagrama | `*Elaboración propia.*` |

### 4. Estructura de contenido
- Mínimo 1200 palabras, óptimo 1400-1800
- H2 para secciones principales, H3 para subsecciones
- Fuentes reales al final en sección `## Fuentes`
- Fecha en formato "DD de mes de YYYY" en el texto si se menciona

### 5. Imagen hero
- Guardar en `source/assets/post/nombre-descriptivo.png` o `.jpg`
- Ratio 1200×630px (1.91:1)
- Si es de Pexels: nombrar `pexels-autor-id.jpg`

### 6. Tras crear el post
```bash
npm run build:data   # regenerar knowledge map, insights y radar
```

## Errores que rompen el build

| Campo | Incorrecto | Correcto |
|-------|-----------|---------|
| pubDate | `pubDate: '2026-06-27'` | `pubDate: 2026-06-27` |
| generatedAt | `generatedAt: 2026-06-27T10:00:00Z` | `generatedAt: '2026-06-27T10:00:00Z'` |
| humanReviewed | `humanReviewed: False` | `humanReviewed: false` |
| category | `category: modelos` | `category: Modelos` |
| heroImage | `heroImage: assets/post/img.png` | `heroImage: ../../assets/post/img.png` |
