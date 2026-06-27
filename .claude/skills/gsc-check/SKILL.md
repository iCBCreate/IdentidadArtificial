---
name: gsc-check
description: Descarga métricas de Google Search Console y genera reporte de indexación y rendimiento
disable-model-invocation: true
---

# Skill: gsc-check

Ejecuta el flujo completo de Google Search Console para este proyecto.

## Comandos disponibles

```bash
# Reporte de rendimiento (clics, impresiones, posición media)
npm run gsc:report

# Inspección de URLs (estado de indexación)
npm run gsc:inspect

# Enviar sitemap a GSC
npm run gsc:submit-sitemap

# Enviar URLs a IndexNow (indexación rápida en Bing/Yandex)
npm run indexnow

# Dry-run de IndexNow (sin enviar)
npm run indexnow:dry
```

## Requisito previo

Si es la primera vez o el token ha expirado:
```bash
npm run gsc:oauth
```

## Archivos de salida

Los reportes se guardan como archivos locales. Revisar output de consola para ver métricas.
