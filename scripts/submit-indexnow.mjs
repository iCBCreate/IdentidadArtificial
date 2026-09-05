const SITE_URL = 'https://identidadartificial.com'
const INDEXNOW_KEY = '9fafa2e3af37ff118bf3ded108481f6b'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
const SITEMAP_INDEX = `${SITE_URL}/sitemap-index.xml`

const isDryRun = process.argv.includes('--dry-run')

export function extractLocations(xml) {
  return [...xml.matchAll(/<loc[^>]*>([^<]+)<\/loc>/g)].map(match => match[1].trim())
}

export function validateIndexNowUrlList(urlList, siteUrl = SITE_URL) {
  if (urlList.length === 0) {
    throw new Error('IndexNow: el sitemap no contiene URLs')
  }

  const siteHost = new URL(siteUrl).host
  const invalidUrls = urlList.filter(url => {
    try {
      return new URL(url).host !== siteHost
    } catch {
      return true
    }
  })

  if (invalidUrls.length > 0) {
    throw new Error(`IndexNow: URLs fuera del sitio o inválidas: ${invalidUrls.slice(0, 3).join(', ')}`)
  }

  const uniqueUrls = [...new Set(urlList)]
  if (uniqueUrls.length !== urlList.length) {
    throw new Error(`IndexNow: el sitemap contiene ${urlList.length - uniqueUrls.length} URLs duplicadas`)
  }

  return urlList
}

export async function fetchSitemapUrls(sitemapIndex = SITEMAP_INDEX) {
  const fetchXml = async url => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`IndexNow: no se pudo leer ${url} (${response.status})`)
    }
    return response.text()
  }

  const indexXml = await fetchXml(sitemapIndex)
  const sitemapLocs = extractLocations(indexXml)

  const allUrls = []
  for (const loc of sitemapLocs) {
    allUrls.push(...extractLocations(await fetchXml(loc)))
  }
  return validateIndexNowUrlList(allUrls)
}

async function main() {
  const urlList = await fetchSitemapUrls()

  console.log(`IndexNow: ${urlList.length} URLs preparadas desde ${SITEMAP_INDEX}`)

  if (isDryRun) {
    console.log('-- DRY RUN --')
    urlList.forEach(u => console.log(u))
    return
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
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main()
}
