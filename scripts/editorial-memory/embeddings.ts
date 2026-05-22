import OpenAI from 'openai'
import type { EditorialChunk, EmbeddingBatchResult, Logger } from './types.ts'

type EmbeddingClient = {
  create: (request: {
    model: string
    input: string[]
    dimensions: number
  }) => Promise<{ data: Array<{ embedding: number[] }> }>
}

export type EmbeddingOptions = {
  apiKey: string
  model: string
  dimensions: number
  batchSize: number
  logger: Logger
  client?: EmbeddingClient
}

export async function embedChunks(
  chunks: EditorialChunk[],
  options: EmbeddingOptions,
): Promise<EmbeddingBatchResult[]> {
  const client: EmbeddingClient = options.client ?? new OpenAI({ apiKey: options.apiKey }).embeddings
  const results: EmbeddingBatchResult[] = []

  for (let start = 0; start < chunks.length; start += options.batchSize) {
    const batch = chunks.slice(start, start + options.batchSize)
    const response = await withRetry(
      () => client.create({
        model: options.model,
        input: batch.map(chunk => chunk.text),
        dimensions: options.dimensions,
      }),
      options.logger,
    )

    response.data.forEach((item, index) => {
      results.push({
        chunk: batch[index],
        embedding: item.embedding,
      })
    })

    options.logger.info('embedded', {
      batchStart: start,
      batchSize: batch.length,
      approximateTokens: batch.reduce((sum, chunk) => sum + estimateTokens(chunk.text), 0),
    })
  }

  return results
}

export async function embedText(
  text: string,
  options: Omit<EmbeddingOptions, 'batchSize'>,
): Promise<number[]> {
  const client: EmbeddingClient = options.client ?? new OpenAI({ apiKey: options.apiKey }).embeddings
  const response = await withRetry(
    () => client.create({
      model: options.model,
      input: [text],
      dimensions: options.dimensions,
    }),
    options.logger,
  )

  options.logger.info('embedded', {
    batchStart: 0,
    batchSize: 1,
    approximateTokens: estimateTokens(text),
  })

  return response.data[0].embedding
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

async function withRetry<T>(operation: () => Promise<T>, logger: Logger, maxAttempts = 3): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (!isRetryable(error) || attempt === maxAttempts) break

      const delayMs = 500 * 2 ** (attempt - 1)
      logger.error('embedding_retry', {
        attempt,
        delayMs,
        message: error instanceof Error ? error.message : String(error),
      })
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  throw lastError
}

function isRetryable(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const status = 'status' in error ? Number(error.status) : undefined
  return status === 429 || Boolean(status && status >= 500)
}
