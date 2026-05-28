export const AXIS_START = 2022
export const AXIS_END   = 2027

export interface AIModel {
  name:        string
  company:     string
  date:        string
  dateValue:   number
  description: string
  color:       string
}

export function toDateValue(year: number, month: number): number {
  return year + (month - 1) / 12
}

export function toPct(dateValue: number): number {
  const raw = (dateValue - AXIS_START) / (AXIS_END - AXIS_START) * 100
  return Math.max(0, Math.min(100, raw))
}

export const AI_MODELS: AIModel[] = [
  // OpenAI
  { name: 'GPT-3.5',    company: 'OpenAI',    date: 'Nov 2022', dateValue: toDateValue(2022, 11), color: '#10A37F', description: 'Lanzó ChatGPT al mundo. Primer modelo masivo de lenguaje accesible para todos.' },
  { name: 'GPT-4',      company: 'OpenAI',    date: 'Mar 2023', dateValue: toDateValue(2023,  3), color: '#10A37F', description: 'Gran salto en razonamiento. Multimodal: entendía texto e imágenes por primera vez.' },
  { name: 'GPT-4o',     company: 'OpenAI',    date: 'May 2024', dateValue: toDateValue(2024,  5), color: '#10A37F', description: 'Más rápido y barato que GPT-4. Audio, imagen y texto unificados en un solo modelo.' },
  { name: 'o1',         company: 'OpenAI',    date: 'Sep 2024', dateValue: toDateValue(2024,  9), color: '#10A37F', description: 'El primer modelo que "piensa" antes de responder. Razonamiento multi-paso para matemáticas y código.' },
  { name: 'o3',         company: 'OpenAI',    date: 'Dic 2024', dateValue: toDateValue(2024, 12), color: '#10A37F', description: 'Razonamiento profundo de siguiente nivel. Récord en benchmarks matemáticos, científicos y de programación.' },
  { name: 'GPT-4.1',    company: 'OpenAI',    date: 'Abr 2025', dateValue: toDateValue(2025,  4), color: '#10A37F', description: 'Mejora enfocada en seguimiento de instrucciones y tareas de agente largas. Optimizado para producción.' },
  { name: 'GPT-5',      company: 'OpenAI',    date: 'May 2025', dateValue: toDateValue(2025,  5), color: '#10A37F', description: 'Unifica velocidad de GPT-4o y razonamiento de o3. El modelo más capaz de OpenAI hasta la fecha.' },

  // Claude (Anthropic)
  { name: 'Claude 1',        company: 'Claude', date: 'Mar 2023', dateValue: toDateValue(2023,  3), color: '#CC785C', description: 'Primera respuesta de Anthropic a GPT. Enfocado en seguridad y reducir alucinaciones.' },
  { name: 'Claude 2',        company: 'Claude', date: 'Jul 2023', dateValue: toDateValue(2023,  7), color: '#CC785C', description: 'Contexto de 100 000 tokens — el doble que la competencia. Ideal para analizar documentos largos.' },
  { name: 'Claude 3 Opus',   company: 'Claude', date: 'Mar 2024', dateValue: toDateValue(2024,  3), color: '#CC785C', description: 'Superó a GPT-4 en benchmarks clave. La familia Haiku / Sonnet / Opus introdujo distintas velocidades y precios.' },
  { name: 'Claude 3.5 Sonnet', company: 'Claude', date: 'Jun 2024', dateValue: toDateValue(2024,  6), color: '#CC785C', description: 'El modelo más usado de Anthropic. Equilibrio perfecto entre velocidad, coste e inteligencia. Referente en coding.' },
  { name: 'Claude 3.7 Sonnet', company: 'Claude', date: 'Feb 2025', dateValue: toDateValue(2025,  2), color: '#CC785C', description: 'Primer modelo de Anthropic con razonamiento extendido activable. Lidera benchmarks de programación.' },
  { name: 'Claude Sonnet 4',   company: 'Claude', date: 'May 2025', dateValue: toDateValue(2025,  5), color: '#CC785C', description: 'Generación 4 de Claude. Razonamiento y codificación de frontera. Motor de Claude Code y agentes autónomos.' },
  { name: 'Claude Opus 4',     company: 'Claude', date: 'May 2025', dateValue: toDateValue(2025,  5), color: '#CC785C', description: 'El modelo más potente de Anthropic. Diseñado para tareas de agente complejas y razonamiento de máxima profundidad.' },
  { name: 'Claude Opus 4.8',   company: 'Claude', date: 'May 2026', dateValue: toDateValue(2026,  5), color: '#CC785C', description: 'Mejoras en codificación, razonamiento y agentes autónomos. 4× menos propenso a ignorar defectos en código. Modo rápido 2.5× más veloz y 3× más económico.' },

  // Gemini (Google)
  { name: 'Gemini 1.0',      company: 'Gemini', date: 'Dic 2023', dateValue: toDateValue(2023, 12), color: '#8AB4F8', description: 'Primer modelo nativo multimodal de Google. Integrado en todo el ecosistema Google.' },
  { name: 'Gemini 1.5 Pro',  company: 'Gemini', date: 'May 2024', dateValue: toDateValue(2024,  5), color: '#8AB4F8', description: 'Contexto de 1 millón de tokens. Podía analizar libros enteros u horas de vídeo de un tirón.' },
  { name: 'Gemini 2.0 Flash', company: 'Gemini', date: 'Feb 2025', dateValue: toDateValue(2025,  2), color: '#8AB4F8', description: 'Velocidad de inferencia muy alta con capacidades multimodales nativas. Base de los agentes de Google.' },
  { name: 'Gemini 2.5 Pro',  company: 'Gemini', date: 'Mar 2025', dateValue: toDateValue(2025,  3), color: '#8AB4F8', description: 'El modelo más capaz de Google. Razonamiento avanzado, compite con o3 y Claude en ciencia y código.' },
  { name: 'Gemini 2.5 Flash', company: 'Gemini', date: 'May 2025', dateValue: toDateValue(2025,  5), color: '#8AB4F8', description: 'Versión rápida y económica de Gemini 2.5. Razonamiento activable con coste mínimo.' },
  { name: 'Gemini 3.5 Flash', company: 'Gemini', date: 'May 2026', dateValue: toDateValue(2026,  5), color: '#8AB4F8', description: '4× más rápido que otros modelos de frontera con inteligencia equiparable a los modelos insignia. Lidera en agentes, programación y multimodalidad.' },
  { name: 'Gemini 3.5 Pro',   company: 'Gemini', date: 'Jun 2026', dateValue: toDateValue(2026,  6), color: '#8AB4F8', description: 'Modelo insignia de la serie 3.5. Anunciado en mayo 2026, lanzamiento público en junio. Máxima capacidad de la familia Gemini.' },

  // Meta
  { name: 'Llama 3',    company: 'Meta',      date: 'Abr 2024', dateValue: toDateValue(2024,  4), color: '#0668E1', description: 'El modelo open source más descargado de la historia. Igualó a GPT-3.5 y se ejecuta en local.' },
  { name: 'Llama 3.1',  company: 'Meta',      date: 'Jul 2024', dateValue: toDateValue(2024,  7), color: '#0668E1', description: 'Versión 405B competidora directa de GPT-4. Open source con contexto de 128k tokens.' },
  { name: 'Llama 4',    company: 'Meta',      date: 'Abr 2025', dateValue: toDateValue(2025,  4), color: '#0668E1', description: 'Arquitectura Mixture of Experts (MoE). Multimodal nativo. Lidera los rankings open source.' },

  // DeepSeek
  { name: 'DeepSeek V2',  company: 'DeepSeek', date: 'May 2024', dateValue: toDateValue(2024,  5), color: '#5B8DEF', description: 'Modelo chino open source. Igualó a GPT-4 con una fracción del coste de entrenamiento.' },
  { name: 'DeepSeek V3',  company: 'DeepSeek', date: 'Dic 2024', dateValue: toDateValue(2024, 12), color: '#5B8DEF', description: 'Rendimiento de frontera a coste mínimo. Cuestionó la ventaja tecnológica occidental.' },
  { name: 'DeepSeek R1',  company: 'DeepSeek', date: 'Ene 2025', dateValue: toDateValue(2025,  1), color: '#5B8DEF', description: 'Razonamiento open source rival de o1. Su lanzamiento sacudió la industria y hundió bolsas tecnológicas.' },

  // Grok (xAI)
  { name: 'Grok 1',  company: 'Grok', date: 'Nov 2023', dateValue: toDateValue(2023, 11), color: '#9BA3AF', description: 'Modelo de xAI integrado en X (Twitter). Acceso único a datos en tiempo real de la red social.' },
  { name: 'Grok 2',  company: 'Grok', date: 'Ago 2024', dateValue: toDateValue(2024,  8), color: '#9BA3AF', description: 'Competidor serio de GPT-4o. Generación de imágenes con el modelo Aurora integrado.' },
  { name: 'Grok 3',  company: 'Grok', date: 'Feb 2025', dateValue: toDateValue(2025,  2), color: '#9BA3AF', description: '10× más cómputo que Grok 2. Modo DeepSearch para razonamiento profundo paso a paso.' },
]

export const COMPANIES = [...new Set(AI_MODELS.map(m => m.company))]
