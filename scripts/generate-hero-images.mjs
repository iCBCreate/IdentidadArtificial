import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

const ROOT = process.cwd()
const POSTS_DIR = resolve(ROOT, 'source/content/blog')
const ASSETS_DIR = resolve(ROOT, 'source/assets/post')

// Load API key from .dev.vars
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
  console.error('OPENAI_API_KEY not found in environment or .dev.vars')
  process.exit(1)
}

// Posts to generate images for, with their prompts
const targets = [
  {
    slug: 'claude-managed-agents',
    filename: 'claude-managed-agents-hero.png',
    prompt: 'Futuristic AI agent network visualization, dark background with deep purple and blue tones, interconnected nodes representing autonomous AI agents, glowing neural pathways, abstract digital art, cinematic lighting, high detail, no text, no logos',
  },
  {
    slug: 'como-funciona-el-contexto-en-los-llm',
    filename: 'contexto-llm-hero.png',
    prompt: 'Abstract visualization of a large language model context window, dark background, flowing streams of text tokens transforming into vectors, deep purple and cyan color palette, digital consciousness aesthetic, no text labels, cinematic sci-fi art style',
  },
  {
    slug: 'por-que-astro-para-un-blog-generado-por-ia',
    filename: 'astro-blog-ia-hero.png',
    prompt: 'Abstract digital blog creation scene, rocket launching from a dark cosmic background with purple nebula, surrounded by floating code fragments and AI neural patterns, deep space aesthetic, purple and violet tones, no text, cinematic illustration',
  },
  {
    slug: 'que-son-los-agentes-de-ia',
    filename: 'agentes-ia-hero.png',
    prompt: 'Conceptual visualization of AI agents, multiple robotic silhouettes connected by glowing data streams on a dark background, deep purple and blue gradient, futuristic digital art, autonomous decision-making represented as branching light paths, no text, cinematic',
  },
]

async function generateImage(prompt, filename) {
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
    throw new Error(`OpenAI API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error('No image data in response')

  const outPath = resolve(ASSETS_DIR, filename)
  writeFileSync(outPath, Buffer.from(b64, 'base64'))
  console.log(`  ✓ Saved ${filename}`)
  return filename
}

function addHeroImageToPost(slug, filename) {
  const postPath = resolve(POSTS_DIR, `${slug}.mdx`)
  const content = readFileSync(postPath, 'utf8')

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) throw new Error(`No frontmatter in ${slug}.mdx`)

  const fm = parseYaml(fmMatch[1])
  if (fm.heroImage) {
    console.log(`  ⚠ ${slug} already has heroImage, skipping`)
    return
  }

  fm.heroImage = `../../assets/post/${filename}`

  const newFm = stringifyYaml(fm, { lineWidth: 0 }).trimEnd()
  const newContent = content.replace(fmMatch[0], `---\n${newFm}\n---`)
  writeFileSync(postPath, newContent)
  console.log(`  ✓ Updated frontmatter: ${slug}.mdx`)
}

for (const target of targets) {
  console.log(`\nProcessing: ${target.slug}`)
  try {
    await generateImage(target.prompt, target.filename)
    addHeroImageToPost(target.slug, target.filename)
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`)
  }
}

console.log('\nDone.')
