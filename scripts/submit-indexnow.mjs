const SITE_URL = 'https://identidadartificial.com'
const INDEXNOW_KEY = '9fafa2e3af37ff118bf3ded108481f6b'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
const SITEMAP_INDEX = `${SITE_URL}/sitemap-index.xml`

const isDryRun = process.argv.includes('--dry-run')

async function fetchSitemapUrls() {
  const { XMLParser } = await import('fast-xml-parser').catch(() => null) ?? {}

  // Fallback: parse with regex if fast-xml-parser unavailable
  const getText = (xml, tag) => [...xml.matchAll(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'g'))].map(m => m[1].trim())

  const indexXml = await fetch(SITEMAP_INDEX).then(r => r.text())
  const sitemapLocs = getText(indexXml, 'loc')

  const allUrls = []
  for (const loc of sitemapLocs) {
    const xml = await fetch(loc).then(r => r.text())
    allUrls.push(...getText(xml, 'loc'))
  }
  return allUrls
}

const urlList = await fetchSitemapUrls()

console.log(`IndexNow: ${urlList.length} URLs preparadas`)

if (isDryRun) {
  console.log('-- DRY RUN --')
  urlList.forEach(u => console.log(u))
  process.exit(0)
}

const res = await fetch(INDEXNOW_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: 'identidadartificial.com',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList,
  }),
})

if (res.ok || res.status === 202) {
  console.log(`OK (${res.status}): ${urlList.length} URLs enviadas a IndexNow`)
} else {
  const body = await res.text().catch(() => '')
  throw new Error(`IndexNow falló: ${res.status} ${body}`)
}
