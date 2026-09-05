import { getSortedPosts } from '../../lib/posts'
export const prerender = true
export async function GET() {
  const posts = await getSortedPosts()
  return new Response(JSON.stringify(posts.map(post => ({ title: post.data.title, description: post.data.description, tags: post.data.tags, pubDate: post.data.pubDate.toISOString(), url: `/${post.id}/` }))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
}
