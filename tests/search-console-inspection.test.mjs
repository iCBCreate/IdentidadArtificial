import assert from 'node:assert/strict'
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  extractSitemapUrls,
  discoverInspectionUrls,
  getSiteOrigin,
  getSitemapSource,
  getPendingUrls,
  getInspectionOutputPath,
  groupInspectionResults,
  normalizeInspectionDelay,
  readExistingResults,
  renderInspectionSummary,
  writeReports,
} from '../scripts/inspect-search-console-urls.mjs'

test('extractSitemapUrls returns unique same-origin URLs from sitemap locations', () => {
  const sitemap = `<?xml version="1.0"?>
    <urlset>
      <url><loc>https://identidadartificial.com/</loc></url>
      <url><loc>https://identidadartificial.com/blog/guia/</loc></url>
      <url><loc>https://identidadartificial.com/blog/guia/</loc></url>
    </urlset>`

  assert.deepEqual(extractSitemapUrls(sitemap, 'https://identidadartificial.com'), [
    'https://identidadartificial.com/',
    'https://identidadartificial.com/blog/guia/',
  ])
})

test('extractSitemapUrls decodes XML entities in sitemap locations before validating URLs', () => {
  const sitemap = '<urlset><url><loc>https://identidadartificial.com/blog/guia/?source=radar&amp;section=ia</loc></url></urlset>'

  assert.deepEqual(extractSitemapUrls(sitemap, 'https://identidadartificial.com'), [
    'https://identidadartificial.com/blog/guia/?source=radar&section=ia',
  ])
})

test('extractSitemapUrls decodes numeric XML entities in sitemap locations before validating URLs', () => {
  const sitemap = '<urlset><url><loc>https://identidadartificial.com/blog/guia/?source=radar&#38;section=ia</loc></url></urlset>'

  assert.deepEqual(extractSitemapUrls(sitemap, 'https://identidadartificial.com'), [
    'https://identidadartificial.com/blog/guia/?source=radar&section=ia',
  ])
})

test('extractSitemapUrls rejects malformed and external sitemap locations before inspection', () => {
  const external = '<urlset><url><loc>https://example.com/untrusted</loc></url></urlset>'
  const malformed = '<urlset><url><loc>not a URL</loc></url></urlset>'

  assert.throws(
    () => extractSitemapUrls(external, 'https://identidadartificial.com'),
    /outside the configured Search Console origin/,
  )
  assert.throws(
    () => extractSitemapUrls(malformed, 'https://identidadartificial.com'),
    /Invalid sitemap URL/,
  )
})

test('getSitemapSource defaults to the published sitemap and only uses a local file when explicitly set', () => {
  assert.deepEqual(getSitemapSource('https://identidadartificial.com', {}), {
    type: 'published',
    value: 'https://identidadartificial.com/sitemap-index.xml',
  })
  assert.deepEqual(getSitemapSource('https://identidadartificial.com', { GSC_SITEMAP_PATH: 'dist/client/sitemap-0.xml' }), {
    type: 'local',
    value: 'dist/client/sitemap-0.xml',
  })
  assert.throws(
    () => getSitemapSource('https://identidadartificial.com', { GSC_SITEMAP_URL: 'https://example.com/sitemap.xml' }),
    /outside the configured Search Console origin/,
  )
})

test('getSiteOrigin derives an HTTPS web origin from the documented sc-domain property', () => {
  assert.equal(getSiteOrigin('sc-domain:identidadartificial.com', {}), 'https://identidadartificial.com')
  assert.deepEqual(getSitemapSource(getSiteOrigin('sc-domain:identidadartificial.com', {}), {}), {
    type: 'published',
    value: 'https://identidadartificial.com/sitemap-index.xml',
  })
  assert.equal(
    getSiteOrigin('sc-domain:identidadartificial.com', { GSC_SITE_ORIGIN: 'https://www.identidadartificial.com/path' }),
    'https://www.identidadartificial.com',
  )
  assert.equal(getSiteOrigin('https://identidadartificial.com/blog/', {}), 'https://identidadartificial.com')
  assert.throws(
    () => getSiteOrigin('sc-domain:identidadartificial.com', { GSC_SITE_ORIGIN: 'http://identidadartificial.com' }),
    /must use HTTPS/,
  )
})

test('getPendingUrls retries only timeout and network-abort errors on resume', () => {
  const pending = getPendingUrls(
    [
      'https://identidadartificial.com/',
      'https://identidadartificial.com/blog/guia/',
      'https://identidadartificial.com/blog/guia/',
      'https://identidadartificial.com/tutoriales/inicio/',
      'https://identidadartificial.com/laboratorio/',
    ],
    [
      { url: 'https://identidadartificial.com/', verdict: 'PASS' },
      { url: 'https://identidadartificial.com/blog/guia/', error: 'timeout' },
      { url: 'https://identidadartificial.com/tutoriales/inicio/', error: 'The operation was aborted' },
      { url: 'https://identidadartificial.com/laboratorio/', error: 'Permission denied' },
      { url: 'https://identidadartificial.com/', verdict: 'PASS' },
    ],
  )

  assert.deepEqual(pending, [
    'https://identidadartificial.com/blog/guia/',
    'https://identidadartificial.com/tutoriales/inicio/',
  ])
})

test('normalizeInspectionDelay rejects nonnumeric values and retains the quota-safe minimum', () => {
  assert.equal(normalizeInspectionDelay('0'), 250)
  assert.equal(normalizeInspectionDelay('1100'), 1100)
  assert.throws(() => normalizeInspectionDelay('not-a-number'), /finite number/)
})

test('getInspectionOutputPath is stable across days unless explicitly overridden', () => {
  assert.equal(getInspectionOutputPath({}), 'reports/url-inspection.json')
  assert.equal(getInspectionOutputPath({ GSC_INSPECTION_OUTPUT_PATH: 'tmp/custom.json' }), 'tmp/custom.json')
  assert.throws(
    () => getInspectionOutputPath({ GSC_INSPECTION_OUTPUT_PATH: 'tmp/custom' }),
    /must end with \.json/,
  )
})

test('writeReports replaces a retryable error with a later successful inspection', () => {
  const directory = mkdtempSync(join(tmpdir(), 'gsc-inspection-'))
  const outputPath = join(directory, 'inspection.json')

  try {
    writeReports({
      outPath: outputPath,
      siteUrl: 'https://identidadartificial.com',
      sitemapSource: 'https://identidadartificial.com/sitemap-index.xml',
      results: [
        { url: 'https://identidadartificial.com/blog/guia/', error: 'timeout' },
        { url: 'https://identidadartificial.com/blog/guia/', verdict: 'PASS', coverageState: 'Submitted and indexed' },
        { url: 'https://identidadartificial.com/', verdict: 'PASS' },
        { url: 'https://identidadartificial.com/', verdict: 'PASS' },
      ],
    })

    const report = JSON.parse(readFileSync(outputPath, 'utf8'))
    assert.deepEqual(report.results.map(result => result.url), [
      'https://identidadartificial.com/',
      'https://identidadartificial.com/blog/guia/',
    ])
    assert.deepEqual(readExistingResults(outputPath).map(result => result.url), report.results.map(result => result.url))
    assert.deepEqual(report.results.find(result => result.url === 'https://identidadartificial.com/blog/guia/'), {
      url: 'https://identidadartificial.com/blog/guia/',
      verdict: 'PASS',
      coverageState: 'Submitted and indexed',
    })
    assert.match(readFileSync(outputPath.replace(/\.json$/, '.md'), 'utf8'), /## Errores \(0\)/)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('writeReports keeps an existing resumable JSON report valid when replacement cannot start', () => {
  const directory = mkdtempSync(join(tmpdir(), 'gsc-atomic-report-'))
  const outputPath = join(directory, 'inspection.json')
  const previousReport = {
    generatedAt: '2026-09-06T00:00:00.000Z',
    siteUrl: 'https://identidadartificial.com',
    sitemapSource: 'https://identidadartificial.com/sitemap-index.xml',
    results: [{ url: 'https://identidadartificial.com/', verdict: 'PASS' }],
  }

  try {
    writeFileSync(outputPath, `${JSON.stringify(previousReport)}\n`)
    chmodSync(directory, 0o500)

    assert.throws(() => writeReports({
      outPath: outputPath,
      siteUrl: 'https://identidadartificial.com',
      sitemapSource: 'https://identidadartificial.com/sitemap-index.xml',
      results: [{ url: 'https://identidadartificial.com/blog/guia/', verdict: 'PASS' }],
    }))

    assert.deepEqual(JSON.parse(readFileSync(outputPath, 'utf8')), previousReport)
  } finally {
    chmodSync(directory, 0o700)
    rmSync(directory, { recursive: true, force: true })
  }
})

test('discoverInspectionUrls expands child sitemaps from an explicit local sitemap index', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'gsc-sitemap-'))
  const rootPath = join(directory, 'sitemap-index.xml')
  const childPath = join(directory, 'sitemap-0.xml')

  try {
    writeFileSync(rootPath, '<sitemapindex><sitemap><loc>https://identidadartificial.com/sitemap-0.xml</loc></sitemap></sitemapindex>')
    writeFileSync(childPath, '<urlset><url><loc>https://identidadartificial.com/blog/guia/</loc></url></urlset>')

    assert.deepEqual(await discoverInspectionUrls({
      siteUrl: 'https://identidadartificial.com',
      localSitemapPath: rootPath,
    }), ['https://identidadartificial.com/blog/guia/'])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('groupInspectionResults and renderInspectionSummary group indexed, not-indexed, errors, and unknown results', () => {
  const groups = groupInspectionResults([
    { url: 'https://identidadartificial.com/', coverageState: 'Submitted and indexed' },
    { url: 'https://identidadartificial.com/blog/guia/', coverageState: 'Crawled - currently not indexed' },
    { url: 'https://identidadartificial.com/tutoriales/inicio/', error: 'quota exceeded' },
    { url: 'https://identidadartificial.com/laboratorio/', verdict: 'NEUTRAL' },
  ])

  assert.deepEqual(groups, {
    indexed: ['https://identidadartificial.com/'],
    notIndexed: ['https://identidadartificial.com/blog/guia/'],
    errors: ['https://identidadartificial.com/tutoriales/inicio/'],
    unknown: ['https://identidadartificial.com/laboratorio/'],
  })
  assert.match(renderInspectionSummary(groups), /## Indexadas \(1\)/)
  assert.match(renderInspectionSummary(groups), /## No indexadas \(1\)/)
  assert.match(renderInspectionSummary(groups), /## Errores \(1\)/)
  assert.match(renderInspectionSummary(groups), /## Sin clasificar \(1\)/)
})
