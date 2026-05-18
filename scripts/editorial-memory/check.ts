import { loadConfig } from './config.ts'
import { createLogger } from './logger.ts'
import { getCollectionInfo } from './qdrant.ts'

const logger = createLogger()
const config = loadConfig()

try {
  const info = await getCollectionInfo({
    url: config.qdrantUrl,
    collection: config.qdrantCollection,
  })

  logger.info('complete', {
    collection: config.qdrantCollection,
    status: info.status,
    pointsCount: info.points_count,
    vectorsCount: info.vectors_count,
  })
} catch (error) {
  logger.error('error', {
    message: error instanceof Error ? error.message : String(error),
  })
  process.exitCode = 1
}
