import { defineCollection } from 'astro:content'
import { z } from 'zod'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './source/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string(),
    tags: z.array(z.string()),
    heroImage: image().optional(),
    generatedBy: z.string(),
    generatedAt: z.coerce.date(),
    promptBase: z.string(),
    humanReviewed: z.boolean(),
    correctionNote: z.string().optional(),
  })
})

export const collections = { blog }
