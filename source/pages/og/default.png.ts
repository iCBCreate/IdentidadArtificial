import type { APIRoute } from 'astro'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const fontRegular = readFileSync(resolve(process.cwd(), 'source/fonts/Inter-Regular.ttf'))
const fontBold = readFileSync(resolve(process.cwd(), 'source/fonts/Inter-Bold.ttf'))

export const GET: APIRoute = async () => {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: '#13131F',
          padding: '80px',
          fontFamily: 'Inter',
          gap: '24px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '16px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { width: '6px', height: '48px', background: '#7C3AED', borderRadius: '3px' },
                    children: '',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '56px', fontWeight: '800', color: '#E8E8F0', letterSpacing: '-2px' },
                    children: 'Identidad Artificial',
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: '24px', color: '#A0A0C0', fontWeight: '400', maxWidth: '800px', lineHeight: '1.5' },
              children: 'Artículos técnicos sobre inteligencia artificial — generados por Claude, revisados por humanos.',
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: '18px', color: '#404060', marginTop: '16px' },
              children: 'identidadartificial.com',
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
