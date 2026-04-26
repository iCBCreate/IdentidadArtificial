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
  { name: 'GPT-3.5',         company: 'OpenAI',    date: 'Nov 2022', dateValue: toDateValue(2022, 11), color: '#10A37F', description: 'Lanzó ChatGPT al mundo. Primer modelo masivo de lenguaje accesible para todos.' },
  { name: 'GPT-4',           company: 'OpenAI',    date: 'Mar 2023', dateValue: toDateValue(2023,  3), color: '#10A37F', description: 'Gran salto en razonamiento. Multimodal: entendía texto e imágenes por primera vez.' },
  { name: 'GPT-4o',          company: 'OpenAI',    date: 'May 2024', dateValue: toDateValue(2024,  5), color: '#10A37F', description: 'Más rápido y barato que GPT-4. Audio, imagen y texto unificados en un solo modelo.' },
  { name: 'o3',              company: 'OpenAI',    date: 'Dic 2024', dateValue: toDateValue(2024, 12), color: '#10A37F', description: 'Razonamiento profundo: piensa antes de responder. Récord en benchmarks matemáticos y científicos.' },
  { name: 'GPT-5',           company: 'OpenAI',    date: 'May 2025', dateValue: toDateValue(2025,  5), color: '#10A37F', description: 'Unifica velocidad de GPT-4o y razonamiento de o3. El modelo más capaz de OpenAI hasta la fecha.' },
  // Claude (Anthropic)
  { name: 'Claude 1',        company: 'Claude',    date: 'Mar 2023', dateValue: toDateValue(2023,  3), color: '#CC785C', description: 'Primera respuesta de Anthropic a GPT. Enfocado en seguridad y reducir alucinaciones.' },
  { name: 'Claude 2',        company: 'Claude',    date: 'Jul 2023', dateValue: toDateValue(2023,  7), color: '#CC785C', description: 'Contexto de 100 000 tokens — el doble que la competencia. Ideal para analizar documentos largos.' },
  { name: 'Claude 3 Opus',   company: 'Claude',    date: 'Mar 2024', dateValue: toDateValue(2024,  3), color: '#CC785C', description: 'Superó a GPT-4 en benchmarks clave. Familia Haiku / Sonnet / Opus con distintas velocidades.' },
  { name: 'Claude 4 Sonnet', company: 'Claude',    date: 'Feb 2025', dateValue: toDateValue(2025,  2), color: '#CC785C', description: 'Líder en coding y razonamiento. El modelo detrás de Claude Code y agentes autónomos.' },
  // Gemini (Google)
  { name: 'Gemini 1.0',      company: 'Gemini',    date: 'Dic 2023', dateValue: toDateValue(2023, 12), color: '#8AB4F8', description: 'Primer modelo nativo multimodal de Google. Integrado en todo el ecosistema Google.' },
  { name: 'Gemini 1.5 Pro',  company: 'Gemini',    date: 'May 2024', dateValue: toDateValue(2024,  5), color: '#8AB4F8', description: 'Contexto de 1 millón de tokens. Podía analizar libros enteros u horas de vídeo.' },
  { name: 'Gemini 2.5 Pro',  company: 'Gemini',    date: 'Mar 2025', dateValue: toDateValue(2025,  3), color: '#8AB4F8', description: 'Razonamiento avanzado. Compite con o3 y Claude 4 en tareas científicas y de código.' },
  // DeepSeek
  { name: 'DeepSeek V2',     company: 'DeepSeek',  date: 'May 2024', dateValue: toDateValue(2024,  5), color: '#5B8DEF', description: 'Modelo chino open source. Igualó a GPT-4 con una fracción del coste de entrenamiento.' },
  { name: 'DeepSeek V3',     company: 'DeepSeek',  date: 'Dic 2024', dateValue: toDateValue(2024, 12), color: '#5B8DEF', description: 'Rendimiento de frontera a coste mínimo. Cuestionó la ventaja tecnológica occidental.' },
  { name: 'DeepSeek R1',     company: 'DeepSeek',  date: 'Ene 2025', dateValue: toDateValue(2025,  1), color: '#5B8DEF', description: 'Razonamiento open source rival de o1. Su lanzamiento sacudió la industria y hundió bolsas.' },
  // Grok (xAI)
  { name: 'Grok 1',          company: 'Grok',      date: 'Nov 2023', dateValue: toDateValue(2023, 11), color: '#9BA3AF', description: 'Modelo de xAI integrado en X (Twitter). Acceso único a datos en tiempo real de la red social.' },
  { name: 'Grok 2',          company: 'Grok',      date: 'Ago 2024', dateValue: toDateValue(2024,  8), color: '#9BA3AF', description: 'Competidor serio de GPT-4o. Generación de imágenes con el modelo Aurora integrado.' },
  { name: 'Grok 3',          company: 'Grok',      date: 'Feb 2025', dateValue: toDateValue(2025,  2), color: '#9BA3AF', description: '10× más cómputo que Grok 2. Modo DeepSearch para razonamiento profundo paso a paso.' },
]

export const COMPANIES = [...new Set(AI_MODELS.map(m => m.company))]
