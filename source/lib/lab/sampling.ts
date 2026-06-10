// Lógica pura del simulador de temperatura/sampling. Sin DOM: testeable con node:test.

export interface TokenLogit {
  token: string
  logit: number
}

export interface TokenProb {
  token: string
  prob: number
}

// Distribución sintética: continuaciones plausibles de "El futuro de la inteligencia artificial es…"
export const SYNTHETIC_LOGITS: TokenLogit[] = [
  { token: 'prometedor', logit: 4.2 },
  { token: 'incierto', logit: 3.8 },
  { token: 'imparable', logit: 3.1 },
  { token: 'brillante', logit: 2.9 },
  { token: 'complejo', logit: 2.6 },
  { token: 'apasionante', logit: 2.3 },
  { token: 'abierto', logit: 2.0 },
  { token: 'colaborativo', logit: 1.7 },
  { token: 'impredecible', logit: 1.5 },
  { token: 'humano', logit: 1.2 },
  { token: 'regulado', logit: 0.9 },
  { token: 'distribuido', logit: 0.6 },
  { token: 'multimodal', logit: 0.4 },
  { token: 'caro', logit: 0.1 },
  { token: 'local', logit: -0.2 },
  { token: 'invisible', logit: -0.5 },
  { token: 'lento', logit: -0.9 },
  { token: 'aburrido', logit: -1.4 },
  { token: 'verde', logit: -1.8 },
  { token: 'cuántico', logit: -2.2 },
]

// Softmax con temperatura. temperature <= 0 colapsa a argmax (greedy).
export function softmaxWithTemperature(logits: TokenLogit[], temperature: number): TokenProb[] {
  if (logits.length === 0) return []

  if (temperature <= 0) {
    let best = 0
    for (let i = 1; i < logits.length; i++) {
      if (logits[i].logit > logits[best].logit) best = i
    }
    return logits.map((l, i) => ({ token: l.token, prob: i === best ? 1 : 0 }))
  }

  const scaled = logits.map(l => l.logit / temperature)
  const max = Math.max(...scaled)
  const exps = scaled.map(s => Math.exp(s - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return logits.map((l, i) => ({ token: l.token, prob: exps[i] / sum }))
}

// Top-k: conserva los k tokens más probables y renormaliza.
export function applyTopK(probs: TokenProb[], k: number): TokenProb[] {
  if (k <= 0 || k >= probs.length) return probs
  const sorted = [...probs].sort((a, b) => b.prob - a.prob)
  const kept = new Set(sorted.slice(0, k).map(p => p.token))
  return renormalize(probs.map(p => ({ token: p.token, prob: kept.has(p.token) ? p.prob : 0 })))
}

// Top-p (nucleus): conserva el conjunto mínimo cuya probabilidad acumulada >= p y renormaliza.
export function applyTopP(probs: TokenProb[], p: number): TokenProb[] {
  if (p >= 1) return probs
  const sorted = [...probs].sort((a, b) => b.prob - a.prob)
  const kept = new Set<string>()
  let cumulative = 0
  for (const item of sorted) {
    kept.add(item.token)
    cumulative += item.prob
    if (cumulative >= p) break
  }
  return renormalize(probs.map(item => ({ token: item.token, prob: kept.has(item.token) ? item.prob : 0 })))
}

function renormalize(probs: TokenProb[]): TokenProb[] {
  const sum = probs.reduce((a, b) => a + b.prob, 0)
  if (sum === 0) return probs
  return probs.map(p => ({ token: p.token, prob: p.prob / sum }))
}

// Muestrea un token. `random` inyectable para tests deterministas.
export function sampleToken(probs: TokenProb[], random: () => number = Math.random): string {
  const r = random()
  let cumulative = 0
  for (const p of probs) {
    cumulative += p.prob
    if (r < cumulative) return p.token
  }
  return probs[probs.length - 1]?.token ?? ''
}
