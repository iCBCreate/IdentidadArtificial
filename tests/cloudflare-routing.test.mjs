import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('tag requests reach the Worker before static-asset fallback', () => {
  const wranglerConfig = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8')

  assert.match(
    wranglerConfig,
    /run_worker_first\s*=\s*\[[^\]]*"\/tag\/\*"[^\]]*\]/,
    'retired tag URLs must reach Astro middleware instead of the assets 404 fallback',
  )
})
