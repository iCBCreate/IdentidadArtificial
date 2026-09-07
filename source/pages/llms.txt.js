export const prerender = true

import { getCollection } from 'astro:content'
import { renderLlmsCatalog } from '../lib/llms-catalog.mjs'

export async function GET() {
  const [posts, tutorials] = await Promise.all([
    getCollection('blog'),
    getCollection('tutoriales'),
  ])

  return new Response(renderLlmsCatalog({ posts, tutorials }), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
