import { chunkDocument } from './chunker.ts'
import { loadConfig } from './config.ts'
import { createLogger } from './logger.ts'
import { readEditorialDocuments } from './reader.ts'

const TEXT_PREVIEW_LENGTH = 260

const logger = createLogger()
const config = loadConfig()

try {
  const documents = await readEditorialDocuments(config.articlesDir)
  const articles = documents.map(document => {
    const chunks = chunkDocument(document)

    return {
      sourcePath: document.sourcePath,
      articleSlug: document.slug,
      title: document.title,
      chunks: chunks.length,
      words: chunks.reduce((sum, chunk) => sum + chunk.wordCount, 0),
      preview: chunks.slice(0, 3).map(chunk => ({
        chunkIndex: chunk.chunkIndex,
        section: chunk.section,
        wordCount: chunk.wordCount,
        contentHash: chunk.contentHash,
        text: truncate(chunk.text, TEXT_PREVIEW_LENGTH),
      })),
    }
  })

  logger.info('complete', {
    articlesDir: config.articlesDir,
    files: articles.length,
    chunks: articles.reduce((sum, article) => sum + article.chunks, 0),
    words: articles.reduce((sum, article) => sum + article.words, 0),
    articles,
  })
} catch (error) {
  logger.error('error', {
    message: error instanceof Error ? error.message : String(error),
  })
  process.exitCode = 1
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length).trim()}...`
}
