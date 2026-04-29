import { getCollection, type CollectionEntry } from 'astro:content'

export const HOME_PAGE_SIZE = 3
export const ARCHIVE_PAGE_SIZE = 6

export type BlogPost = CollectionEntry<'blog'>

export function calcReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min`
}

export async function getSortedPosts(): Promise<BlogPost[]> {
  return (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize)
}

export function getPageItems<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice((page - 1) * pageSize, page * pageSize)
}

export function getPostCategories(posts: BlogPost[]): BlogPost['data']['category'][] {
  return [...new Set(posts.map(post => post.data.category))]
}
