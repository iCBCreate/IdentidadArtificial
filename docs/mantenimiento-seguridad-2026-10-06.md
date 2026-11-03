# Mantenimiento y seguridad — 6 de octubre de 2026

## Resultado y alcance

Corrección del plazo total de descarga y actualización compatible del sitio, preparada para revisión mediante PR. No se ha desplegado ni fusionado la rama.

Base: `origin/main` actualizado, commit `35c05d2539c6e885e16c9611327950c8d46b981e`.
Rama aislada: `codex/security-maintenance-2026-10-06`. La rama editorial y sus archivos sin seguimiento se conservaron.
Plan: [implementación](superpowers/plans/2026-10-06-security-maintenance.md).

Referencia original: Codex Security, scan `49e0e8fc-8ac5-44dd-aef5-715281c192d5`, informe `report.md`, `findings.json`, `coverage.json`, `scan-manifest.json` y suplemento `artifacts/04_reporting/site-maintenance.md`, conservados sin modificaciones en el archivo local del escaneo. Ese informe auditaba otra referencia; las cifras de esta entrega se midieron nuevamente desde la base indicada.

Se excluyen migraciones mayores, cambios editoriales, investigación de DNS privado, límites compartidos y permisos OAuth.

## Descarga remota

Un único temporizador de 8.000 ms permanece activo desde el comienzo de la petición remota hasta consumir su cuerpo. Se limpia en `finally`. `readLimitedResponse` acepta una señal opcional, interrumpe lectores detenidos, retira su listener y solicita cancelación sin esperar a que el servidor remoto la complete.

Los rechazos por redirección y tamaño declarado excesivo también cancelan el cuerpo. Se conservan metadatos JSON, CORS, HTTPS obligatorio, rechazo de redirecciones, límite de 1 MiB y límite por IP. Estados: 200 correcto, 408 plazo agotado, 413 exceso, 422 redirección y 502 error de red.

Las pruebas de regresión se ejecutaron primero contra la implementación anterior: siete fallos pertinentes; después, 27 pruebas del endpoint pasan. Usan tiempo controlado y respuestas simuladas; no atacan producción.

## Versiones efectivamente resueltas

Validación: Node **22.23.3**, distribución oficial arm64 con checksum SHA-256 verificado, utilizada desde un directorio temporal. Mínimo del proyecto `>=22.18.0`; ambos workflows usan `22.x`. La nota de Renovate ya no exige Node 23.4.

| Dependencia | Base | Final |
|---|---:|---:|
| @astrojs/check | 0.9.9 | 0.9.10 |
| @astrojs/cloudflare | 14.2.1 | 14.3.4 |
| @astrojs/mdx | 7.0.5 | 7.0.8 |
| @astrojs/rss | 4.0.19 | 4.0.19 |
| @astrojs/sitemap | 3.7.3 | 3.7.4 |
| @fontsource-variable/inter | 5.2.8 | 5.3.0 |
| @fontsource/jetbrains-mono | 5.2.8 | 5.3.0 |
| @huggingface/transformers | 4.2.0 | 4.3.1 |
| @qdrant/js-client-rest | 1.18.0 | 1.19.0 |
| @resvg/resvg-js | 2.6.2 | 2.6.2 |
| @tailwindcss/typography | 0.5.20 | 0.5.20 |
| @tailwindcss/vite | 4.3.1 | 4.3.3 |
| astro | 7.2.2 | 7.3.6 |
| gpt-tokenizer | 3.4.0 | 3.4.0 |
| gray-matter | 4.0.3 | 4.0.3 |
| openai | 6.44.0 | 6.49.0 |
| satori | 0.26.0 | 0.26.0 |
| tailwindcss | 4.3.1 | 4.3.3 |
| typescript | 5.9.3 | 5.9.3 |
| yaml | 2.9.0 | 2.9.1 |
| tsx | 4.22.4 | 4.23.15 |
| wrangler | 4.123.0 | 4.148.0 |

Todas las copias de **Sharp son 0.35.5**: Transformers, Astro y Miniflare. Se aplican overrides compatibles de Sharp 0.35, YAML 2 y Undici 7 en el cliente Qdrant. `npm ls sharp --all` confirma un árbol válido. El bloqueo se volvió a resolver para eliminar resoluciones antiguas retenidas; el diff incluye esa deduplicación y metadatos transitivos.

No se adoptan OpenAI 7, tokenizer 4, TypeScript 7, MDX 8 ni otra línea de Satori. No se utilizó `npm audit fix --force`, degradación de Typography ni override mayor de su parser.

### Ajustes de compatibilidad comprobados

- Transformers 4.3.1 incorpora un WASM asyncify que supera 25 MiB. El copiador utiliza el par CPU estándar de ONNX (WASM: **14.264.838 bytes**), elimina el par anterior y rechaza archivos mayores de 25 MiB. Vite conserva sus condiciones predeterminadas y añade la condición oficial `onnxruntime-web-use-extern-wasm`, evitando emitir la copia asyncify inutilizada. La página establece rutas locales explícitas y `device: 'wasm'`.
- Se desactiva únicamente `env.useWasmCache`: la caché nueva generaba importaciones de scripts `blob:` bloqueadas por la CSP existente. Se conserva la CSP y la caché del modelo/HTTP. La carga real y la inferencia se comprobaron en Chromium.
- Qdrant 1.19 elimina el método obsoleto `search`. El helper usa `query` y devuelve `result.points`, manteniendo el contrato de array, límites y payload. Pruebas con cliente simulado verifican resultados y vacío. No se ha accedido a Qdrant ni modificado su colección.

## Auditoría de dependencias

| Severidad | Base | Final |
|---|---:|---:|
| Crítica | 1 | 0 |
| Alta | 15 | 0 |
| Moderada | 7 | 6 |
| Baja | 1 | 0 |
| Total de paquetes afectados | 24 | 6 |

Desaparecen todos los avisos críticos, altos y bajos. Los seis nodos moderados representan **dos problemas raíz**, no seis vulnerabilidades independientes. `npm audit` sigue terminando con estado 1 por esos avisos; no se afirma un audit sin incidencias.

| Paquete / versión | Aviso y aplicabilidad | Resolución y seguimiento |
|---|---|---|
| postcss-selector-parser 6.0.10 | [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf): complejidad con selectores adversarios. Procesa CSS de construcción confiable, no entrada pública. | Corrección en 7.1.6 exige otra línea. Esperar actualización compatible de Typography y volver a auditar. |
| @tailwindcss/typography 0.5.20 | Nodo padre afectado por el parser anterior; mismo alcance de construcción. | npm propone degradar a 0.5.4; excluido por el plan. Seguir la dependencia del parser. |
| sprintf-js 1.0.3 | [GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c): complejidad en formato adversario. Entra por herramientas de frontmatter locales; no se expone un parser público. | Sin versión corregida publicada compatible indicada por audit. Seguir advisory y cadena js-yaml/gray-matter. |
| argparse 1.0.10 | Nodo padre de sprintf-js, en la cadena de herramientas locales. | Actualizar cuando js-yaml adopte una cadena corregida compatible. |
| js-yaml 3.15.2 | Nodo padre de argparse, usado por gray-matter sobre contenido del repositorio. | Mantener seguimiento de gray-matter; no forzar una línea mayor del parser. |
| gray-matter 4.0.3 | Nodo padre de js-yaml; build, configuración y CLI editorial sobre archivos locales confiables. | npm propone degradar a 2.0.1; excluido. Volver a evaluar si cambia el origen de contenido o se ofrece una solución compatible. |

Este alcance limita la exposición actual; no elimina los avisos. Las excepciones moderadas se documentan conforme al plan aprobado y deben reevaluarse en futuras actualizaciones.

## Validación

| Comprobación | Resultado |
|---|---|
| Instalación limpia `npm ci` | Correcta con Node 22.23.3 y el bloqueo final |
| `npm test` | **96 pasan, 0 fallan** |
| `npx astro check` | 112 archivos, **0 errores, 0 warnings**, 7 hints en el runtime vendor generado |
| `npm run build` | Correcta, validación del sitio superada |
| `git diff --check` | Correcto |
| Rutas HTML y sitemap | **99 HTML / 83 URL**, listas exactamente iguales a la base del mismo checkout |
| Límite de assets | Ningún archivo final supera 25 MiB |
| Auditoría final | **0 críticos / 0 altos / 6 moderados / 0 bajos** |

Comprobación local del Worker generado en Chromium:

- Portada en escritorio y 390 × 844: seis imágenes AVIF cargadas, sin desbordamiento horizontal; capturas inspeccionadas.
- Artículo `/openai-devday-2026-novedades-planes-cuentas/`: imagen AVIF y tabla Markdown con cabecera renderizadas.
- `/laboratorio/tokenizador/`: ejemplo procesado (12 tokens) y borrado verificado.
- Generador en `/tutoriales/que-indexan-realmente-los-llms/`: forma y previsualización de llms.txt verificadas con metadatos simulados en el límite HTTP. El intento real desde el Worker local a la web pública recibió 408; la descarga externa exitosa desde este entorno no queda acreditada.
- `/laboratorio/embeddings/`: descarga real del modelo, carga de WASM local e inferencia de tres frases; tres puntos y matriz de similitud. Sin nuevos errores de CSP en el flujo corregido.
- API local de métricas: **401 sin credenciales**. No se modificaron permisos ni OAuth.
- Sin errores de consola en la comprobación final de portada, artículo, tokenizador y generador simulado.

Registros y capturas de ejecución permanecen en el directorio temporal de evidencias del equipo que realizó la validación; no se incorporan binarios, cachés, assets regenerables ni secretos al PR. Las comprobaciones automáticas pueden reproducirse desde la rama.

## Publicación posterior

Tras revisión del PR y autorización expresa de publicación: registrar la versión activa previa, desplegar, confirmar la nueva versión activa de Cloudflare y verificar páginas públicas, sitemap, imágenes, API de metadatos y 401 de métricas. Un 200 de caché no demuestra publicación.

Durante los primeros 30 minutos, revisar errores del Worker y respuestas 408/502. Si una regresión se atribuye a esta entrega, restaurar la versión activa previa registrada. Esta fase no se ha ejecutado.
