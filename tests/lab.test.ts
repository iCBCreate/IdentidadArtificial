// tests/lab.test.ts — lógica pura del laboratorio
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  SYNTHETIC_LOGITS,
  softmaxWithTemperature,
  applyTopK,
  applyTopP,
  sampleToken,
} from '../source/lib/lab/sampling.ts'
import { cosineSimilarity, projectTo2D } from '../source/lib/lab/projection.ts'
import { estimateTokensFromText, computeCost, formatUSD } from '../source/lib/lab/cost.ts'
import { PRICED_MODELS } from '../source/data/model-pricing.ts'

const sum = (probs: { prob: number }[]) => probs.reduce((a, b) => a + b.prob, 0)

test('softmax suma 1 con temperatura 1', () => {
  const probs = softmaxWithTemperature(SYNTHETIC_LOGITS, 1)
  assert.ok(Math.abs(sum(probs) - 1) < 1e-9)
})

test('softmax suma 1 con temperatura alta', () => {
  const probs = softmaxWithTemperature(SYNTHETIC_LOGITS, 2)
  assert.ok(Math.abs(sum(probs) - 1) < 1e-9)
})

test('temperatura 0 colapsa a argmax', () => {
  const probs = softmaxWithTemperature(SYNTHETIC_LOGITS, 0)
  const best = probs.find(p => p.token === 'prometedor')
  assert.equal(best?.prob, 1)
  assert.ok(Math.abs(sum(probs) - 1) < 1e-9)
})

test('temperatura baja concentra probabilidad en el argmax', () => {
  const low = softmaxWithTemperature(SYNTHETIC_LOGITS, 0.2)
  const high = softmaxWithTemperature(SYNTHETIC_LOGITS, 2)
  const top = (probs: typeof low) => Math.max(...probs.map(p => p.prob))
  assert.ok(top(low) > top(high))
})

test('top-k conserva exactamente k tokens con probabilidad > 0', () => {
  const probs = softmaxWithTemperature(SYNTHETIC_LOGITS, 1)
  const filtered = applyTopK(probs, 5)
  assert.equal(filtered.filter(p => p.prob > 0).length, 5)
  assert.ok(Math.abs(sum(filtered) - 1) < 1e-9)
})

test('top-p recorta el conjunto mínimo que cubre p y renormaliza', () => {
  const probs = softmaxWithTemperature(SYNTHETIC_LOGITS, 1)
  const filtered = applyTopP(probs, 0.5)
  const kept = filtered.filter(p => p.prob > 0)
  // El conjunto retenido debe ser el mínimo: sin el token menos probable, la acumulada original < p
  const originalByToken = new Map(probs.map(p => [p.token, p.prob]))
  const keptOriginal = kept
    .map(p => originalByToken.get(p.token)!)
    .sort((a, b) => b - a)
  const withoutSmallest = keptOriginal.slice(0, -1).reduce((a, b) => a + b, 0)
  assert.ok(withoutSmallest < 0.5)
  assert.ok(keptOriginal.reduce((a, b) => a + b, 0) >= 0.5)
  assert.ok(Math.abs(sum(filtered) - 1) < 1e-9)
})

test('top-p = 1 no recorta nada', () => {
  const probs = softmaxWithTemperature(SYNTHETIC_LOGITS, 1)
  const filtered = applyTopP(probs, 1)
  assert.equal(filtered.filter(p => p.prob > 0).length, probs.length)
})

test('sampleToken es determinista con random inyectado', () => {
  const probs = softmaxWithTemperature(SYNTHETIC_LOGITS, 0)
  assert.equal(sampleToken(probs, () => 0.5), 'prometedor')
})

test('coseno(v, v) = 1', () => {
  const v = [0.3, -1.2, 4.5, 0.01]
  assert.ok(Math.abs(cosineSimilarity(v, v) - 1) < 1e-9)
})

test('coseno de vectores ortogonales = 0', () => {
  assert.ok(Math.abs(cosineSimilarity([1, 0], [0, 1])) < 1e-9)
})

test('coseno de vectores opuestos = -1', () => {
  assert.ok(Math.abs(cosineSimilarity([1, 2], [-1, -2]) + 1) < 1e-9)
})

test('projectTo2D devuelve un punto por vector', () => {
  const vectors = [
    [1, 0, 0],
    [0.9, 0.1, 0],
    [0, 1, 0],
    [0, 0.9, 0.1],
  ]
  const points = projectTo2D(vectors)
  assert.equal(points.length, 4)
  for (const [x, y] of points) {
    assert.ok(Number.isFinite(x))
    assert.ok(Number.isFinite(y))
  }
})

test('projectTo2D separa grupos distintos y junta vectores similares', () => {
  const vectors = [
    [1, 0, 0],
    [0.95, 0.05, 0],
    [0, 1, 0],
    [0, 0.95, 0.05],
  ]
  const [a, b, c] = projectTo2D(vectors)
  const dist = (p: [number, number], q: [number, number]) =>
    Math.hypot(p[0] - q[0], p[1] - q[1])
  assert.ok(dist(a, b) < dist(a, c))
})

test('estimateTokensFromText usa chars/4', () => {
  assert.equal(estimateTokensFromText(''), 0)
  assert.equal(estimateTokensFromText('a'.repeat(400)), 100)
  assert.equal(estimateTokensFromText('ab'), 1) // mínimo 1 para texto no vacío
})

test('computeCost con números conocidos', () => {
  const fable = PRICED_MODELS.find(m => m.id === 'claude-fable-5')!
  // 1M tokens entrada + 100k salida: 1×$10 + 0.1×$50 = $15
  const cost = computeCost(fable, 1_000_000, 100_000)
  assert.ok(Math.abs(cost.inputCost - 10) < 1e-9)
  assert.ok(Math.abs(cost.outputCost - 5) < 1e-9)
  assert.ok(Math.abs(cost.totalCost - 15) < 1e-9)
  assert.ok(Math.abs(cost.contextPct - 100) < 1e-9)
  assert.equal(cost.fitsInContext, true)
})

test('computeCost detecta desbordamiento de contexto', () => {
  const haiku = PRICED_MODELS.find(m => m.id === 'claude-haiku-4-5')!
  const cost = computeCost(haiku, 300_000, 0)
  assert.equal(cost.fitsInContext, false)
  assert.ok(cost.contextPct > 100)
})

test('formatUSD adapta decimales', () => {
  assert.equal(formatUSD(0), '$0')
  assert.equal(formatUSD(0.00005), '<$0.0001')
  assert.equal(formatUSD(0.0042), '$0.0042')
  assert.equal(formatUSD(15), '$15.00')
})
