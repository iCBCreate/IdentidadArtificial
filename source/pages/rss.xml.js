import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { SITE } from '../config'

export async function GET(context) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    xmlns: {
      media: 'http://search.yahoo.com/mrss/',
    },
    items: posts.slice(0, 20).map(post => {
      const postUrl = new URL(`/${post.id}/`, context.site)
      const imageUrl = new URL(`/og/${post.id}.png`, context.site)

      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: postUrl.pathname,
        customData: [
          `<media:content url="${imageUrl.href}" medium="image" type="image/png" width="1200" height="630" />`,
          `<enclosure url="${imageUrl.href}" type="image/png" length="0" />`,
        ].join(''),
      }
    }),
    customData: `<language>es-es</language>`,
  })
}
