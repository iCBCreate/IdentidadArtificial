import { readdir, readFile } from 'node:fs/promises'
import { basename, join, relative } from 'node:path'
import matter from 'gray-matter'
import { cleanMarkdown } from './cleaner.ts'
import type { EditorialDocument } from './types.ts'

export async function readEditorialDocuments(articlesDir: string): Promise<EditorialDocument[]> {
  const files = await findMarkdownFiles(articlesDir)
  const documents: EditorialDocument[] = []

  for (const filePath of files) {
    const raw = await readFile(filePath, 'utf8')
    const parsed = matter(raw)
    const slug = String(parsed.data.slug ?? basename(filePath).replace(/\.mdx?$/, ''))
    const title = String(parsed.data.title ?? slug)

    documents.push({
      sourcePath: relative(process.cwd(), filePath),
      slug,
      title,
      frontmatter: parsed.data,
      rawBody: parsed.content,
      cleanedBody: cleanMarkdown(parsed.content),
    })
  }

  return documents
}

async function findMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(error => {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return []
    throw error
  })

  const files = await Promise.all(entries.map(async entry => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return findMarkdownFiles(path)
    if (entry.isFile() && /\.mdx?$/.test(entry.name)) return [path]
    return []
  }))

  return files.flat().sort()
}
