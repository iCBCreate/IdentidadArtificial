import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'

const EXCLUDED_SITEMAP_PATHS = [
  '/pagina/',
  '/archivo/pagina/',
  '/metricas/',
  '/chatgpt-agent-revolucion-openai/',
  '/chatgpt-image-generation-gpt-image-1/',
  '/ia-entrenamiento-pokemon/',
  '/openai-lanza-gpt-oss-novedades-2025/',
  '/tag/comet/',
  '/tag/hugging-face/',
  '/ultimas-novedades-claude-mythos-anthropic/',
]

export default defineConfig({
  site: 'https://identidadartificial.com',
  srcDir: './source',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !EXCLUDED_SITEMAP_PATHS.some(path => page.includes(path)),
    }),
  ],
  adapter: cloudflare({ imageService: 'compile' }),
  image: {
    format: ['avif', 'webp'],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        quality: 60,
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
