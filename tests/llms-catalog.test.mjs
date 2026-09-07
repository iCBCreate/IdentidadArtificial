import test from 'node:test'
import assert from 'node:assert/strict'
import { renderLlmsCatalog } from '../source/lib/llms-catalog.mjs'

test('LLM catalog lists every published article and tutorial with canonical URLs', () => {
  const catalog = renderLlmsCatalog({
    posts: [
      { id: 'nuevo-articulo', data: { title: 'Artículo nuevo', description: 'Contenido reciente.', pubDate: new Date('2026-09-07') } },
      { id: 'articulo-anterior', data: { title: 'Artículo anterior', description: 'Contenido anterior.', pubDate: new Date('2026-09-01') } },
    ],
    tutorials: [
      { id: 'guia-nueva', data: { title: 'Guía nueva', description: 'Tutorial reciente.', pubDate: new Date('2026-09-06') } },
    ],
  })

  assert.match(catalog, /^# Identidad Artificial/m)
  assert.match(catalog, /## Artículos \(2\)/)
  assert.match(catalog, /https:\/\/identidadartificial\.com\/nuevo-articulo\//)
  assert.match(catalog, /https:\/\/identidadartificial\.com\/articulo-anterior\//)
  assert.match(catalog, /## Tutoriales \(1\)/)
  assert.match(catalog, /https:\/\/identidadartificial\.com\/tutoriales\/guia-nueva\//)
  assert.doesNotMatch(catalog, /ultimas-novedades-claude-mythos-anthropic/)
})
