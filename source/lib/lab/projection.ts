// Lógica pura de la demo de embeddings: similitud coseno y PCA 2D
// (power iteration + deflación). Sin librerías: los vectores son pequeños (~384 dims, <20 frases).

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Proyecta vectores de dimensión arbitraria a 2D vía PCA.
// Devuelve un punto [x, y] por vector de entrada.
export function projectTo2D(vectors: number[][]): Array<[number, number]> {
  const n = vectors.length
  if (n === 0) return []
  const dims = vectors[0].length
  if (n === 1) return [[0, 0]]

  // Centrar
  const mean = new Array(dims).fill(0)
  for (const v of vectors) for (let d = 0; d < dims; d++) mean[d] += v[d] / n
  const centered = vectors.map(v => v.map((x, d) => x - mean[d]))

  const pc1 = principalComponent(centered)
  // Deflación: eliminar la componente pc1 y repetir
  const deflated = centered.map(v => {
    const proj = dot(v, pc1)
    return v.map((x, d) => x - proj * pc1[d])
  })
  const pc2 = principalComponent(deflated)

  return centered.map(v => [dot(v, pc1), dot(v, pc2)])
}

// Primera componente principal por power iteration sobre la matriz de covarianza implícita.
function principalComponent(centered: number[][], iterations = 60): number[] {
  const dims = centered[0].length
  // Vector inicial determinista (evita Math.random para reproducibilidad en tests)
  let v = new Array(dims).fill(0).map((_, i) => Math.sin(i + 1))
  normalize(v)

  for (let iter = 0; iter < iterations; iter++) {
    // w = C·v sin materializar C: C·v = Σ_x (x·v)·x / n
    const w = new Array(dims).fill(0)
    for (const x of centered) {
      const s = dot(x, v)
      for (let d = 0; d < dims; d++) w[d] += s * x[d]
    }
    if (norm(w) < 1e-12) break // sin varianza restante
    normalize(w)
    v = w
  }
  return v
}

function dot(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

function norm(v: number[]): number {
  return Math.sqrt(dot(v, v))
}

function normalize(v: number[]): void {
  const n = norm(v)
  if (n === 0) return
  for (let i = 0; i < v.length; i++) v[i] /= n
}
