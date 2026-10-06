import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, truncateSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const script = resolve('scripts/copy-ort-wasm.mjs')
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'ort-runtime-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const src = join(root, 'node_modules/onnxruntime-web/dist')
  const out = join(root, 'public/vendor/ort')
  mkdirSync(src, { recursive: true }); mkdirSync(out, { recursive: true })
  for (const suffix of ['', '.asyncify']) {
    writeFileSync(join(src, `ort-wasm-simd-threaded${suffix}.mjs`), `module${suffix}`)
    writeFileSync(join(src, `ort-wasm-simd-threaded${suffix}.wasm`), `wasm${suffix}`)
  }
  return { root, src, out }
}

test('copy-ort-wasm serves the matching CPU runtime and removes obsolete oversized assets', t => {
  const { root, out } = fixture(t)
  writeFileSync(join(out, 'ort-wasm-simd-threaded.asyncify.wasm'), 'obsolete')
  writeFileSync(join(out, 'ort-wasm-simd-threaded.asyncify.mjs'), 'obsolete')
  const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(existsSync(join(out, 'ort-wasm-simd-threaded.wasm')), true)
  assert.equal(readFileSync(join(out, 'ort-wasm-simd-threaded.wasm'), 'utf8'), 'wasm')
  assert.equal(readFileSync(join(out, 'ort-wasm-simd-threaded.mjs'), 'utf8'), 'module')
  assert.equal(existsSync(join(out, 'ort-wasm-simd-threaded.asyncify.wasm')), false)
  assert.equal(existsSync(join(out, 'ort-wasm-simd-threaded.asyncify.mjs')), false)
})

test('copy-ort-wasm rejects a runtime asset exceeding the Workers 25 MiB limit', t => {
  const { root, src, out } = fixture(t)
  truncateSync(join(src, 'ort-wasm-simd-threaded.wasm'), 25 * 1024 * 1024 + 1)
  const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /25 MiB/)
  assert.equal(existsSync(join(out, 'ort-wasm-simd-threaded.wasm')), false)
})
