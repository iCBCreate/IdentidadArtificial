import { loadConfig } from './config.ts'
import { createLogger } from './logger.ts'
import { createQdrantClient } from './qdrant.ts'
import { readEditorialDocuments } from './reader.ts'

type DoctorCheck = {
  name: string
  ok: boolean
  detail: string
}

const logger = createLogger()
const config = loadConfig()

const checks: DoctorCheck[] = []

checks.push({
  name: 'openai_api_key',
  ok: Boolean(config.openAiApiKey),
  detail: config.openAiApiKey ? 'OPENAI_API_KEY configured' : 'OPENAI_API_KEY missing',
})

checks.push({
  name: 'embedding_config',
  ok: config.embeddingDimensions > 0 && config.embeddingBatchSize > 0,
  detail: `${config.embeddingModel}, dimensions=${config.embeddingDimensions}, batchSize=${config.embeddingBatchSize}`,
})

try {
  const documents = await readEditorialDocuments(config.articlesDir)
  checks.push({
    name: 'articles',
    ok: documents.length > 0,
    detail: `${documents.length} markdown files found in ${config.articlesDir}`,
  })
} catch (error) {
  checks.push({
    name: 'articles',
    ok: false,
    detail: error instanceof Error ? error.message : String(error),
  })
}

try {
  const client = createQdrantClient(config.qdrantUrl)
  const collections = await client.getCollections()
  const collectionExists = collections.collections.some(item => item.name === config.qdrantCollection)

  checks.push({
    name: 'qdrant_connection',
    ok: true,
    detail: `reachable at ${config.qdrantUrl}`,
  })
  checks.push({
    name: 'qdrant_collection',
    ok: collectionExists,
    detail: collectionExists
      ? `${config.qdrantCollection} exists`
      : `${config.qdrantCollection} missing; run npm run memory:reset`,
  })
} catch (error) {
  checks.push({
    name: 'qdrant_connection',
    ok: false,
    detail: error instanceof Error ? error.message : String(error),
  })
}

const ok = checks.every(check => check.ok)

logger.info(ok ? 'complete' : 'error', {
  ok,
  checks,
})

if (!ok) process.exitCode = 1
