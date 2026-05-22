import { resolve } from 'node:path'

export type EditorialMemoryConfig = {
  articlesDir: string
  qdrantUrl: string
  qdrantCollection: string
  openAiApiKey?: string
  embeddingModel: string
  embeddingDimensions: number
  embeddingBatchSize: number
}

export function loadConfig(env = process.env): EditorialMemoryConfig {
  return {
    articlesDir: resolve(env.MEMORY_ARTICLES_DIR ?? 'knowledge-base/articles'),
    qdrantUrl: env.QDRANT_URL ?? 'http://localhost:6333',
    qdrantCollection: env.QDRANT_COLLECTION ?? 'editorial_memory',
    openAiApiKey: env.OPENAI_API_KEY,
    embeddingModel: env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
    embeddingDimensions: readPositiveInt(env.EMBEDDING_DIMENSIONS, 1536),
    embeddingBatchSize: readPositiveInt(env.EMBEDDING_BATCH_SIZE, 64),
  }
}

export function requireOpenAiApiKey(config: EditorialMemoryConfig): string {
  if (!config.openAiApiKey) {
    throw new Error('OPENAI_API_KEY is required to generate editorial memory embeddings')
  }

  return config.openAiApiKey
}

function readPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}
