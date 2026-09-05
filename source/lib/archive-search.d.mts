export type SearchArticle = { title: string; description: string; tags?: string[]; pubDate: string; url: string }
export function normalizeSearch(value: unknown): string
export function searchArticles<T extends SearchArticle>(articles: T[], query: string): T[]
export function selectRelated<T extends { id: string; data: { category: string; pubDate: Date } }>(currentSlug: string, category: string, posts: T[], semantic?: readonly {slug: string}[]): T[]
