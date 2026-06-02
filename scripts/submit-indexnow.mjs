import { readBlogPosts } from './content-utils.mjs'

const SITE_URL = 'https://identidadartificial.com'
const INDEXNOW_KEY = '9fafa2e3af37ff118bf3ded108481f6b'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

const isDryRun = process.argv.includes('--dry-run')

const STATIC_URLS = [
  '/',
  '/sobre/',
  '/archivo/',
  '/mapa-ia/',
  '/radar/',
  '/como-funciona/',
  '/tutoriales/',
]

const CATEGORY_SLUGS = [
  'modelos',
  'inteligencia-artificial',
  'conceptos',
  'arquitectura',
  'herramientas',
  'etica',
]

const posts = await readBlogPosts()
const postUrls = posts.map(p => `/${p.slug}/`)
const categoryUrls = CATEGORY_SLUGS.map(s => `/categoria/${s}/`)

const urlList = [
  ...STATIC_URLS,
  ...categoryUrls,
  ...postUrls,
].map(path => `${SITE_URL}${path}`)

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
