import { QdrantClient } from '@qdrant/js-client-rest'
import type { EditorialChunk, EmbeddingBatchResult } from './types.ts'

export type QdrantOptions = {
  url: string
  collection: string
  dimensions: number
  client?: QdrantClient
}

type CollectionInfo = {
  points_count?: number
  vectors_count?: number
  status?: string
}

type SearchResult = {
  id: string | number
  score: number
  payload?: Record<string, unknown> | null
}

export function createQdrantClient(url: string): QdrantClient {
  return new QdrantClient({ url, checkCompatibility: false })
}

export async function ensureCollection(options: QdrantOptions): Promise<void> {
  const client = options.client ?? createQdrantClient(options.url)
  const collections = await client.getCollections()
  const exists = collections.collections.some(item => item.name === options.collection)

  if (!exists) {
    await client.createCollection(options.collection, {
      vectors: {
        size: options.dimensions,
        distance: 'Cosine',
      },
    })
  }
}

export async function recreateCollection(options: QdrantOptions): Promise<void> {
  const client = options.client ?? createQdrantClient(options.url)
  const collections = await client.getCollections()
  const exists = collections.collections.some(item => item.name === options.collection)

  if (exists) await client.deleteCollection(options.collection)

  await client.createCollection(options.collection, {
    vectors: {
      size: options.dimensions,
      distance: 'Cosine',
    },
  })
}

export async function upsertEmbeddings(options: QdrantOptions, items: EmbeddingBatchResult[]): Promise<void> {
  const client = options.client ?? createQdrantClient(options.url)

  await client.upsert(options.collection, {
    wait: true,
    points: items.map(item => ({
      id: item.chunk.id,
      vector: item.embedding,
      payload: toPayload(item.chunk),
    })),
  })
}

export async function getCollectionInfo(options: Omit<QdrantOptions, 'dimensions'>): Promise<CollectionInfo> {
  const client = options.client ?? createQdrantClient(options.url)
  return client.getCollection(options.collection) as Promise<CollectionInfo>
}

export async function searchEmbeddings(
  options: Omit<QdrantOptions, 'dimensions'>,
  vector: number[],
  limit = 5,
): Promise<SearchResult[]> {
  const client = options.client ?? createQdrantClient(options.url)

  return client.search(options.collection, {
    vector,
    limit,
    with_payload: true,
    with_vector: false,
  }) as Promise<SearchResult[]>
}

export function toPayload(chunk: EditorialChunk) {
  return {
    sourcePath: chunk.sourcePath,
    articleSlug: chunk.articleSlug,
    title: chunk.title,
    section: chunk.section,
    chunkIndex: chunk.chunkIndex,
    text: chunk.text,
    wordCount: chunk.wordCount,
    contentHash: chunk.contentHash,
    ingestedAt: new Date().toISOString(),
  }
}
