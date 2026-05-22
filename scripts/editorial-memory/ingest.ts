import { chunkDocument } from './chunker.ts'
import { loadConfig, requireOpenAiApiKey } from './config.ts'
import { embedChunks } from './embeddings.ts'
import { createLogger } from './logger.ts'
import { ensureCollection, upsertEmbeddings } from './qdrant.ts'
import { readEditorialDocuments } from './reader.ts'

async function main() {
  const logger = createLogger()
  const config = loadConfig()
  const startedAt = Date.now()

  logger.info('start', {
    articlesDir: config.articlesDir,
    collection: config.qdrantCollection,
    qdrantUrl: config.qdrantUrl,
    model: config.embeddingModel,
  })

  try {
    const apiKey = requireOpenAiApiKey(config)
    const documents = await readEditorialDocuments(config.articlesDir)
    const chunks = documents.flatMap(document => {
      logger.info('file_read', {
        sourcePath: document.sourcePath,
        articleSlug: document.slug,
        title: document.title,
      })

      const documentChunks = chunkDocument(document)
      logger.info('chunked', {
        sourcePath: document.sourcePath,
        articleSlug: document.slug,
        chunks: documentChunks.length,
      })
      return documentChunks
    })

    await ensureCollection({
      url: config.qdrantUrl,
      collection: config.qdrantCollection,
      dimensions: config.embeddingDimensions,
    })

    const embedded = await embedChunks(chunks, {
      apiKey,
      model: config.embeddingModel,
      dimensions: config.embeddingDimensions,
      batchSize: config.embeddingBatchSize,
      logger,
    })

    if (embedded.length > 0) {
      await upsertEmbeddings({
        url: config.qdrantUrl,
        collection: config.qdrantCollection,
        dimensions: config.embeddingDimensions,
      }, embedded)
    }

    logger.info('upserted', {
      collection: config.qdrantCollection,
      points: embedded.length,
    })
    logger.info('complete', {
      files: documents.length,
      chunks: chunks.length,
      durationMs: Date.now() - startedAt,
    })
  } catch (error) {
    logger.error('error', {
      message: error instanceof Error ? error.message : String(error),
    })
    process.exitCode = 1
  }
}

await main()
