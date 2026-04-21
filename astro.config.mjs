import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  site: 'https://identidadartificial.com',
  srcDir: './source',
  trailingSlash: 'always',
  output: 'static',
  integrations: [mdx(), sitemap()],
  adapter: cloudflare(),
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()]
  }
})
