import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import matter from 'gray-matter'
import { buildEditorialLastmod, getEligibleTags, isRetiredPath, isSitemapPath } from '../source/lib/content-policy.mjs'

const DIST = 'dist/client'
const SITE = 'https://identidadartificial.com'
const errors = []
const read = path => readFileSync(path, 'utf8')
function filesIn(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? filesIn(join(directory, entry.name)) : [join(directory, entry.name)])
}
function entries(collection) {
  return filesIn(`source/content/${collection}`).filter(file => /\.mdx?$/.test(file)).map(file => ({
    id: relative(`source/content/${collection}`, file).replace(/\.mdx?$/, ''),
    ...matter(read(file)),
  }))
}
const posts = entries('blog')
const tutorials = entries('tutoriales')
const eligibleTags = getEligibleTags(posts)
const editorialDates = buildEditorialLastmod(posts, tutorials)
const htmlByPath = new Map(filesIn(DIST).filter(file => file.endsWith('.html')).map(file => {
  const path = `/${relative(DIST, file).replace(/index\.html$/, '')}`
  return [path, read(file)]
}))
const robots = join(DIST, 'robots.txt')
if (!existsSync(robots)) errors.push('MISSING: robots.txt')
else if (/<html|<!doctype/i.test(read(robots))) errors.push('INVALID: robots.txt contains HTML')
if (!existsSync(join(DIST, 'sitemap-index.xml'))) errors.push('MISSING: sitemap-index.xml')
if (!read('public/_redirects').includes('/sitemap.xml')) errors.push('MISSING: /sitemap.xml redirect')

for (const [path, html] of htmlByPath) {
  if (isRetiredPath(path)) errors.push(`RETIRED STATIC PAGE: ${path} would bypass 410 middleware`)
  if (!['/404.html', '/410.html'].includes(path) && /<h1[^>]*>\s*(?:410 Gone|404 Not Found)/i.test(html)) errors.push(`SOFT ERROR: ${path}`)
  for (const match of html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) {
    let url
    try { url = new URL(match[1].replace(/&amp;/g, '&'), SITE) } catch { continue }
    if (url.origin !== SITE) continue
    if (isRetiredPath(url.pathname)) errors.push(`RETIRED LINK: ${path} → ${url.pathname}`)
    if (url.pathname.startsWith('/tag/')) {
      const tag = decodeURIComponent(url.pathname.split('/')[2] ?? '')
      if (!eligibleTags.has(tag) || !htmlByPath.has(`/tag/${tag}/`)) errors.push(`INVALID TAG LINK: ${path} → ${url.pathname}`)
    }
  }
}

// Verify the output, not just the Markdown configuration, for both collections.
for (const [collection, content] of [['blog', posts], ['tutoriales', tutorials]]) {
  for (const entry of content) {
    const path = `${collection === 'blog' ? '/' : '/tutoriales/'}${entry.id}/`
    if (isRetiredPath(path)) continue
    const html = htmlByPath.get(path)
    if (!html) { errors.push(`MISSING CONTENT: ${path}`); continue }
    const prose = entry.content.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '')
    const tableCount = [...prose.matchAll(/^\s*\|?\s*:?-{3,}:?\s*\|(?:\s*:?-{3,}:?\s*\|?)+\s*$/gm)].length
    if (tableCount && ((html.match(/<table\b/g) ?? []).length < tableCount || !/<thead\b/.test(html) || !/<td\b/.test(html))) errors.push(`UNCOMPILED MARKDOWN TABLE: ${path} expected ${tableCount}`)
    const published = new Date(entry.data.pubDate).toISOString()
    const modified = editorialDates.get(path).toISOString()
    for (const [field, expected] of [['datePublished', published], ['dateModified', modified]]) {
      for (const match of html.matchAll(new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, 'g'))) {
        if (new Date(match[1]).toISOString() !== expected) errors.push(`EDITORIAL DATE MISMATCH: ${path} ${field}`)
      }
    }
  }
}
const sitemapPaths = new Set()
for (const file of filesIn(DIST).filter(file => /sitemap-\d+\.xml$/.test(file))) {
  for (const match of read(file).matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const block = match[1]
    const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1]
    if (!loc) { errors.push(`SITEMAP: missing loc in ${file}`); continue }
    const path = new URL(loc).pathname
    sitemapPaths.add(path)
    if (!isSitemapPath(path)) errors.push(`EXCLUDED SITEMAP URL: ${path}`)
    if (!htmlByPath.has(path)) errors.push(`MISSING SITEMAP DESTINATION: ${path}`)
    const expected = editorialDates.get(path)?.toISOString()
    const actual = block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1]
    if (expected ? !actual || new Date(actual).toISOString() !== expected : !!actual) errors.push(`SITEMAP EDITORIAL DATE: ${path}`)
  }
}
if (!sitemapPaths.size) errors.push('EMPTY: sitemap URL set')
for (const path of editorialDates.keys()) {
  if (isSitemapPath(path) && !sitemapPaths.has(path)) errors.push(`MISSING SITEMAP URL: ${path}`)
}
if (errors.length) {
  console.error(`\nBuild validation failed:\n${[...new Set(errors)].map(error => `  • ${error}`).join('\n')}\n`)
  process.exit(1)
}
console.log(`✓ Build validation passed: ${htmlByPath.size} HTML pages, ${sitemapPaths.size} sitemap URLs, ${eligibleTags.size} eligible tags`)
