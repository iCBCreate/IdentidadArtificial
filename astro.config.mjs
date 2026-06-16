import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'

const EXCLUDED_SITEMAP_PATHS = [
  '/pagina/',
  '/archivo/pagina/',
  '/metricas/',
  '/aviso-legal/',
  '/politica-de-privacidad/',
  '/chatgpt-agent-revolucion-openai/',
  '/chatgpt-image-generation-gpt-image-1/',
  '/ia-entrenamiento-pokemon/',
  '/openai-lanza-gpt-oss-novedades-2025/',
  '/tag/comet/',
  '/tag/hugging-face/',
  '/ultimas-novedades-claude-mythos-anthropic/',
]

const BLOG_DIR = 'source/content/blog'
const TUTORIALES_DIR = 'source/content/tutoriales'
const PAGE_DIR = 'source/pages'

const sitemapLastmodByPath = buildSitemapLastmodByPath()

export default defineConfig({
  site: 'https://identidadartificial.com',
  srcDir: './source',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !EXCLUDED_SITEMAP_PATHS.some(path => page.includes(path)),
      serialize(item) {
        const pathname = new URL(item.url).pathname
        const lastmod = sitemapLastmodByPath.get(pathname)

        if (lastmod) {
          item.lastmod = lastmod.toISOString()
        }

        return item
      },
    }),
  ],
  adapter: cloudflare({ imageService: 'compile' }),
  image: {
    format: ['avif', 'webp'],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        quality: 30,
      }
    }
  },
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()]
  }
})

function buildSitemapLastmodByPath() {
  const lastmodByPath = new Map()

  addDirectoryFiles(lastmodByPath, PAGE_DIR, '.astro', filename => {
    const slug = filename === 'index' ? '' : filename
    return `/${slug ? `${slug}/` : ''}`
  })

  addSubdirectoryIndexFiles(lastmodByPath, PAGE_DIR, '.astro')

  addDirectoryFiles(lastmodByPath, BLOG_DIR, '.mdx', filename => `/${filename}/`)

  addDirectoryFiles(lastmodByPath, TUTORIALES_DIR, '.mdx', filename => `/tutoriales/${filename}/`)

  // Páginas .astro dentro de subdirectorios de pages (p. ej. /laboratorio/*)
  addNestedPageFiles(lastmodByPath, PAGE_DIR)

  addCategoryLastmod(lastmodByPath, BLOG_DIR)

  return lastmodByPath
}

function addNestedPageFiles(lastmodByPath, pageDir) {
  if (!existsSync(pageDir)) return

  for (const entry of readdirSync(pageDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const subDir = join(pageDir, entry.name)

    for (const file of readdirSync(subDir)) {
      if (!file.endsWith('.astro') || file === 'index.astro') continue
      const filename = basename(file, '.astro')
      lastmodByPath.set(`/${entry.name}/${filename}/`, statSync(join(subDir, file)).mtime)
    }
  }
}

function addSubdirectoryIndexFiles(lastmodByPath, directory, extension) {
  if (!existsSync(directory)) return

  for (const entry of readdirSync(directory)) {
    const subDir = join(directory, entry)
    const indexFile = join(subDir, `index${extension}`)
    if (existsSync(indexFile)) {
      lastmodByPath.set(`/${entry}/`, statSync(indexFile).mtime)
    }
  }
}

function addDirectoryFiles(lastmodByPath, directory, extension, toPathname) {
  if (!existsSync(directory)) return

  for (const file of readdirSync(directory)) {
    if (!file.endsWith(extension)) continue

    const filename = basename(file, extension)
    const pathname = toPathname(filename)
    const modified = statSync(join(directory, file)).mtime

    lastmodByPath.set(pathname, modified)
  }
}

function addCategoryLastmod(lastmodByPath, blogDir) {
  if (!existsSync(blogDir)) return

  const categoryMtime = new Map()

  for (const file of readdirSync(blogDir)) {
    if (!file.endsWith('.mdx')) continue
    const filePath = join(blogDir, file)
    const mtime = statSync(filePath).mtime

    const content = readFileSync(filePath, 'utf8')
    const match = content.match(/^category:\s*['"]?([^'"\n]+)['"]?/m)
    if (!match) continue

    const category = match[1].trim()
    const slug = category
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Mn}/gu, '')
      .replace(/ /g, '-')
    const pathname = `/categoria/${slug}/`

    const existing = categoryMtime.get(pathname)
    if (!existing || mtime > existing) {
      categoryMtime.set(pathname, mtime)
    }
  }

  for (const [pathname, mtime] of categoryMtime) {
    lastmodByPath.set(pathname, mtime)
  }
}
