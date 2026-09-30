---
name: nuevo-post
description: Crea un nuevo post en source/content/blog/ con frontmatter válido, heroImage con texto editorial e imageCredit
---

# Skill: nuevo-post

Crea un post nuevo en `source/content/blog/` siguiendo el schema exacto del proyecto y `docs/linea-editorial.md`. Escribe para lectores principalmente no técnicos. Pide el tema o la fuente si no se han especificado.

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
category: 'Modelos'          # enum: Modelos | Inteligencia Artificial | Conceptos | Arquitectura | Herramientas | Ética
tags:
  - kebab-case
  - sin-mayusculas
generatedBy: 'claude-sonnet-4-6'
generatedAt: 'YYYY-MM-DDTHH:MM:SSZ'   # CON comillas, ISO 8601
promptBase: 'Prompt o consigna original.'
humanReviewed: false         # boolean lowercase, sin comillas
heroImage: '../../assets/post/nombre-imagen.jpg'
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
- Convertir el encargo en una pregunta concreta antes de escribir.
- Priorizar fuentes primarias y verificar en ellas cifras, fechas, causalidades y afirmaciones técnicas.
- Separar hechos medidos, interpretaciones de los investigadores e hipótesis o preguntas abiertas.
- Incluir limitaciones de las fuentes y no presentar correlación como causalidad.
- Sin mínimo ni objetivo fijo de palabras: incluye lo necesario y elimina el relleno.
- Ordena la explicación desde qué ha pasado y por qué importa hasta cómo funciona, si ese detalle ayuda.
- Explica términos técnicos antes de utilizarlos como conocidos; añade un ejemplo cotidiano cuando el concepto sea abstracto.
- Distingue hechos confirmados, afirmaciones empresariales, resultados preliminares e hipótesis.
- Incluye limitaciones relevantes y comprueba que el artículo se entiende sin conocimientos de IA.
- H2 para secciones principales, H3 para subsecciones
- Fuentes reales al final en sección `## Fuentes`
- Fecha en formato "DD de mes de YYYY" en el texto si se menciona

### 5. Imagen hero
- Generar una portada nueva y específica para este post. No reutilizar la imagen de otro post salvo petición expresa del usuario.
- La portada debe contener texto editorial legible: nombre del tema/modelo y un titular breve relacionado con el título del artículo.
- Revisar visualmente que el texto sea exacto, legible, tenga contraste y no quede recortado en cards o redes sociales.
- Guardar en `source/assets/post/nombre-descriptivo.jpg` o `.png`
- Ratio 1200×630px (1.91:1)
- La petición a la herramienta de imagen debe incluir el texto literal, la jerarquía tipográfica, la composición horizontal y una lista de elementos a evitar.
- No aceptar una ilustración sin texto como portada final.
- Si es de Pexels: nombrar `pexels-autor-id.jpg`

### 6. Tras crear el post
```bash
npm run build:data   # regenerar knowledge map, insights y radar
```

Después de `npm run build`, prepara una rama y abre un pull request para revisión. No publiques directamente en `main`; el despliegue y la indexación deben seguir el flujo aprobado del proyecto.

## Errores que rompen el build

| Campo | Incorrecto | Correcto |
|-------|-----------|---------|
| pubDate | `pubDate: '2026-06-27'` | `pubDate: 2026-06-27` |
| generatedAt | `generatedAt: 2026-06-27T10:00:00Z` | `generatedAt: '2026-06-27T10:00:00Z'` |
| humanReviewed | `humanReviewed: False` | `humanReviewed: false` |
| category | `category: modelos` | `category: Modelos` |
| heroImage | `heroImage: assets/post/img.jpg` | `heroImage: ../../assets/post/img.jpg` |
| portada | ilustración sin texto o hero reutilizada | portada nueva con titular legible y revisado |
