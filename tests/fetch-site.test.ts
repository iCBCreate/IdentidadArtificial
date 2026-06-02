// tests/fetch-site.test.ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { validateUrl } from '../functions/api/fetch-site.ts'

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
