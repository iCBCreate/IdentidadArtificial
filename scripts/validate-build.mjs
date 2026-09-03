import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist/client'
const BLOG_DIR = 'source/content/blog'
const SITE_URL = 'https://identidadartificial.com'
const errors = []

// robots.txt existe y es texto plano
const robotsPath = join(DIST, 'robots.txt')
if (!existsSync(robotsPath)) {
  errors.push('MISSING: dist/client/robots.txt')
} else {
  const content = readFileSync(robotsPath, 'utf8')
  if (content.includes('<html') || content.includes('<!DOCTYPE')) {
    errors.push('INVALID: dist/client/robots.txt contains HTML')
  }
}

// sitemap-index.xml existe
if (!existsSync(join(DIST, 'sitemap-index.xml'))) {
  errors.push('MISSING: dist/client/sitemap-index.xml')
}

// Cada post que tiene una ruta generada debe aparecer en algún sitemap.
const sitemapUrls = readSitemapUrls()
for (const file of readdirSync(BLOG_DIR)) {
  if (!file.endsWith('.mdx')) continue

  const slug = file.replace(/\.mdx$/, '')
  const generatedRoute = join(DIST, slug, 'index.html')
  const expectedUrl = `${SITE_URL}/${slug}/`
  if (existsSync(generatedRoute) && !sitemapUrls.has(expectedUrl)) {
    errors.push(`MISSING SITEMAP URL: ${expectedUrl}`)
  }
}

// /sitemap.xml cubierto por redirect
const redirects = readFileSync('public/_redirects', 'utf8')
if (!redirects.includes('/sitemap.xml')) {
  errors.push('MISSING: /sitemap.xml redirect not found in public/_redirects')
}

// Rutas retiradas no deben existir como HTML estático en dist/client
// (si existen, el middleware queda bypaseado y sirven 200 en lugar de 410)
const RETIRED_SLUGS = [
  'chatgpt-agent-revolucion-openai',
  'chatgpt-image-generation-gpt-image-1',
  'ia-entrenamiento-pokemon',
  'openai-lanza-gpt-oss-novedades-2025',
  'ultimas-novedades-claude-mythos-anthropic',
  'tag/comet',
  'tag/hugging-face',
]

for (const slug of RETIRED_SLUGS) {
  const htmlPath = join(DIST, slug, 'index.html')
  if (existsSync(htmlPath)) {
    errors.push(`STALE 410 PAGE: ${htmlPath} exists — middleware will be bypassed`)
  }
}

if (errors.length > 0) {
  console.error('\n❌ Build validation failed:\n')
  for (const e of errors) console.error(`  • ${e}`)
  console.error('')
  process.exit(1)
}

console.log('✓ Build validation passed')

function readSitemapUrls() {
  const urls = new Set()
  const sitemapIndex = join(DIST, 'sitemap-index.xml')
  if (!existsSync(sitemapIndex)) return urls

  const indexXml = readFileSync(sitemapIndex, 'utf8')
  const sitemapFiles = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(match => match[1].trim().split('/').pop())
    .filter(Boolean)

  for (const sitemapFile of sitemapFiles) {
    const path = join(DIST, sitemapFile)
    if (!existsSync(path)) continue
    const xml = readFileSync(path, 'utf8')
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      urls.add(match[1].trim())
    }
  }

  return urls
}
