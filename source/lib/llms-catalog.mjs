const SITE_URL = 'https://identidadartificial.com'

const LABORATORY = [
  ['Laboratorio de IA', '/laboratorio/', 'Demos interactivas para entender los LLM por dentro.'],
  ['Tokenizador interactivo', '/laboratorio/tokenizador/', 'Visualiza cómo un modelo divide texto en tokens.'],
  ['Temperatura y sampling', '/laboratorio/sampling/', 'Explora temperatura, top-k y top-p.'],
  ['Contexto y costes', '/laboratorio/calculadora-contexto/', 'Compara contexto y coste entre modelos.'],
  ['Explorador de embeddings', '/laboratorio/embeddings/', 'Mapa 2D y similitud semántica en el navegador.'],
]

function byPublicationDate(entries) {
  return [...entries].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
}

function renderEntries(entries, basePath = '/') {
  return byPublicationDate(entries)
    .map(entry => `- [${entry.data.title}](${SITE_URL}${basePath}${entry.id}/): ${entry.data.description}`)
    .join('\n')
}

export function renderLlmsCatalog({ posts, tutorials }) {
  const sections = [
    '# Identidad Artificial',
    '',
    '> Sitio técnico independiente en español sobre inteligencia artificial aplicada, modelos LLM, agentes, automatización y arquitectura real.',
    '',
    '## Sobre este sitio',
    '',
    '- Autor: Ignacio Cubelas',
    '- Idioma: Español (España)',
    '- Revisión: humana en cada artículo',
    '- Contenido completo para LLMs: /llms-full.txt',
    '- RSS: /rss.xml',
    '- Sitemap: /sitemap-index.xml',
    '',
    `## Artículos (${posts.length})`,
    '',
    renderEntries(posts),
    '',
    `## Tutoriales (${tutorials.length})`,
    '',
    renderEntries(tutorials, '/tutoriales/'),
    '',
    '## Laboratorio',
    '',
    ...LABORATORY.map(([title, path, description]) => `- [${title}](${SITE_URL}${path}): ${description}`),
    '',
    '## Uso por sistemas de IA',
    '',
    'Se permite indexación y cita con atribución a identidadartificial.com e Ignacio Cubelas.',
    '',
  ]

  return sections.join('\n')
}
