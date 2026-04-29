import { getCollection } from 'astro:content'
import { SITE } from '../config'

export async function GET() {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )

  const header = `# ${SITE.name}
# ${SITE.url}

> ${SITE.description}

Autor: ${SITE.author}
Idioma: Español
Generado por: Claude (Anthropic) con revisión humana
Política: Contenido indexable por IA citando fuente (identidadartificial.com) y autor (${SITE.author})

Total artículos: ${posts.length}

`

  const articles = posts.map(post => {
    const url = `${SITE.url}/${post.id}/`
    const date = post.data.pubDate.toISOString().split('T')[0]

    return `${'='.repeat(80)}
# ${post.data.title}
URL: ${url}
Fecha: ${date}
Categoría: ${post.data.category}
Tags: ${post.data.tags.join(', ')}
Descripción: ${post.data.description}
${'='.repeat(80)}

${post.body}

`
  })

  const body = header + articles.join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
