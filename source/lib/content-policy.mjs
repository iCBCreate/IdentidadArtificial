// Shared by route generation, links, sitemap and post-build validation.
export const RETIRED_PATHS = new Set([
  '/chatgpt-agent-revolucion-openai/',
  '/chatgpt-image-generation-gpt-image-1/',
  '/ia-entrenamiento-pokemon/',
  '/openai-lanza-gpt-oss-novedades-2025/',
  '/tag/comet/',
  '/tag/hugging-face/',
  '/ultimas-novedades-claude-mythos-anthropic/',
  // Posts de la era WordPress que Google aún tiene indexados
  '/firebase-studio-crea-apps-rapidamente-con-ia/',
  '/chatgpt-5-un-modelo-para-dominarlos-a-todos/',
  '/la-paradoja-del-progreso-acelerado-como-el-avance/',
  // Posts eliminados — aparecían como "rastreada: sin indexar" en GSC
  '/ia-expendedora-san-francisco-projet-vend/',
  '/meta-refuerza-laboratorio-superinteligencia-fichajes-altman/',
  '/grok-4-nueva-frontera-inteligencia-artificial-comparativa/',
  '/chatgpt-5-novedades-lanzamiento-2025/',
  '/chatgpt-5-novedades-lanzamiento-2025',
  '/politica-de-cookies/',
  // Sitemaps WordPress legacy — Google sigue referenciando estos
  '/post-sitemap.xml',
  '/post_tag-sitemap.xml',
  '/page-sitemap.xml',
  // Tags de WordPress sin contenido en el sitio actual
  '/tag/programacion/',
  '/tag/microsoft/',
  '/tag/perplexity/',
  // Tags sin página — aparecían como "rastreada: sin indexar" en GSC
  '/tag/reflexion/',
  '/tag/agentes-de-ia/',
  '/tag/grok/',
  '/tag/chatgpt-agent/',
  '/tag/inteligencia-artificial/',
  '/tag/gpt-oss/',
  '/tag/ia/',
  // Categorías de WordPress
  '/category/actualidad-tecnologica/',
  // Legacy WordPress detectados en GSC (2026-07) — confirmados 404, se pasan a 410
  '/tag/openclaw/',
  '/tag/deepmind/',
  '/tag/claude-code/',
  '/tag/inversion/',
  '/tag/gpt-image-2/',
  '/comet-navegador-perplexity-analisis/',
  '/novedades-gemini-3-google/',
  '/ultimas-filtraciones-openai-agii/',
  '/chatgpt-5-novedades-2025/',
])

// Prefijos que nunca existirán en este sitio
export const RETIRED_PREFIXES = [
  '/wp-content/',
  '/wp-admin/',
  '/wp-includes/',
  '/category/',
]


export function normalizePath(pathname) {
  const path = pathname.split(/[?#]/)[0]
  return /\.[a-z0-9]+$/i.test(path) ? path : `${path.replace(/\/+$/, '')}/`
}

export function isRetiredPath(pathname) {
  const path = normalizePath(pathname.replace(/\/feed\/?$/, '/'))
  return RETIRED_PATHS.has(path) || RETIRED_PREFIXES.some(prefix => path.startsWith(prefix))
}

export function getEligibleTags(posts) {
  const idsByTag = new Map()
  for (const post of posts) {
    if (isRetiredPath(`/${post.id}/`)) continue
    for (const tag of new Set(post.data.tags ?? [])) {
      const ids = idsByTag.get(tag) ?? new Set()
      ids.add(post.id)
      idsByTag.set(tag, ids)
    }
  }
  return new Set([...idsByTag].filter(([tag, ids]) => ids.size >= 2 && !isRetiredPath(`/tag/${tag}/`)).map(([tag]) => tag))
}

export function getModifiedDate(data) {
  const date = new Date(data.updatedAt ?? data.pubDate)
  if (Number.isNaN(date.getTime())) throw new Error('Invalid editorial date')
  return date
}

export function isSitemapPath(pathname) {
  const path = normalizePath(pathname)
  return !isRetiredPath(path) && !['/pagina/', '/archivo/pagina/'].some(prefix => path.startsWith(prefix)) &&
    !['/metricas/', '/aviso-legal/', '/politica-de-privacidad/', '/404/', '/410/'].includes(path)
}

export function buildEditorialLastmod(posts, tutorials) {
  const dates = new Map()
  const eligibleTags = getEligibleTags(posts)
  const add = (path, date) => {
    if (!dates.has(path) || dates.get(path) < date) dates.set(path, date)
  }
  for (const post of posts) {
    if (isRetiredPath(`/${post.id}/`)) continue
    const date = getModifiedDate(post.data)
    add(`/${post.id}/`, date)
    const category = post.data.category.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '').replace(/ /g, '-')
    add(`/categoria/${category}/`, date)
    for (const tag of post.data.tags ?? []) if (eligibleTags.has(tag)) add(`/tag/${tag}/`, date)
    add('/', date)
    add('/archivo/', date)
  }
  for (const tutorial of tutorials) {
    const date = getModifiedDate(tutorial.data)
    add(`/tutoriales/${tutorial.id}/`, date)
    add('/tutoriales/', date)
  }
  return dates
}
