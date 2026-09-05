export function normalizeSearch(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim()
}
export function searchArticles(articles, query) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean)
  return articles.filter(article => {
    const haystack = normalizeSearch([article.title, article.description, ...(article.tags ?? [])].join(' '))
    return terms.every(term => haystack.includes(term))
  }).sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf())
}
export function selectRelated(currentSlug, category, posts, semantic = []) {
  const ordered = [...semantic.map(item => posts.find(post => post.id === item.slug)), ...posts.filter(post => post.data.category === category).sort((a,b) => b.data.pubDate - a.data.pubDate)]
  const seen = new Set([currentSlug])
  return ordered.filter(post => { if (!post || seen.has(post.id)) return false; seen.add(post.id); return true }).slice(0, 3)
}
