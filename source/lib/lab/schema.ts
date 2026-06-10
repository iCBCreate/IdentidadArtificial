// JSON-LD compartido de las demos del laboratorio
import { SITE } from '../../config'

export interface LabDemoMeta {
  slug: string
  name: string
  description: string
}

export const LAB_DEMOS: LabDemoMeta[] = [
  {
    slug: 'tokenizador',
    name: 'Tokenizador interactivo',
    description: 'Visualiza cómo un LLM trocea tu texto en tokens, en tiempo real y sin enviar nada a ningún servidor.',
  },
  {
    slug: 'sampling',
    name: 'Simulador de temperatura y sampling',
    description: 'Experimenta con temperatura, top-k y top-p sobre una distribución real de probabilidades y observa cómo cambia la elección del siguiente token.',
  },
  {
    slug: 'calculadora-contexto',
    name: 'Calculadora de contexto y costes',
    description: 'Compara cuánto costaría tu texto en los principales LLMs y qué porcentaje de su ventana de contexto ocupa.',
  },
  {
    slug: 'embeddings',
    name: 'Explorador de embeddings',
    description: 'Genera embeddings reales en tu navegador con un modelo multilingüe y visualiza la similitud semántica entre frases en un mapa 2D.',
  },
]

export function webAppSchema(demo: LabDemoMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${SITE.url}/laboratorio/${demo.slug}/`,
    name: demo.name,
    description: demo.description,
    url: `${SITE.url}/laboratorio/${demo.slug}/`,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript',
    inLanguage: 'es',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  }
}

export function collectionSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE.url}/laboratorio/`,
    name: 'Laboratorio de IA',
    description: 'Demos interactivas para entender cómo funcionan los LLM por dentro: tokenización, sampling, ventanas de contexto y embeddings. Todo se ejecuta en tu navegador.',
    url: `${SITE.url}/laboratorio/`,
    inLanguage: 'es',
    hasPart: LAB_DEMOS.map(d => webAppSchema(d)),
  }
}
