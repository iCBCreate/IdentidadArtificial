import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildKnowledgeMap,
  extractEntities,
} from '../scripts/generate-knowledge-map.mjs'
import {
  buildPostInsights,
  extractGlossary,
} from '../scripts/generate-post-insights.mjs'
import {
  buildEditorialRadar,
} from '../scripts/generate-editorial-radar.mjs'

const posts = [
  {
    slug: 'que-es-rag',
    title: 'RAG: generación aumentada por recuperación',
    description: 'Cómo funciona RAG con embeddings y bases vectoriales.',
    category: 'Arquitectura',
    tags: ['rag', 'llm', 'embeddings'],
    body: 'RAG conecta un modelo de lenguaje con una base vectorial. Los embeddings permiten recuperar contexto relevante antes de responder.',
    generatedBy: 'claude-sonnet-4-6',
    humanReviewed: true,
  },
  {
    slug: 'agentes-ia',
    title: 'Qué son los agentes de IA',
    description: 'Sistemas que planifican y usan herramientas.',
    category: 'Inteligencia Artificial',
    tags: ['agentes', 'llm', 'herramientas'],
    body: 'Un agente observa, planifica, usa herramientas y repite el ciclo hasta completar un objetivo.',
    generatedBy: 'gpt-5-codex',
    humanReviewed: false,
  },
]

test('extractEntities normalizes known AI concepts and companies from post text', () => {
  const entities = extractEntities(`${posts[0].title} ${posts[0].body}`, posts[0].tags)

  assert.deepEqual(entities.slice(0, 4), ['rag', 'llm', 'embeddings', 'vector-database'])
})

test('buildKnowledgeMap creates article, concept and category nodes with weighted links', () => {
  const map = buildKnowledgeMap(posts)

  assert.ok(map.nodes.some(node => node.id === 'post:que-es-rag' && node.type === 'post'))
  assert.ok(map.nodes.some(node => node.id === 'concept:rag' && node.type === 'concept'))
  assert.ok(map.nodes.some(node => node.id === 'category:arquitectura' && node.type === 'category'))
  assert.ok(map.links.some(link => link.source === 'post:que-es-rag' && link.target === 'concept:rag' && link.weight >= 3))
  assert.ok(map.relatedByPost['que-es-rag'].some(item => item.slug === 'agentes-ia'))
})

test('buildPostInsights derives summaries, key points, glossary and faqs without external services', () => {
  const insights = buildPostInsights(posts)

  assert.equal(Object.keys(insights).length, 2)
  assert.ok(insights['que-es-rag'].executiveSummary.includes('RAG'))
  assert.ok(insights['que-es-rag'].keyPoints.length >= 3)
  assert.ok(insights['que-es-rag'].glossary.some(item => item.term === 'RAG'))
  assert.ok(insights['que-es-rag'].faqs.some(item => item.question.includes('Qué aporta')))
})

test('extractGlossary returns only concepts present in the post', () => {
  const glossary = extractGlossary('Los embeddings alimentan una base vectorial para un sistema RAG.')

  assert.deepEqual(glossary.map(item => item.term), ['RAG', 'Embeddings', 'Base vectorial'])
})

test('buildEditorialRadar proposes visible topic gaps from missing core concepts', () => {
  const radar = buildEditorialRadar(posts)

  assert.ok(radar.generatedAt)
  assert.ok(radar.topics.length >= 3)
  assert.ok(radar.topics.some(topic => topic.topic.includes('evaluación')))
  assert.ok(radar.signals.some(signal => signal.label === 'Cobertura actual'))
})
