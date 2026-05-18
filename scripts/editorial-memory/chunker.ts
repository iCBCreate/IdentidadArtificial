import { hashText } from './hash.ts'
import type { EditorialChunk, EditorialDocument } from './types.ts'

const TARGET_WORDS = 650
const MAX_WORDS = 850
const OVERLAP_WORDS = 80

type Section = {
  title: string
  paragraphs: string[]
}

export function chunkDocument(document: EditorialDocument): EditorialChunk[] {
  const sections = splitIntoSections(document.cleanedBody)
  const chunks: EditorialChunk[] = []

  for (const section of sections) {
    const sectionChunks = chunkSection(section.paragraphs)

    for (const text of sectionChunks) {
      const contentHash = hashText(text)
      const chunkIndex = chunks.length
      chunks.push({
        id: hashText(`${document.sourcePath}:${section.title}:${chunkIndex}:${contentHash}`).slice(0, 32),
        sourcePath: document.sourcePath,
        articleSlug: document.slug,
        title: document.title,
        section: section.title,
        chunkIndex,
        text,
        wordCount: countWords(text),
        contentHash,
      })
    }
  }

  return chunks
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function splitIntoSections(markdown: string): Section[] {
  const lines = markdown.split('\n')
  const sections: Section[] = []
  let current: Section = { title: 'Introduccion', paragraphs: [] }
  let buffer: string[] = []

  for (const line of lines) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line)
    if (heading) {
      pushParagraph(current, buffer)
      buffer = []
      if (current.paragraphs.length > 0) sections.push(current)
      current = { title: heading[2].trim(), paragraphs: [heading[2].trim()] }
      continue
    }

    if (line.trim() === '') {
      pushParagraph(current, buffer)
      buffer = []
      continue
    }

    buffer.push(line.trim())
  }

  pushParagraph(current, buffer)
  if (current.paragraphs.length > 0) sections.push(current)

  return sections
}

function pushParagraph(section: Section, buffer: string[]) {
  const text = buffer.join(' ').trim()
  if (text) section.paragraphs.push(text)
}

function chunkSection(paragraphs: string[]): string[] {
  const chunks: string[] = []
  let current: string[] = []
  let currentWords = 0

  for (const paragraph of paragraphs) {
    const paragraphWords = countWords(paragraph)
    if (currentWords > 0 && currentWords + paragraphWords > MAX_WORDS) {
      chunks.push(current.join('\n\n'))
      current = overlapParagraphs(current)
      currentWords = countWords(current.join(' '))
    }

    current.push(paragraph)
    currentWords += paragraphWords

    if (currentWords >= TARGET_WORDS) {
      chunks.push(current.join('\n\n'))
      current = overlapParagraphs(current)
      currentWords = countWords(current.join(' '))
    }
  }

  if (currentWords > 0) chunks.push(current.join('\n\n'))
  return [...new Set(chunks.map(chunk => chunk.trim()).filter(Boolean))]
}

function overlapParagraphs(paragraphs: string[]): string[] {
  const overlap: string[] = []
  let words = 0

  for (const paragraph of [...paragraphs].reverse()) {
    if (words >= OVERLAP_WORDS) break
    overlap.unshift(paragraph)
    words += countWords(paragraph)
  }

  return overlap
}
