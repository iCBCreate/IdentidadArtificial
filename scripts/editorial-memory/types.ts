export type EditorialDocument = {
  sourcePath: string
  slug: string
  title: string
  frontmatter: Record<string, unknown>
  rawBody: string
  cleanedBody: string
}

export type EditorialChunk = {
  id: string
  sourcePath: string
  articleSlug: string
  title: string
  section: string
  chunkIndex: number
  text: string
  wordCount: number
  contentHash: string
}

export type EmbeddingBatchResult = {
  chunk: EditorialChunk
  embedding: number[]
}

export type Logger = {
  info: (event: string, payload?: Record<string, unknown>) => void
  error: (event: string, payload?: Record<string, unknown>) => void
}
