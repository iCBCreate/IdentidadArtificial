// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
// Note: srcDir is set to 'source/' because the default 'src/' conflicts with
// the existing 'SRC/' requirements folder on macOS case-insensitive filesystem.
export default defineConfig({
  srcDir: './source',
  integrations: [mdx(), sitemap()],
});