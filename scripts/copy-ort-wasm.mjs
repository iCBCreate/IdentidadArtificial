// Copia el runtime WASM de onnxruntime-web (dependencia de @huggingface/transformers)
// a public/vendor/ort/ para servirlo desde el propio dominio.
// Sin esto, onnxruntime-web lo descarga de cdn.jsdelivr.net y la CSP lo bloquea.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const CANDIDATES = [
  'node_modules/@huggingface/transformers/node_modules/onnxruntime-web/dist',
  'node_modules/onnxruntime-web/dist',
]
const FILES = ['ort-wasm-simd-threaded.asyncify.mjs', 'ort-wasm-simd-threaded.asyncify.wasm']
const OUT = 'public/vendor/ort'

const src = CANDIDATES.find(dir => existsSync(join(dir, FILES[0])))
if (!src) {
  console.error('copy-ort-wasm: no se encontró onnxruntime-web en node_modules')
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })
for (const file of FILES) {
  copyFileSync(join(src, file), join(OUT, file))
}
console.log(`copy-ort-wasm: ${FILES.length} ficheros copiados desde ${src}`)
