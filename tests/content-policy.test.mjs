import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEditorialLastmod, getEligibleTags, getModifiedDate, isRetiredPath, isSitemapPath } from '../source/lib/content-policy.mjs'
const post = (id, tags, extra = {}) => ({ id, data: { tags, pubDate: '2026-05-01', category: 'Ética', ...extra } })

test('tag eligibility counts distinct posts and respects retired paths; Gemini is recovered', () => {
  const posts = [post('a', ['gemini', 'solo', 'solo', 'claude-code']), post('a', ['solo']), post('b', ['gemini', 'claude-code'])]
  assert.deepEqual([...getEligibleTags(posts)], ['gemini'])
  assert.equal(isRetiredPath('/tag/gemini/'), false)
  assert.equal(isRetiredPath('/tag/claude-code'), true)
  assert.equal(isRetiredPath('/chatgpt-agent-revolucion-openai/feed/'), true)
  assert.equal(isRetiredPath('/wp-content/legacy.jpg'), true)
})

test('only editorial publication or update dates determine modified date', () => {
  assert.equal(getModifiedDate({ pubDate: '2026-05-01', generatedAt: '2026-08-01' }).toISOString(), '2026-05-01T00:00:00.000Z')
  assert.equal(getModifiedDate({ pubDate: '2026-05-01', updatedAt: '2026-05-02' }).toISOString(), '2026-05-02T00:00:00.000Z')
  assert.throws(() => getModifiedDate({ pubDate: 'invalid' }), /Invalid editorial date/)
})

test('sitemap groups use latest editorial date, omit static pages, and are repeatable', () => {
  const posts = [post('a', ['gemini']), post('b', ['gemini'], { updatedAt: '2026-06-01' })]
  const dates = buildEditorialLastmod(posts, [])
  assert.equal(dates.get('/categoria/etica/').toISOString(), '2026-06-01T00:00:00.000Z')
  assert.equal(dates.get('/tag/gemini/').toISOString(), '2026-06-01T00:00:00.000Z')
  assert.equal(dates.has('/sobre/'), false)
  assert.deepEqual(dates, buildEditorialLastmod(posts, []))
  for (const path of ['/tag/claude-code/', '/archivo/pagina/2/', '/metricas/', '/404/']) assert.equal(isSitemapPath(path), false)
  assert.equal(isSitemapPath('/tag/gemini/'), true)
})

test('installed Astro MDX processor compiles the two reported Markdown tables', async () => {
  const { createMdxProcessor } = await import('../node_modules/@astrojs/mdx/dist/plugins.js')
  const { readFileSync } = await import('node:fs')
  const { default: matter } = await import('gray-matter')
  const processor = createMdxProcessor({ gfm: true, remarkPlugins: [], rehypePlugins: [], recmaPlugins: [], syntaxHighlight: false, remarkRehype: {} }, { sourcemap: false })
  for (const path of ['source/content/blog/gpt-6-astra-novedades-frente-gpt-5-6.mdx', 'source/content/tutoriales/gpt-personalizado-vs-skill-cual-elegir.mdx']) {
    const output = String(await processor.process({ value: matter(readFileSync(path, 'utf8')).content, path, data: { astro: { frontmatter: {} } } }))
    assert.match(output, /table: "table"/, path)
    assert.match(output, /thead: "thead"/, path)
    assert.match(output, /td: "td"/, path)
  }
})
