import { loadConfig, requireOpenAiApiKey } from './config.ts'
import { embedText } from './embeddings.ts'
import { createLogger } from './logger.ts'
import { searchEmbeddings } from './qdrant.ts'

const logger = createLogger()
const config = loadConfig()
const query = process.argv.slice(2).join(' ').trim()

if (!query) {
  logger.error('error', {
    message: 'Usage: npm run memory:search -- "consulta editorial"',
  })
  process.exitCode = 1
} else {
  try {
    const apiKey = requireOpenAiApiKey(config)
    const vector = await embedText(query, {
      apiKey,
      model: config.embeddingModel,
      dimensions: config.embeddingDimensions,
      logger,
    })
    const results = await searchEmbeddings({
      url: config.qdrantUrl,
      collection: config.qdrantCollection,
    }, vector)

    logger.info('complete', {
      query,
      collection: config.qdrantCollection,
      results: results.map(result => ({
        id: result.id,
        score: result.score,
        sourcePath: result.payload?.sourcePath,
        articleSlug: result.payload?.articleSlug,
        title: result.payload?.title,
        section: result.payload?.section,
        chunkIndex: result.payload?.chunkIndex,
        text: truncate(String(result.payload?.text ?? ''), 500),
      })),
    })
  } catch (error) {
    logger.error('error', {
      message: error instanceof Error ? error.message : String(error),
    })
    process.exitCode = 1
  }
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length).trim()}...`
}
