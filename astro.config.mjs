import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import matter from 'gray-matter'
import { buildEditorialLastmod, isSitemapPath } from './source/lib/content-policy.mjs'

function readEntries(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory).filter(file => /\.mdx?$/.test(file)).map(file => ({
    id: basename(file).replace(/\.mdx?$/, ''),
    data: matter(readFileSync(join(directory, file), 'utf8')).data,
  }))
}
const sitemapLastmodByPath = buildEditorialLastmod(readEntries('source/content/blog'), readEntries('source/content/tutoriales'))

export default defineConfig({
  site: 'https://identidadartificial.com',
  srcDir: './source',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    mdx({ gfm: true }),
    sitemap({
      filter: (page) =>
        isSitemapPath(new URL(page).pathname),
      serialize(item) {
        const pathname = new URL(item.url).pathname
        const lastmod = sitemapLastmodByPath.get(pathname)

        if (lastmod) {
          item.lastmod = lastmod.toISOString()
        }

        return item
      },
    }),
  ],
  adapter: cloudflare({ imageService: 'compile' }),
  image: {
    format: ['avif', 'webp'],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        quality: 30,
      }
    }
  },
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()]
  }
})
