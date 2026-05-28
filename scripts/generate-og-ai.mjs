import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = process.cwd()
const OUT_DIR = resolve(ROOT, 'public/og')

function loadDevVars() {
  try {
    const content = readFileSync(resolve(ROOT, '.dev.vars'), 'utf8')
    const vars = {}
    for (const line of content.split('\n')) {
      const [key, ...rest] = line.split('=')
      if (key && rest.length) vars[key.trim()] = rest.join('=').trim()
    }
    return vars
  } catch {
    return {}
  }
}

const devVars = loadDevVars()
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || devVars.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY not found')
  process.exit(1)
}

const PAGES = [
  {
    slug: 'index',
    prompt: 'A dramatic cinematic digital art piece representing artificial intelligence identity. A glowing humanoid silhouette made of pure data streams and neural network nodes, dark deep space background with deep purple and violet nebula, intricate circuitry patterns forming a face, bioluminescent blue and purple light tendrils, ultra high detail, 16:9 aspect ratio, no text',
  },
  {
    slug: 'sobre',
    prompt: 'A cinematic portrait concept for a blog about AI. A single human eye with a digital iris reflecting neural network patterns, surrounded by floating code fragments and data streams in dark space, deep purple and blue tones, photorealistic digital art, intimate and personal atmosphere, no text, 16:9',
  },
  {
    slug: 'como-funciona',
    prompt: 'A technical blueprint visualization of an AI content pipeline. Glowing workflow diagram with interconnected nodes showing data transformation stages, dark background with electric blue and orange accent lines, isometric perspective, clean architectural aesthetic, futuristic infographic art style, no text or labels, 16:9',
  },
  {
    slug: 'mapa-ia',
    prompt: 'A stunning visualization of a semantic knowledge graph. Thousands of interconnected glowing nodes forming a cosmic web of concepts, deep dark space background, nodes glowing in teal and emerald green, long exposure photography style, the connections forming constellation-like patterns, ultra detail, no text, 16:9',
  },
  {
    slug: 'radar',
    prompt: 'A futuristic editorial radar scanning interface. Circular radar sweep animation frozen mid-scan revealing emerging AI topics as glowing signals on a dark screen, amber and gold warning colors, military-grade HUD aesthetic, atmospheric with depth of field, no text or labels, 16:9',
  },
  {
    slug: 'archivo',
    prompt: 'A digital archive library concept. Infinite rows of glowing blue data shelves extending into dark perspective, each shelf containing luminous document fragments, volumetric light beams cutting through dark atmospheric space, library meets server room aesthetic, deep blue and cyan color palette, no text, 16:9',
  },
  {
    slug: 'tutoriales',
    prompt: 'A visual metaphor for AI learning and tutorials. A human hand reaching toward a glowing AI brain made of light, mentor and student dynamic, warm purple and violet light gradient on dark background, inspirational and accessible atmosphere, photorealistic digital art, no text, 16:9',
  },
]

async function generateImage(prompt, slug) {
  console.log(`  Generating ${slug}.png...`)
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1536x1024',
      output_format: 'png',
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error('No image data')

  const outPath = resolve(OUT_DIR, `${slug}.png`)
  writeFileSync(outPath, Buffer.from(b64, 'base64'))
  console.log(`  ✓ /og/${slug}.png`)
}

for (const page of PAGES) {
  try {
    await generateImage(page.prompt, page.slug)
  } catch (err) {
    console.error(`  ✗ ${page.slug}: ${err.message}`)
  }
}

console.log('\nDone.')
