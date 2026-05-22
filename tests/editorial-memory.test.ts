import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { cleanMarkdown } from '../scripts/editorial-memory/cleaner.ts'
import { chunkDocument } from '../scripts/editorial-memory/chunker.ts'
import { loadConfig } from '../scripts/editorial-memory/config.ts'
import { embedChunks, embedText } from '../scripts/editorial-memory/embeddings.ts'
import { ensureCollection, recreateCollection, searchEmbeddings, toPayload, upsertEmbeddings } from '../scripts/editorial-memory/qdrant.ts'
import { readEditorialDocuments } from '../scripts/editorial-memory/reader.ts'
import type { EditorialChunk, Logger } from '../scripts/editorial-memory/types.ts'

const logger: Logger = {
  info() {},
  error() {},
}

test('cleanMarkdown removes MDX noise and preserves readable headings and prose', () => {
  const cleaned = cleanMarkdown(`---
title: Demo
---
import Demo from './Demo.astro'

# RAG editorial

Texto útil con **énfasis**.

| A | B |
| - | - |
| 1 | 2 |

\`\`\`ts
console.log('no')
\`\`\`

<Demo />
`)

  assert.match(cleaned, /# RAG editorial/)
  assert.match(cleaned, /Texto útil/)
  assert.doesNotMatch(cleaned, /import Demo/)
  assert.doesNotMatch(cleaned, /console\.log/)
  assert.doesNotMatch(cleaned, /\| A \| B \|/)
  assert.doesNotMatch(cleaned, /<Demo/)
})

test('chunkDocument groups content by semantic headings without empty chunks', () => {
  const paragraphs = Array.from({ length: 18 }, (_, index) => {
    return `Parrafo ${index} sobre memoria editorial, embeddings, recuperacion semantica y gobierno de conocimiento para Identidad Artificial.`
  }).join('\n\n')

  const chunks = chunkDocument({
    sourcePath: 'knowledge-base/articles/memoria.md',
    slug: 'memoria',
    title: 'Memoria editorial',
    frontmatter: {},
    rawBody: '',
    cleanedBody: `# Contexto\n\n${paragraphs}\n\n## Uso editorial\n\n${paragraphs}`,
  })

  assert.ok(chunks.length >= 2)
  assert.ok(chunks.every(chunk => chunk.text.trim().length > 0))
  assert.ok(chunks.some(chunk => chunk.section === 'Contexto'))
  assert.ok(chunks.some(chunk => chunk.section === 'Uso editorial'))
  assert.ok(chunks.every(chunk => chunk.wordCount <= 900))
})

test('readEditorialDocuments parses frontmatter and slug from markdown files', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'editorial-memory-'))

  try {
    await writeFile(join(dir, 'rag-editorial.md'), `---
title: RAG editorial
slug: rag-personalizado
tema: memoria
---

# Intro

Contenido limpio.
`, 'utf8')

    const documents = await readEditorialDocuments(dir)

    assert.equal(documents.length, 1)
    assert.equal(documents[0].slug, 'rag-personalizado')
    assert.equal(documents[0].title, 'RAG editorial')
    assert.equal(documents[0].frontmatter.tema, 'memoria')
    assert.match(documents[0].cleanedBody, /Contenido limpio/)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('embedChunks uses injected client and returns embeddings without external calls', async () => {
  const chunk = sampleChunk()
  const result = await embedChunks([chunk], {
    apiKey: 'test-key',
    model: 'text-embedding-3-small',
    dimensions: 3,
    batchSize: 10,
    logger,
    client: {
      async create(request) {
        assert.equal(request.model, 'text-embedding-3-small')
        assert.deepEqual(request.input, [chunk.text])
        assert.equal(request.dimensions, 3)
        return { data: [{ embedding: [0.1, 0.2, 0.3], index: 0, object: 'embedding' }], object: 'list', model: request.model, usage: { prompt_tokens: 1, total_tokens: 1 } }
      },
    },
  })

  assert.deepEqual(result, [{ chunk, embedding: [0.1, 0.2, 0.3] }])
})

test('embedText embeds a search query with injected client', async () => {
  const embedding = await embedText('memoria editorial rag', {
    apiKey: 'test-key',
    model: 'text-embedding-3-small',
    dimensions: 3,
    logger,
    client: {
      async create(request) {
        assert.deepEqual(request.input, ['memoria editorial rag'])
        return { data: [{ embedding: [0.4, 0.5, 0.6] }] }
      },
    },
  })

  assert.deepEqual(embedding, [0.4, 0.5, 0.6])
})

test('qdrant helpers create collections and upsert expected payload with fake client', async () => {
  const calls: string[] = []
  const fakeClient = {
    async getCollections() {
      calls.push('getCollections')
      return { collections: [] }
    },
    async createCollection(collection: string, config: unknown) {
      calls.push(`create:${collection}:${JSON.stringify(config)}`)
      return true
    },
    async deleteCollection(collection: string) {
      calls.push(`delete:${collection}`)
      return true
    },
    async upsert(collection: string, payload: unknown) {
      calls.push(`upsert:${collection}:${JSON.stringify(payload)}`)
      return { operation_id: 1, status: 'completed' }
    },
    async search(collection: string, payload: unknown) {
      calls.push(`search:${collection}:${JSON.stringify(payload)}`)
      return [{ id: 'chunk-1', score: 0.9, payload: toPayload(sampleChunk()) }]
    },
  } as never

  await ensureCollection({ url: 'http://localhost:6333', collection: 'editorial_memory', dimensions: 1536, client: fakeClient })
  await recreateCollection({ url: 'http://localhost:6333', collection: 'editorial_memory', dimensions: 1536, client: fakeClient })
  await upsertEmbeddings({ url: 'http://localhost:6333', collection: 'editorial_memory', dimensions: 1536, client: fakeClient }, [
    { chunk: sampleChunk(), embedding: [0.1, 0.2, 0.3] },
  ])
  const results = await searchEmbeddings({ url: 'http://localhost:6333', collection: 'editorial_memory', client: fakeClient }, [0.1, 0.2, 0.3], 1)

  assert.ok(calls.some(call => call.includes('"distance":"Cosine"')))
  assert.ok(calls.some(call => call.startsWith('upsert:editorial_memory')))
  assert.ok(calls.some(call => call.includes('"with_payload":true')))
  assert.equal(results[0].score, 0.9)
  assert.equal(toPayload(sampleChunk()).articleSlug, 'memoria')
})

test('loadConfig exposes memory preview and ingest defaults without secrets', () => {
  const config = loadConfig({})

  assert.match(config.articlesDir, /knowledge-base\/articles$/)
  assert.equal(config.qdrantUrl, 'http://localhost:6333')
  assert.equal(config.qdrantCollection, 'editorial_memory')
  assert.equal(config.embeddingModel, 'text-embedding-3-small')
  assert.equal(config.embeddingDimensions, 1536)
  assert.equal(config.embeddingBatchSize, 64)
  assert.equal(config.openAiApiKey, undefined)
})

test('loadConfig accepts doctor and ingest overrides from env', () => {
  const config = loadConfig({
    OPENAI_API_KEY: 'sk-test',
    QDRANT_URL: 'http://127.0.0.1:6333',
    QDRANT_COLLECTION: 'test_memory',
    OPENAI_EMBEDDING_MODEL: 'text-embedding-3-large',
    EMBEDDING_DIMENSIONS: '3072',
    EMBEDDING_BATCH_SIZE: '12',
    MEMORY_ARTICLES_DIR: 'tmp/articles',
  })

  assert.equal(config.openAiApiKey, 'sk-test')
  assert.equal(config.qdrantUrl, 'http://127.0.0.1:6333')
  assert.equal(config.qdrantCollection, 'test_memory')
  assert.equal(config.embeddingModel, 'text-embedding-3-large')
  assert.equal(config.embeddingDimensions, 3072)
  assert.equal(config.embeddingBatchSize, 12)
  assert.match(config.articlesDir, /tmp\/articles$/)
})

function sampleChunk(): EditorialChunk {
  return {
    id: 'chunk-1',
    sourcePath: 'knowledge-base/articles/memoria.md',
    articleSlug: 'memoria',
    title: 'Memoria editorial',
    section: 'Contexto',
    chunkIndex: 0,
    text: 'Texto de prueba para embeddings.',
    wordCount: 5,
    contentHash: 'abc123',
  }
}
