// tests/fetch-site.test.ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { GET, MAX_RESPONSE_BYTES, readLimitedResponse, validateUrl } from '../source/pages/api/fetch-site.ts'

test('validateUrl rechaza null', () => {
  assert.equal(validateUrl(null), null)
})

test('validateUrl rechaza HTTP (no HTTPS)', () => {
  assert.equal(validateUrl('http://example.com'), null)
})

test('validateUrl rechaza string no-URL', () => {
  assert.equal(validateUrl('no-es-una-url'), null)
})

test('validateUrl acepta HTTPS válido', () => {
  const url = validateUrl('https://identidadartificial.com')
  assert.ok(url instanceof URL)
  assert.equal(url?.hostname, 'identidadartificial.com')
})

test('validateUrl acepta HTTPS con path', () => {
  const url = validateUrl('https://example.com/blog/')
  assert.ok(url instanceof URL)
})

test('validateUrl rechaza localhost', () => {
  assert.equal(validateUrl('https://localhost/api'), null)
})

test('validateUrl rechaza IP privada 127.0.0.1', () => {
  assert.equal(validateUrl('https://127.0.0.1/'), null)
})

test('validateUrl rechaza IPv6 loopback con corchetes', () => {
  assert.equal(validateUrl('https://[::1]/'), null)
})

test('validateUrl rechaza IPv6 mapeada a IPv4', () => {
  assert.equal(validateUrl('https://[::ffff:127.0.0.1]/'), null)
})

test('validateUrl rechaza IP decimal (se normaliza a 127.0.0.1)', () => {
  assert.equal(validateUrl('https://2130706433/'), null)
})

test('validateUrl rechaza IP hexadecimal y octal', () => {
  assert.equal(validateUrl('https://0x7f000001/'), null)
  assert.equal(validateUrl('https://017700000001/'), null)
})

test('validateUrl rechaza rango CGNAT 100.64.0.0/10', () => {
  assert.equal(validateUrl('https://100.64.0.1/'), null)
})

test('validateUrl rechaza subdominios de localhost', () => {
  assert.equal(validateUrl('https://foo.localhost/'), null)
})

test('validateUrl rechaza rango 0.0.0.0/8', () => {
  assert.equal(validateUrl('https://0.1.2.3/'), null)
})

test('validateUrl acepta IP pública', () => {
  assert.ok(validateUrl('https://1.1.1.1/') instanceof URL)
})

test('validateUrl acepta 100.x fuera de CGNAT', () => {
  assert.ok(validateUrl('https://100.128.0.1/') instanceof URL)
})

test('readLimitedResponse rechaza cuerpos que superan el límite', async () => {
  const response = new Response('x'.repeat(MAX_RESPONSE_BYTES + 1))
  await assert.rejects(
    readLimitedResponse(response, MAX_RESPONSE_BYTES),
    (error: unknown) => error instanceof Error && error.name === 'ResponseTooLargeError',
  )
})

test('readLimitedResponse conserva cuerpos dentro del límite', async () => {
  const response = await readLimitedResponse(new Response('contenido válido'), MAX_RESPONSE_BYTES)
  assert.equal(await response.text(), 'contenido válido')
})


// These regressions exercise the real handler and response reader. Only the
// external fetch and Cloudflare-native parser are replaced at their boundaries.
async function flushPromises() {
  for (let i = 0; i < 30; i++) await Promise.resolve()
}

function controlledBody(t: test.TestContext, neverFinishCancellation = false) {
  let controller!: ReadableStreamDefaultController<Uint8Array>
  let cancelled = false
  const body = new ReadableStream<Uint8Array>({
    start(value) { controller = value },
    cancel() {
      cancelled = true
      if (neverFinishCancellation) return new Promise<void>(() => {})
    },
  })
  t.after(() => { try { controller.close() } catch { /* already cancelled */ } })
  return { body, controller, wasCancelled: () => cancelled }
}

let requestId = 0
function routeHarness(t: test.TestContext, response: Response | Error) {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let signal: AbortSignal | undefined
  t.mock.method(globalThis, 'fetch', async (_input: unknown, init?: RequestInit) => {
    signal = init?.signal ?? undefined
    if (response instanceof Error) throw response
    return response
  })
  const original = Object.getOwnPropertyDescriptor(globalThis, 'HTMLRewriter')
  Object.defineProperty(globalThis, 'HTMLRewriter', {
    configurable: true,
    value: class {
      on() { return this }
      transform(value: Response) { return value }
    },
  })
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'HTMLRewriter', original)
    else Reflect.deleteProperty(globalThis, 'HTMLRewriter')
  })
  let settled = false
  const result = Promise.resolve(GET({ request: new Request(
    'https://identidadartificial.com/api/fetch-site?url=https%3A%2F%2Fexample.com%2F',
    { headers: { 'cf-connecting-ip': `test-${++requestId}` } },
  ) } as Parameters<typeof GET>[0])).then(value => { settled = true; return value })
  return { result, isSettled: () => settled, getSignal: () => signal }
}

test('GET aborta un cuerpo detenido a los ocho segundos aunque cancelar no termine', async t => {
  const remote = controlledBody(t, true)
  const route = routeHarness(t, new Response(remote.body))
  await flushPromises()
  t.mock.timers.tick(7999)
  await flushPromises()
  assert.equal(route.isSettled(), false)
  t.mock.timers.tick(1)
  await flushPromises()
  assert.equal(route.isSettled(), true, 'el plazo debe terminar la petición sin esperar cancel()')
  assert.equal((await route.result).status, 408)
  assert.equal(remote.wasCancelled(), true)
  assert.equal(route.getSignal()?.aborted, true)
})

test('GET limita el tiempo total de un cuerpo que entrega fragmentos lentamente', async t => {
  const remote = controlledBody(t)
  const route = routeHarness(t, new Response(remote.body))
  await flushPromises()
  t.mock.timers.tick(4000)
  remote.controller.enqueue(new TextEncoder().encode('<html>'))
  await flushPromises()
  t.mock.timers.tick(3999)
  await flushPromises()
  assert.equal(route.isSettled(), false)
  t.mock.timers.tick(1)
  await flushPromises()
  assert.equal(route.isSettled(), true)
  assert.equal((await route.result).status, 408)
  assert.equal(remote.wasCancelled(), true)
})

test('GET conserva JSON y CORS en éxito y limpia el temporizador', async t => {
  const route = routeHarness(t, new Response('<html></html>'))
  await flushPromises()
  const response = await route.result
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://identidadartificial.com')
  assert.deepEqual(await response.json(), {
    title: '', description: '', canonical: 'https://example.com/', lang: 'es', navLinks: [],
  })
  t.mock.timers.tick(16000)
  assert.equal(route.getSignal()?.aborted, false)
})

test('GET cancela cuerpos de redirecciones sin esperar su cancelación', async t => {
  const remote = controlledBody(t, true)
  const route = routeHarness(t, new Response(remote.body, { status: 302 }))
  await flushPromises()
  assert.equal(route.isSettled(), true)
  assert.equal((await route.result).status, 422)
  assert.equal(remote.wasCancelled(), true)
  t.mock.timers.tick(16000)
  assert.equal(route.getSignal()?.aborted, false)
})

test('GET cancela un cuerpo cuyo Content-Length excede el máximo', async t => {
  const remote = controlledBody(t, true)
  const route = routeHarness(t, new Response(remote.body, {
    headers: { 'content-length': String(1_048_577) },
  }))
  await flushPromises()
  assert.equal(route.isSettled(), true)
  assert.equal((await route.result).status, 413)
  assert.equal(remote.wasCancelled(), true)
  t.mock.timers.tick(16000)
  assert.equal(route.getSignal()?.aborted, false)
})

test('GET no espera cancelación remota al superar el tamaño durante la lectura', async t => {
  const remote = controlledBody(t, true)
  const route = routeHarness(t, new Response(remote.body))
  remote.controller.enqueue(new Uint8Array(1_048_577))
  await flushPromises()
  assert.equal(route.isSettled(), true)
  assert.equal((await route.result).status, 413)
  assert.equal(remote.wasCancelled(), true)
})

test('GET conserva 502 y limpia el temporizador tras un error de red', async t => {
  const route = routeHarness(t, new Error('connection failed'))
  assert.equal((await route.result).status, 502)
  t.mock.timers.tick(16000)
  assert.equal(route.getSignal()?.aborted, false)
})

test('readLimitedResponse rechaza inmediatamente una señal ya abortada', async () => {
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(readLimitedResponse(new Response('content'), 1024, controller.signal),
    (error: unknown) => error instanceof Error && error.name === 'AbortError')
})

test('readLimitedResponse retira el listener de aborto al terminar', async t => {
  const controller = new AbortController()
  const remove = t.mock.method(controller.signal, 'removeEventListener')
  const response = await readLimitedResponse(new Response('content'), 1024, controller.signal)
  assert.equal(await response.text(), 'content')
  assert.ok(remove.mock.calls.some(call => call.arguments[0] === 'abort'))
  controller.abort()
})
