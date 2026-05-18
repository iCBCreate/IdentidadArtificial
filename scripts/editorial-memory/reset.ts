import { loadConfig } from './config.ts'
import { createLogger } from './logger.ts'
import { recreateCollection } from './qdrant.ts'

const logger = createLogger()
const config = loadConfig()

try {
  await recreateCollection({
    url: config.qdrantUrl,
    collection: config.qdrantCollection,
    dimensions: config.embeddingDimensions,
  })

  logger.info('complete', {
    collection: config.qdrantCollection,
    dimensions: config.embeddingDimensions,
  })
} catch (error) {
  logger.error('error', {
    message: error instanceof Error ? error.message : String(error),
  })
  process.exitCode = 1
}
