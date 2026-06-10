// Lógica pura de la calculadora de contexto/costes.
// La estimación chars/4 es una aproximación (cada modelo tokeniza distinto);
// la UI lo indica y permite activar el tokenizador real (gpt-tokenizer) como referencia.

import type { PricedModel } from '../../data/model-pricing'

export const CHARS_PER_TOKEN = 4

export function estimateTokensFromText(text: string): number {
  if (text.length === 0) return 0
  return Math.max(1, Math.round(text.length / CHARS_PER_TOKEN))
}

export interface ModelCost {
  model: PricedModel
  inputCost: number
  outputCost: number
  totalCost: number
  contextPct: number
  fitsInContext: boolean
}

export function computeCost(model: PricedModel, inputTokens: number, outputTokens: number): ModelCost {
  const inputCost = (inputTokens / 1_000_000) * model.inputPerMTok
  const outputCost = (outputTokens / 1_000_000) * model.outputPerMTok
  return {
    model,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    contextPct: (inputTokens / model.contextWindow) * 100,
    fitsInContext: inputTokens <= model.contextWindow,
  }
}

export function computeCostTable(models: PricedModel[], inputTokens: number, outputTokens: number): ModelCost[] {
  return models.map(m => computeCost(m, inputTokens, outputTokens))
}

// Formato compacto en es-ES: coste en USD con precisión adaptada a la magnitud
export function formatUSD(value: number): string {
  if (value === 0) return '$0'
  if (value < 0.0001) return '<$0.0001'
  const decimals = value < 0.01 ? 4 : value < 1 ? 3 : 2
  return `$${value.toFixed(decimals)}`
}
