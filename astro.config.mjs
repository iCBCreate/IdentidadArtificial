import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'
import { readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'

const EXCLUDED_SITEMAP_PATHS = [
  '/pagina/',
  '/archivo/pagina/',
  '/metricas/',
  '/chatgpt-agent-revolucion-openai/',
  '/chatgpt-image-generation-gpt-image-1/',
  '/ia-entrenamiento-pokemon/',
  '/openai-lanza-gpt-oss-novedades-2025/',
  '/tag/comet/',
  '/tag/hugging-face/',
  '/ultimas-novedades-claude-mythos-anthropic/',
]

const BLOG_DIR = 'source/content/blog'
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
        quality: 50,
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

  addDirectoryFiles(lastmodByPath, BLOG_DIR, '.mdx', filename => `/${filename}/`)

  return lastmodByPath
}

function addDirectoryFiles(lastmodByPath, directory, extension, toPathname) {
  for (const file of readdirSync(directory)) {
    if (!file.endsWith(extension)) continue

    const filename = basename(file, extension)
    const pathname = toPathname(filename)
    const modified = statSync(join(directory, file)).mtime

    lastmodByPath.set(pathname, modified)
  }
}
