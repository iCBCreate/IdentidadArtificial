import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { computeCostTable, estimateTokensFromText, formatUSD } from '../source/lib/lab/cost.ts'

class Element {
  constructor(value = '') { this.value = value; this.textContent = ''; this.hidden = false; this.disabled = false; this.readOnly = false; this.checked = false; this.children = []; this.listeners = {}; this.style = {}; this.dataset = {}; this.classList = { add() {}, remove() {} }; }
  addEventListener(name, fn) { this.listeners[name] = fn }
  async fire(name) { await this.listeners[name]?.() }
  appendChild(child) { this.children.push(child); return child }
  replaceChildren(...children) { this.children = children }
  setAttribute(name, value) { this[name] = value }
  focus() {}
}
function app(file, additions = {}) {
  const elements = new Map()
  const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id) }
  const modes = [new Element('text'), new Element('manual')]
  const document = { getElementById: get, createElement: () => new Element(), createElementNS: () => new Element(), createDocumentFragment: () => new Element(), querySelectorAll: () => modes }
  let code = fs.readFileSync(`source/pages/laboratorio/${file}.astro`, 'utf8').split('<script>')[1].split('</script>')[0]
  code = code.replace(/import\s+[\s\S]*?\sfrom\s+'[^']+'\s*/g, '').replace(/import\('gpt-tokenizer\/encoding\/o200k_base'\)/g, 'loadTokenizer()').replace(/import\('@huggingface\/transformers'\)/g, 'loadTransformers()')
  get('ctx-output-tokens').value = '1000'
  get('ctx-input-tokens').value = '0'
  const ctx = vm.createContext({ document, console: { error() {} }, setTimeout, clearTimeout, ...additions })
  vm.runInContext(ts.transpile(code, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }), ctx)
  return { get, modes }
}

test('tokenizer retries a failed download and tokenizes the latest text', async () => {
  let calls = 0
  const ui = app('tokenizador', { loadTokenizer: async () => { if (++calls === 1) throw Error('offline'); return { encode: t => [...t].map((_, i) => i), decode: () => 'x' } } })
  ui.get('tok-input').value = 'original'
  await ui.get('tok-input').fire('input')
  assert.equal(ui.get('tok-retry').hidden, false)
  assert.equal(ui.get('tok-input').value, 'original')
  ui.get('tok-input').value = 'nuevo'
  await ui.get('tok-retry').fire('click')
  assert.equal(ui.get('tok-count').textContent, '5')
  assert.equal(ui.get('tok-retry').hidden, true)
  await ui.get('tok-clear').fire('click')
  assert.equal(ui.get('tok-count').textContent, '0')
})

test('calculator manual mode wins over a pending text count and includes output in context', async () => {
  let resolve
  const pending = new Promise(r => { resolve = r })
  const ui = app('calculadora-contexto', {
    PRICED_MODELS: [{ name: 'Test model', company: 'Test', contextWindow: 100, inputPerMTok: 1, outputPerMTok: 2 }],
    COMPANY_COLORS: {}, computeCostTable, estimateTokensFromText, formatUSD,
    loadTokenizer: () => pending,
  })
  ui.get('ctx-precise-toggle').checked = true
  ui.get('ctx-text').value = 'texto pendiente'
  const update = ui.get('ctx-text').fire('input')
  await ui.modes[1].fire('change')
  ui.get('ctx-input-tokens').value = '80'
  ui.get('ctx-output-tokens').value = '30'
  await ui.get('ctx-input-tokens').fire('input')
  resolve({ encode: () => [1, 2, 3] })
  await update
  assert.equal(ui.get('ctx-input-tokens').value, '80')
  assert.equal(ui.get('ctx-input-tokens').readOnly, false)
  assert.match(ui.get('ctx-method').textContent, /Modo manual/)
  assert.match(ui.get('ctx-tbody').children[0].innerHTML, /no cabe/)
})

test('embeddings only downloads after explicit click and preserves input after failure', async () => {
  let downloads = 0
  const ui = app('embeddings', { loadTransformers: async () => { downloads++; throw Error('offline') } })
  ui.get('emb-input').value = 'Una frase\nOtra frase'
  assert.equal(downloads, 0)
  await ui.get('emb-load-btn').fire('click')
  assert.equal(downloads, 1)
  assert.equal(ui.get('emb-input').value, 'Una frase\nOtra frase')
  assert.equal(ui.get('emb-load-btn').disabled, false)
  assert.match(ui.get('emb-load-btn').textContent, /Reintentar/)
})
