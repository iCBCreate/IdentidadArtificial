import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import {
  GENERATED_DIR,
  readBlogPosts,
  writeGeneratedModule,
} from './content-utils.mjs'

const CORE_TOPICS = [
  { topic: 'evaluación de modelos de IA en producción', intent: 'Aprender a medir calidad, coste, latencia y regresiones antes de desplegar IA.', tags: ['evaluacion', 'benchmarks', 'produccion'] },
  { topic: 'memoria en agentes de IA', intent: 'Entender cómo persistir contexto sin llenar la ventana del modelo.', tags: ['agentes', 'memoria', 'contexto'] },
  { topic: 'guardrails y políticas de seguridad para LLM', intent: 'Diseñar límites, validaciones y revisión humana en sistemas con IA.', tags: ['seguridad-ia', 'guardrails', 'llm'] },
  { topic: 'costes reales de usar IA generativa', intent: 'Comparar coste por token, caché, batch y elección de modelos.', tags: ['costes', 'tokens', 'arquitectura'] },
  { topic: 'MCP y herramientas para agentes', intent: 'Explicar cómo conectar modelos con sistemas externos mediante herramientas.', tags: ['mcp', 'agentes', 'herramientas'] },
  { topic: 'búsqueda semántica para blogs técnicos', intent: 'Mostrar cómo convertir contenido editorial en una base consultable.', tags: ['embeddings', 'busqueda-semantica', 'rag'] },
]

export function buildEditorialRadar(posts) {
  const existingText = posts
    .map(post => `${post.title} ${post.description} ${post.tags.join(' ')}`)
    .join(' ')
    .toLowerCase()
  const categories = new Set(posts.map(post => post.category))
  const tags = new Set(posts.flatMap(post => post.tags))

  const topics = CORE_TOPICS
    .map(item => {
      const overlap = item.tags.filter(tag => existingText.includes(tag) || tags.has(tag)).length
      return {
        ...item,
        priority: overlap === 0 ? 'Alta' : overlap === 1 ? 'Media' : 'Baja',
        reason: overlap === 0
          ? 'Hueco temático claro frente al corpus actual.'
          : 'Hay señales relacionadas, pero falta una pieza dedicada.',
        relatedPosts: relatedPosts(posts, item.tags),
      }
    })
    .sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority))
    .slice(0, 5)

  return {
    generatedAt: posts
      .map(post => post.generatedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? 'build-time',
    signals: [
      { label: 'Cobertura actual', value: `${posts.length} artículos publicados` },
      { label: 'Categorías activas', value: String(categories.size) },
      { label: 'Etiquetas únicas', value: String(tags.size) },
      { label: 'Modo de generación', value: 'Build-time, sin IA en vivo' },
    ],
    topics,
  }
}

function priorityScore(priority) {
  return priority === 'Alta' ? 3 : priority === 'Media' ? 2 : 1
}

function relatedPosts(posts, topicTags) {
  return posts
    .map(post => ({
      slug: post.slug,
      title: post.title,
      score: post.tags.filter(tag => topicTags.includes(tag)).length,
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ slug, title }) => ({ slug, title }))
}

async function main() {
  const posts = await readBlogPosts()
  await writeGeneratedModule(join(GENERATED_DIR, 'editorial-radar.ts'), 'EDITORIAL_RADAR', buildEditorialRadar(posts))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main()
}
