// tests/fetch-site.test.ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { MAX_RESPONSE_BYTES, readLimitedResponse, validateUrl } from '../source/pages/api/fetch-site.ts'

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
