import { readFileSync, writeFileSync, readdirSync, mkdirSync, unlinkSync } from 'fs'
import { resolve, join, basename } from 'path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const ROOT = process.cwd()
const POSTS_DIR = resolve(ROOT, 'source/content/blog')
const OUT_DIR = resolve(ROOT, 'public/og')
const FONT_REGULAR = readFileSync(resolve(ROOT, 'public/fonts/Inter-Regular.ttf'))
const FONT_BOLD = readFileSync(resolve(ROOT, 'public/fonts/Inter-Bold.ttf'))

mkdirSync(OUT_DIR, { recursive: true })

const categoryColors = {
  'modelos': '#7C3AED',
  'inteligencia-artificial': '#2563EB',
  'conceptos': '#059669',
  'arquitectura': '#EA580C',
  'herramientas': '#CA8A04',
  'ética': '#9333EA',
  'tendencias': '#0284C7',
}

function categoryColor(cat) {
  return categoryColors[cat.toLowerCase().replace(/\s+/g, '-')] ?? '#7C3AED'
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const fm = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim().replace(/^['"]|['"]$/g, '')
    fm[key] = value
  }
  return fm
}

async function renderOG({ title, category, date, accent }) {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px', height: '630px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#13131F', padding: '64px',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '16px' },
              children: [
                { type: 'div', props: { style: { width: '4px', height: '32px', background: accent, borderRadius: '2px' }, children: '' } },
                { type: 'div', props: { style: { fontSize: '20px', fontWeight: '800', color: '#E8E8F0', letterSpacing: '-0.5px' }, children: 'Identidad Artificial' } },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: title.length > 50 ? '44px' : '52px', fontWeight: '800', color: '#E8E8F0', lineHeight: '1.15', letterSpacing: '-2px', maxWidth: '1000px' },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '16px' },
                    children: [
                      { type: 'div', props: { style: { background: accent, color: '#fff', fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '4px' }, children: category } },
                      { type: 'div', props: { style: { fontSize: '16px', color: '#606080' }, children: date } },
                    ],
                  },
                },
                { type: 'div', props: { style: { fontSize: '16px', color: '#404060', fontWeight: '500' }, children: 'identidadartificial.com' } },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200, height: 630,
      fonts: [
        { name: 'Inter', data: FONT_REGULAR, weight: 400, style: 'normal' },
        { name: 'Inter', data: FONT_BOLD, weight: 700, style: 'normal' },
        { name: 'Inter', data: FONT_BOLD, weight: 800, style: 'normal' },
      ],
    }
  )
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  return resvg.render().asPng()
}

// Generate per-post OG images
const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
const expectedImages = new Set([
  ...files.map(file => `${basename(file, file.endsWith('.mdx') ? '.mdx' : '.md')}.png`),
  'default.png',
])

for (const image of readdirSync(OUT_DIR).filter(f => f.endsWith('.png'))) {
  if (!expectedImages.has(image)) {
    unlinkSync(join(OUT_DIR, image))
    console.log(`  - removed stale /og/${image}`)
  }
}

for (const file of files) {
  const slug = basename(file, file.endsWith('.mdx') ? '.mdx' : '.md')
  const content = readFileSync(join(POSTS_DIR, file), 'utf-8')
  const fm = parseFrontmatter(content)

  const title = truncate(fm.title ?? slug, 80)
  const category = fm.category ?? 'Blog'
  const accent = categoryColor(category)
  const date = fm.pubDate
    ? new Date(fm.pubDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const png = await renderOG({ title, category, date, accent })
  writeFileSync(join(OUT_DIR, `${slug}.png`), png)
  console.log(`  ✓ /og/${slug}.png`)
}

// Generate default OG image
const defaultSvg = await satori(
  {
    type: 'div',
    props: {
      style: { width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', background: '#13131F', padding: '80px', fontFamily: 'Inter', gap: '24px' },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '16px' },
            children: [
              { type: 'div', props: { style: { width: '6px', height: '48px', background: '#7C3AED', borderRadius: '3px' }, children: '' } },
              { type: 'div', props: { style: { fontSize: '56px', fontWeight: '800', color: '#E8E8F0', letterSpacing: '-2px' }, children: 'Identidad Artificial' } },
            ],
          },
        },
        { type: 'div', props: { style: { fontSize: '24px', color: '#A0A0C0', fontWeight: '400', maxWidth: '800px', lineHeight: '1.5' }, children: 'Artículos técnicos sobre inteligencia artificial — generados por Claude, revisados por humanos.' } },
        { type: 'div', props: { style: { fontSize: '18px', color: '#404060', marginTop: '16px' }, children: 'identidadartificial.com' } },
      ],
    },
  },
  {
    width: 1200, height: 630,
    fonts: [
      { name: 'Inter', data: FONT_REGULAR, weight: 400, style: 'normal' },
      { name: 'Inter', data: FONT_BOLD, weight: 800, style: 'normal' },
    ],
  }
)
const defaultPng = new Resvg(defaultSvg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
writeFileSync(join(OUT_DIR, 'default.png'), defaultPng)
console.log('  ✓ /og/default.png')
