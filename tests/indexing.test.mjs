import test from 'node:test'
import assert from 'node:assert/strict'

import { extractLocations, validateIndexNowUrlList } from '../scripts/submit-indexnow.mjs'

test('extractLocations obtiene las URLs de un sitemap XML', () => {
  const xml = '<urlset><url><loc>https://identidadartificial.com/post/</loc></url></urlset>'
  assert.deepEqual(extractLocations(xml), ['https://identidadartificial.com/post/'])
})

test('validateIndexNowUrlList acepta URLs únicas del sitio', () => {
  const urls = ['https://identidadartificial.com/', 'https://identidadartificial.com/post/']
  assert.deepEqual(validateIndexNowUrlList(urls), urls)
})

test('validateIndexNowUrlList rechaza URLs externas', () => {
  assert.throws(
    () => validateIndexNowUrlList(['https://identidadartificial.com/', 'https://example.com/']),
    /fuera del sitio o inválidas/,
  )
})

test('validateIndexNowUrlList rechaza duplicados', () => {
  assert.throws(
    () => validateIndexNowUrlList(['https://identidadartificial.com/', 'https://identidadartificial.com/']),
    /URLs duplicadas/,
  )
})
