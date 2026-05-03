import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import {
  GENERATED_DIR,
  readBlogPosts,
  slugify,
  writeGeneratedModule,
} from './content-utils.mjs'

const CONCEPT_ALIASES = [
  { id: 'llm', label: 'LLM', terms: ['llm', 'llms', 'modelo de lenguaje', 'modelos de lenguaje'] },
  { id: 'rag', label: 'RAG', terms: ['rag', 'recuperación', 'retrieval', 'generación aumentada'] },
  { id: 'embeddings', label: 'Embeddings', terms: ['embedding', 'embeddings'] },
  { id: 'vector-database', label: 'Base vectorial', terms: ['base vectorial', 'bases vectoriales', 'vector database'] },
  { id: 'agentes', label: 'Agentes', terms: ['agente', 'agentes', 'agentic', 'agéntica'] },
  { id: 'automatizacion', label: 'Automatización', terms: ['automatización', 'autónomo', 'autónomos', 'autonomía'] },
  { id: 'contexto', label: 'Contexto', terms: ['contexto', 'tokens', 'ventana de contexto'] },
  { id: 'razonamiento', label: 'Razonamiento', terms: ['razonamiento', 'thinking', 'razona'] },
  { id: 'multimodal', label: 'Multimodal', terms: ['multimodal', 'imagen', 'audio', 'vídeo', 'video'] },
  { id: 'seguridad-ia', label: 'Seguridad IA', terms: ['seguridad', 'ciberseguridad', 'sandbox', 'vulnerabilidad'] },
  { id: 'seo-geo', label: 'SEO/GEO', terms: ['seo', 'geo', 'search console', 'sitemap', 'llms.txt'] },
  { id: 'astro', label: 'Astro', terms: ['astro', 'jamstack'] },
  { id: 'rendimiento', label: 'Rendimiento', terms: ['rendimiento', 'avif', 'sharp', 'optimización'] },
  { id: 'openai', label: 'OpenAI', type: 'company', terms: ['openai', 'chatgpt', 'gpt'] },
  { id: 'anthropic', label: 'Anthropic', type: 'company', terms: ['anthropic', 'claude'] },
  { id: 'google', label: 'Google', type: 'company', terms: ['google', 'gemini'] },
  { id: 'deepseek', label: 'DeepSeek', type: 'company', terms: ['deepseek'] },
]

export function extractEntities(text, tags = []) {
  const haystack = `${text} ${tags.join(' ')}`.toLowerCase()
  const found = CONCEPT_ALIASES
    .filter(concept => concept.terms.some(term => haystack.includes(term)))
    .map(concept => concept.id)
  const tagMatches = tags
    .map(tag => CONCEPT_ALIASES.find(concept => concept.id === slugify(tag))?.id)
    .filter(Boolean)

  return [...new Set([...tagMatches, ...found])]
}

export function buildKnowledgeMap(posts) {
  const nodeMap = new Map()
  const linkMap = new Map()
  const postEntities = new Map()

  for (const post of posts) {
    const postId = `post:${post.slug}`
    addNode(nodeMap, { id: postId, type: 'post', label: post.title, slug: post.slug, category: post.category })

    const categoryId = `category:${slugify(post.category)}`
    addNode(nodeMap, { id: categoryId, type: 'category', label: post.category })
    addLink(linkMap, postId, categoryId, 2, 'category')

    const entities = extractEntities(`${post.title} ${post.description} ${post.body}`, post.tags)
    postEntities.set(post.slug, entities)

    for (const tag of post.tags) {
      const tagId = `tag:${slugify(tag)}`
      addNode(nodeMap, { id: tagId, type: 'tag', label: tag })
      addLink(linkMap, postId, tagId, 2, 'tag')
    }

    for (const entity of entities) {
      const concept = CONCEPT_ALIASES.find(item => item.id === entity)
      const conceptId = `${concept?.type ?? 'concept'}:${entity}`
      addNode(nodeMap, { id: conceptId, type: concept?.type ?? 'concept', label: concept?.label ?? entity })
      addLink(linkMap, postId, conceptId, 3, 'semantic')
    }
  }

  const relatedByPost = Object.fromEntries(posts.map(post => {
    const related = posts
      .filter(candidate => candidate.slug !== post.slug)
      .map(candidate => ({
        slug: candidate.slug,
        title: candidate.title,
        reason: relationReason(post, candidate, postEntities),
        score: relationScore(post, candidate, postEntities),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    return [post.slug, related]
  }))

  return {
    generatedAt: generatedAt(posts),
    nodes: [...nodeMap.values()],
    links: [...linkMap.values()],
    relatedByPost,
  }
}

function generatedAt(posts) {
  return posts
    .map(post => post.generatedAt)
    .filter(Boolean)
    .sort()
    .at(-1) ?? 'build-time'
}

function relationScore(a, b, postEntities) {
  const sharedTags = a.tags.filter(tag => b.tags.includes(tag)).length
  const sharedEntities = postEntities.get(a.slug).filter(entity => postEntities.get(b.slug).includes(entity)).length
  const sameCategory = a.category === b.category ? 1 : 0
  return sharedTags * 3 + sharedEntities * 2 + sameCategory
}

function relationReason(a, b, postEntities) {
  const sharedTags = a.tags.filter(tag => b.tags.includes(tag))
  if (sharedTags.length > 0) return `Comparten etiquetas: ${sharedTags.slice(0, 2).join(', ')}.`

  const sharedEntities = postEntities.get(a.slug).filter(entity => postEntities.get(b.slug).includes(entity))
  if (sharedEntities.length > 0) {
    const labels = sharedEntities
      .slice(0, 2)
      .map(entity => CONCEPT_ALIASES.find(item => item.id === entity)?.label ?? entity)
    return `Conectan por conceptos: ${labels.join(', ')}.`
  }

  return `Pertenecen a la categoría ${a.category}.`
}

function addNode(map, node) {
  if (!map.has(node.id)) map.set(node.id, node)
}

function addLink(map, source, target, weight, relation) {
  const id = `${source}->${target}`
  if (!map.has(id)) map.set(id, { source, target, weight, relation })
}

async function main() {
  const posts = await readBlogPosts()
  await writeGeneratedModule(join(GENERATED_DIR, 'knowledge-map.ts'), 'KNOWLEDGE_MAP', buildKnowledgeMap(posts))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main()
}
