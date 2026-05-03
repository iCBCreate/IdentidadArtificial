import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import {
  GENERATED_DIR,
  readBlogPosts,
  wordCount,
  writeGeneratedModule,
} from './content-utils.mjs'

const GLOSSARY = [
  { term: 'RAG', match: /\brag\b|recuperaci[oó]n|retrieval/i, definition: 'Arquitectura que recupera contexto externo antes de pedir una respuesta al modelo.' },
  { term: 'Embeddings', match: /embeddings?/i, definition: 'Representaciones numéricas que permiten comparar significado entre textos.' },
  { term: 'Base vectorial', match: /base[s]? vectorial(?:es)?|vector database/i, definition: 'Base de datos optimizada para buscar fragmentos por similitud semántica.' },
  { term: 'LLM', match: /\bllm\b|modelo[s]? de lenguaje/i, definition: 'Modelo entrenado para predecir y generar lenguaje a partir de grandes cantidades de texto.' },
  { term: 'Agente', match: /agente[s]?|aut[oó]nom/i, definition: 'Sistema que planifica, usa herramientas y repite acciones hasta cumplir un objetivo.' },
  { term: 'Ventana de contexto', match: /contexto|tokens/i, definition: 'Cantidad de información que el modelo puede leer durante una interacción.' },
  { term: 'Multimodalidad', match: /multimodal|imagen|audio|v[ií]deo/i, definition: 'Capacidad de trabajar con varios tipos de entrada o salida, no solo texto.' },
  { term: 'GEO', match: /\bgeo\b|llms\.txt|motores de respuesta/i, definition: 'Optimización del contenido para sistemas generativos que responden citando fuentes.' },
]

export function buildPostInsights(posts) {
  return Object.fromEntries(posts.map(post => [post.slug, buildInsight(post)]))
}

export function buildInsight(post) {
  const sentences = splitSentences(`${post.description} ${post.body}`)
  const topSentences = sentences.slice(0, 3)
  const glossary = extractGlossary(`${post.title} ${post.description} ${post.body}`)
  const readingMinutes = Math.max(1, Math.ceil(wordCount(post.body) / 200))

  return {
    executiveSummary: topSentences.join(' '),
    technicalReading: technicalReading(post, glossary),
    keyPoints: keyPoints(post, sentences, glossary),
    glossary,
    faqs: faqs(post, glossary),
    readingProfile: {
      minutes: readingMinutes,
      density: glossary.length >= 4 ? 'alta' : glossary.length >= 2 ? 'media' : 'ligera',
      bestFor: bestFor(post.category),
    },
  }
}

export function extractGlossary(text) {
  return GLOSSARY
    .filter(item => item.match.test(text))
    .map(({ term, definition }) => ({ term, definition }))
}

function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 40 && !sentence.startsWith('Sources:'))
}

function technicalReading(post, glossary) {
  const concepts = glossary.map(item => item.term).slice(0, 3).join(', ') || post.tags.slice(0, 3).join(', ')
  return `Lectura técnica: este artículo se entiende mejor como una pieza de ${post.category.toLowerCase()} centrada en ${concepts}. La clave está en separar la promesa del sistema de sus límites operativos y revisar qué parte depende del modelo, del contexto y de las herramientas alrededor.`
}

function keyPoints(post, sentences, glossary) {
  const points = [
    post.description,
    sentences.find(sentence => /diferencia|clave|principal|problema|capacidad/i.test(sentence)) ?? sentences[0],
    glossary.length > 0
      ? `Conceptos detectados por el pipeline: ${glossary.map(item => item.term).slice(0, 4).join(', ')}.`
      : `Etiquetas principales: ${post.tags.slice(0, 4).join(', ')}.`,
  ]

  return points.filter(Boolean).slice(0, 4)
}

function faqs(post, glossary) {
  const firstConcept = glossary[0]?.term ?? post.category
  return [
    {
      question: `Qué aporta este artículo sobre ${firstConcept}?`,
      answer: post.description,
    },
    {
      question: 'Para quién es útil esta lectura?',
      answer: `Para lectores que quieren entender ${post.category.toLowerCase()} con una explicación técnica pero directa, sin depender de hype ni de una demo cerrada.`,
    },
    {
      question: 'Cómo se generó esta capa de lectura?',
      answer: 'Se generó en build-time a partir del texto del post, sus etiquetas y reglas editoriales locales; no llama a un modelo cuando visitas la página.',
    },
  ]
}

function bestFor(category) {
  const map = {
    Modelos: 'comparar capacidades de modelos',
    Arquitectura: 'diseñar sistemas con IA',
    Herramientas: 'evaluar flujos de trabajo prácticos',
    Conceptos: 'entender fundamentos',
    'Inteligencia Artificial': 'orientarse en tendencias técnicas',
    Ética: 'valorar riesgos y decisiones',
  }
  return map[category] ?? 'lectura técnica sobre IA'
}

async function main() {
  const posts = await readBlogPosts()
  await writeGeneratedModule(join(GENERATED_DIR, 'post-insights.ts'), 'POST_INSIGHTS', buildPostInsights(posts))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main()
}
