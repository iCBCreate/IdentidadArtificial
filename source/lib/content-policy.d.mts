type EditorialData = { pubDate: Date | string; updatedAt?: Date | string }
type TagPost = { id: string; data: { tags?: string[] } }
type EditorialPost = { id: string; data: EditorialData & { category: string; tags?: string[] } }
export const RETIRED_PATHS: Set<string>
export const RETIRED_PREFIXES: string[]
export const CONDITIONAL_TAXONOMY_TAGS: Set<string>
export function normalizePath(pathname: string): string
export function isRetiredPath(pathname: string): boolean
export function getRetiredResponse(pathname: string, eligibleTags?: ReadonlySet<string>): Response | null
export function isSitemapPath(pathname: string, eligibleTags?: ReadonlySet<string>): boolean
export function getEligibleTags(posts: readonly TagPost[]): Set<string>
export function getModifiedDate(data: EditorialData): Date
export function buildEditorialLastmod(posts: readonly EditorialPost[], tutorials: readonly { id: string; data: EditorialData }[]): Map<string, Date>
