import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEditorialLastmod, getEligibleTags, getModifiedDate, getRetiredResponse, isRetiredPath, isSitemapPath } from '../source/lib/content-policy.mjs'
const post = (id, tags, extra = {}) => ({ id, data: { tags, pubDate: '2026-05-01', category: 'Ética', ...extra } })

test('strategic tag eligibility requires three active posts, except for the preserved two-post tags', () => {
  const posts = [
    post('a', ['apple-intelligence', 'astro', 'siri', 'chatgpt', 'benchmarks']),
    post('b', ['apple-intelligence', 'astro', 'siri', 'chatgpt', 'benchmarks']),
    post('c', ['chatgpt']),
    post('d', ['chatgpt']),
    post('chatgpt-agent-revolucion-openai', ['active-count']),
    post('e', ['active-count']),
    post('f', ['active-count']),
  ]

  const eligible = getEligibleTags(posts)

  assert.deepEqual([...eligible], ['apple-intelligence', 'astro', 'siri', 'chatgpt'])
  assert.equal(eligible.has('benchmarks'), false, 'weak tags are excluded from internal links')
  assert.equal(eligible.has('active-count'), false, 'retired posts do not count as active')
  assert.equal(isRetiredPath('/tag/apple-intelligence/'), false)
  assert.equal(isRetiredPath('/tag/claude-code'), true)
  assert.equal(isRetiredPath('/chatgpt-agent-revolucion-openai/feed/'), true)
  assert.equal(isRetiredPath('/wp-content/legacy.jpg'), true)
})

test('weak tag pages are excluded from the sitemap while the strategic ChatGPT page remains', () => {
  const posts = [
    post('a', ['chatgpt', 'benchmarks']),
    post('b', ['chatgpt', 'benchmarks']),
    post('c', ['chatgpt']),
    post('d', ['chatgpt']),
  ]

  const dates = buildEditorialLastmod(posts, [])

  assert.equal(dates.has('/tag/benchmarks/'), false)
  assert.equal(isSitemapPath('/tag/benchmarks/', getEligibleTags(posts)), false)
  assert.equal(dates.has('/tag/chatgpt/'), true)
  assert.equal(isSitemapPath('/tag/chatgpt/'), true)
})

test('retired weak tag requests return a noindex 410 response', async () => {
  const policy = await import('../source/lib/content-policy.mjs')
  assert.equal(typeof policy.getRetiredResponse, 'function')

  const response = policy.getRetiredResponse('/tag/benchmarks/', new Set())
  assert.equal(response?.status, 410)
  assert.equal(response?.headers.get('content-type'), 'text/html; charset=utf-8')
  assert.match(response?.headers.get('x-robots-tag') ?? '', /noindex, follow/)
  assert.match(await response?.text(), /Este contenido se ha retirado/)
  assert.equal(policy.getRetiredResponse('/tag/chatgpt/'), null)
})

test('weak active taxonomy tags reactivate once they reach three posts', () => {
  const twoPosts = [post('a', ['codex']), post('b', ['codex'])]
  const threePosts = [...twoPosts, post('c', ['codex'])]

  assert.equal(getRetiredResponse('/tag/codex/', getEligibleTags(twoPosts))?.status, 410)
  assert.equal(getEligibleTags(threePosts).has('codex'), true)
  assert.equal(getRetiredResponse('/tag/codex/', getEligibleTags(threePosts)), null)
  assert.equal(buildEditorialLastmod(threePosts, []).has('/tag/codex/'), true)
  assert.equal(isSitemapPath('/tag/codex/'), true, 'the sitemap filter receives only generated tag routes')
})

test('only editorial publication or update dates determine modified date', () => {
  assert.equal(getModifiedDate({ pubDate: '2026-05-01', generatedAt: '2026-08-01' }).toISOString(), '2026-05-01T00:00:00.000Z')
  assert.equal(getModifiedDate({ pubDate: '2026-05-01', updatedAt: '2026-05-02' }).toISOString(), '2026-05-02T00:00:00.000Z')
  assert.throws(() => getModifiedDate({ pubDate: 'invalid' }), /Invalid editorial date/)
})

test('sitemap groups use latest editorial date, omit static pages, and are repeatable', () => {
  const posts = [post('a', ['chatgpt']), post('b', ['chatgpt'], { updatedAt: '2026-06-01' }), post('c', ['chatgpt'])]
  const dates = buildEditorialLastmod(posts, [])
  assert.equal(dates.get('/categoria/etica/').toISOString(), '2026-06-01T00:00:00.000Z')
  assert.equal(dates.get('/tag/chatgpt/').toISOString(), '2026-06-01T00:00:00.000Z')
  assert.equal(dates.has('/sobre/'), false)
  assert.deepEqual(dates, buildEditorialLastmod(posts, []))
  for (const path of ['/tag/claude-code/', '/archivo/pagina/2/', '/metricas/', '/404/']) assert.equal(isSitemapPath(path), false)
  assert.equal(isSitemapPath('/tag/chatgpt/'), true)
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
