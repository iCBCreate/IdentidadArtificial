# Memoria editorial MVP

Este MVP ingiere artículos Markdown desde `knowledge-base/articles`, limpia el contenido, lo divide en chunks semánticos, genera embeddings con OpenAI y guarda los vectores en Qdrant local.

La memoria editorial queda fuera del build de Astro. Se ejecuta de forma explícita con scripts `npm run memory:*`.

## Requisitos

- Node.js `>=22.12.0`
- Docker y Docker Compose
- `OPENAI_API_KEY` con acceso a embeddings

## Configuración

Copia las variables de `.env.example` a tu entorno local:

```bash
OPENAI_API_KEY=sk-...
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=editorial_memory
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
EMBEDDING_BATCH_SIZE=64
MEMORY_ARTICLES_DIR=knowledge-base/articles
```

El modelo por defecto es `text-embedding-3-small` con 1536 dimensiones.

## Qdrant local

Arranca Qdrant:

```bash
docker compose up -d qdrant
```

Dashboard:

```text
http://localhost:6333/dashboard
```

La colección por defecto es `editorial_memory` y usa distancia `Cosine`.

## Flujo de ingesta

1. Añade archivos `.md` o `.mdx` en `knowledge-base/articles`.
2. Previsualiza limpieza y chunking sin gastar tokens:

```bash
npm run memory:preview
```

3. Revisa entorno, artículos y Qdrant:

```bash
npm run memory:doctor
```

4. Reinicia la colección si quieres empezar limpio:

```bash
npm run memory:reset
```

5. Ejecuta la ingesta:

```bash
npm run memory:ingest
```

6. Comprueba la colección:

```bash
npm run memory:check
```

7. Busca en la memoria:

```bash
npm run memory:search -- "qué sabemos sobre RAG y embeddings"
```

## Arquitectura

- `scripts/editorial-memory/config.ts`: configuración desde variables de entorno.
- `reader.ts`: descubre Markdown, parsea frontmatter y normaliza documentos.
- `cleaner.ts`: elimina ruido MDX, HTML, tablas simples, frontmatter y bloques de código.
- `chunker.ts`: divide por encabezados y párrafos con objetivo de 500-800 palabras.
- `embeddings.ts`: genera embeddings en batches con reintento básico para 429/5xx.
- `qdrant.ts`: crea colección, recrea colección y sube puntos.
- `logger.ts`: emite logs JSONL por stdout.
- `ingest.ts`: orquesta la tubería completa.
- `preview.ts`: muestra archivos, chunks y muestras de texto sin OpenAI ni Qdrant.
- `doctor.ts`: valida API key, artículos, configuración y conexión Qdrant.
- `reset.ts`: recrea la colección.
- `check.ts`: consulta estado y conteo básico de Qdrant.
- `search.ts`: genera embedding de consulta y devuelve chunks similares.

## Payload en Qdrant

Cada punto incluye:

```json
{
  "sourcePath": "knowledge-base/articles/ejemplo.md",
  "articleSlug": "ejemplo",
  "title": "Titulo",
  "section": "Seccion",
  "chunkIndex": 0,
  "text": "Contenido del chunk",
  "wordCount": 120,
  "contentHash": "sha256",
  "ingestedAt": "2026-05-18T18:00:00.000Z"
}
```

El ID de cada chunk se deriva de `sourcePath + section + chunkIndex + contentHash`, lo que permite reingestas idempotentes cuando el contenido no cambia.

## Logs

Los scripts emiten eventos JSONL por stdout:

- `start`
- `file_read`
- `chunked`
- `embedded`
- `upserted`
- `complete`
- `error`
- `embedding_retry`

Ejemplo:

```json
{"level":"info","event":"chunked","timestamp":"2026-05-18T18:00:00.000Z","sourcePath":"knowledge-base/articles/rag.md","articleSlug":"rag","chunks":3}
```

## Limitaciones del MVP

- No hay búsqueda RAG ni interfaz web.
- No hay Qdrant Cloud ni autenticación.
- No hay deduplicación externa: la idempotencia depende del ID estable por chunk.
- La estimación de tokens es aproximada.
