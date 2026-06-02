export const SITE = {
  name: 'Identidad Artificial',
  url: 'https://identidadartificial.com',
  description: 'Artículos técnicos sobre IA generativa, LLMs, modelos de lenguaje y agentes de IA en español. Análisis en profundidad con supervisión humana y transparencia editorial.',
  author: 'Ignacio Cubelas',
  github: 'https://github.com/iCBCreate/IdentidadArtificial',
  linkedin: 'https://www.linkedin.com/in/icubelas',
  locale: 'es-ES',
}

export const AUTHOR_PERSON = {
  '@type': 'Person' as const,
  '@id': `${SITE.url}/sobre/#person`,
  name: SITE.author,
  url: `${SITE.url}/sobre/`,
  description: 'Construye sistemas editoriales con IA generativa. Especializado en LLMs, automatización editorial y arquitectura web con Astro y Cloudflare.',
  sameAs: [SITE.linkedin, SITE.github],
  knowsAbout: [
    'Inteligencia Artificial',
    'Modelos de lenguaje (LLM)',
    'Agentes de IA',
    'Inteligencia artificial generativa',
    'LLMs',
    'Automatización editorial',
    'Arquitectura web',
  ],
}
