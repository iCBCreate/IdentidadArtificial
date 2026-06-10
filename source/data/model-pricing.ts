// Precios y ventanas de contexto de modelos actuales para la calculadora del laboratorio.
// Separado de ai-models.ts (timeline histórico): aquí solo modelos en servicio con precio público.
// Precios en USD por millón de tokens. Revisar `updated` antes de fiarse de las cifras.

export interface PricedModel {
  id: string
  name: string
  company: string
  contextWindow: number
  inputPerMTok: number
  outputPerMTok: number
  updated: string
}

// Colores por empresa, alineados con los usados en ai-models.ts (timeline)
export const COMPANY_COLORS: Record<string, string> = {
  OpenAI: '#10A37F',
  Anthropic: '#CC785C',
  Google: '#8AB4F8',
  Meta: '#0668E1',
  DeepSeek: '#5B8DEF',
}

export const PRICED_MODELS: PricedModel[] = [
  {
    id: 'claude-fable-5',
    name: 'Claude Fable 5',
    company: 'Anthropic',
    contextWindow: 1_000_000,
    inputPerMTok: 10,
    outputPerMTok: 50,
    updated: '2026-06-10',
  },
  {
    id: 'claude-opus-4-8',
    name: 'Claude Opus 4.8',
    company: 'Anthropic',
    contextWindow: 1_000_000,
    inputPerMTok: 5,
    outputPerMTok: 25,
    updated: '2026-06-10',
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    company: 'Anthropic',
    contextWindow: 1_000_000,
    inputPerMTok: 3,
    outputPerMTok: 15,
    updated: '2026-06-10',
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    company: 'Anthropic',
    contextWindow: 200_000,
    inputPerMTok: 1,
    outputPerMTok: 5,
    updated: '2026-06-10',
  },
  {
    id: 'gpt-5.5',
    name: 'GPT-5.5',
    company: 'OpenAI',
    contextWindow: 400_000,
    inputPerMTok: 1.25,
    outputPerMTok: 10,
    updated: '2026-06-10',
  },
  {
    id: 'gpt-5.5-mini',
    name: 'GPT-5.5 mini',
    company: 'OpenAI',
    contextWindow: 400_000,
    inputPerMTok: 0.25,
    outputPerMTok: 2,
    updated: '2026-06-10',
  },
  {
    id: 'gemini-3.5-pro',
    name: 'Gemini 3.5 Pro',
    company: 'Google',
    contextWindow: 1_000_000,
    inputPerMTok: 2.5,
    outputPerMTok: 15,
    updated: '2026-06-10',
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    company: 'Google',
    contextWindow: 1_000_000,
    inputPerMTok: 0.3,
    outputPerMTok: 2.5,
    updated: '2026-06-10',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    company: 'DeepSeek',
    contextWindow: 128_000,
    inputPerMTok: 0.27,
    outputPerMTok: 1.1,
    updated: '2026-06-10',
  },
  {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    company: 'Meta',
    contextWindow: 1_000_000,
    inputPerMTok: 0.27,
    outputPerMTok: 0.85,
    updated: '2026-06-10',
  },
]
