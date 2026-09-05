import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import matter from 'gray-matter'
import { BLOG_CATEGORIES, CATEGORY_EDITORIAL } from '../source/lib/categories'

test('every category selects real posts from its own corpus', () => {
  for (const category of BLOG_CATEGORIES) {
    const editorial = CATEGORY_EDITORIAL[category]
    assert.ok(editorial.introduction.length > 80)
    assert.ok(editorial.featuredSlugs.length > 0)
    for (const slug of editorial.featuredSlugs) {
      const { data } = matter(readFileSync(`source/content/blog/${slug}.mdx`, 'utf8'))
      assert.equal(data.category, category)
    }
  }
})
