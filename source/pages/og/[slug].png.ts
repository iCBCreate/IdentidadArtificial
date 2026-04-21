import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const fontRegular = readFileSync(resolve(process.cwd(), 'source/fonts/Inter-Regular.ttf'))
const fontBold = readFileSync(resolve(process.cwd(), 'source/fonts/Inter-Bold.ttf'))

const categoryColors: Record<string, string> = {
  'modelos':                '#7C3AED',
  'inteligencia-artificial': '#2563EB',
  'conceptos':               '#059669',
  'arquitectura':            '#EA580C',
  'herramientas':            '#CA8A04',
  'ética':                   '#9333EA',
  'tendencias':              '#0284C7',
}

function categoryColor(cat: string): string {
  return categoryColors[cat.toLowerCase().replace(/\s+/g, '-')] ?? '#7C3AED'
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as any
  const title = truncate(post.data.title, 80)
  const category = post.data.category as string
  const accent = categoryColor(category)
  const date = new Date(post.data.pubDate).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#13131F',
          padding: '64px',
          fontFamily: 'Inter',
        },
        children: [
          // Top bar: site name + accent line
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '16px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '4px', height: '32px',
                      background: accent,
                      borderRadius: '2px',
                    },
                    children: '',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '20px', fontWeight: '800', color: '#E8E8F0', letterSpacing: '-0.5px' },
                    children: 'Identidad Artificial',
                  },
                },
              ],
            },
          },

          // Title
          {
            type: 'div',
            props: {
              style: {
                fontSize: title.length > 50 ? '44px' : '52px',
                fontWeight: '800',
                color: '#E8E8F0',
                lineHeight: '1.15',
                letterSpacing: '-2px',
                maxWidth: '1000px',
              },
              children: title,
            },
          },

          // Bottom: category + date + url
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
                      {
                        type: 'div',
                        props: {
                          style: {
                            background: accent,
                            color: '#fff',
                            fontSize: '13px',
                            fontWeight: '700',
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase',
                            padding: '6px 14px',
                            borderRadius: '4px',
                          },
                          children: category,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: '16px', color: '#606080' },
                          children: date,
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '16px', color: '#404060', fontWeight: '500' },
                    children: 'identidadartificial.com',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
        { name: 'Inter', data: fontBold, weight: 800, style: 'normal' },
      ],
    }
  )

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  const png = resvg.render().asPng()

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  })
}
