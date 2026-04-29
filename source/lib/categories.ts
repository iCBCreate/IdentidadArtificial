export const BLOG_CATEGORIES = [
  'Modelos',
  'Inteligencia Artificial',
  'Conceptos',
  'Arquitectura',
  'Herramientas',
  'Ética',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

type CategoryConfig = {
  gradient: string
  icon: string
}

export const CATEGORY_CONFIG: Record<BlogCategory, CategoryConfig> = {
  Modelos: {
    gradient: 'linear-gradient(135deg, #1a1035 0%, #2d1b69 100%)',
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="10" stroke="#A78BFA" stroke-width="2"/>
      <circle cx="24" cy="24" r="3" fill="#A78BFA"/>
      <line x1="24" y1="8" x2="24" y2="14" stroke="#A78BFA" stroke-width="2" stroke-linecap="round"/>
      <line x1="24" y1="34" x2="24" y2="40" stroke="#A78BFA" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="24" x2="14" y2="24" stroke="#A78BFA" stroke-width="2" stroke-linecap="round"/>
      <line x1="34" y1="24" x2="40" y2="24" stroke="#A78BFA" stroke-width="2" stroke-linecap="round"/>
      <line x1="12.7" y1="12.7" x2="17" y2="17" stroke="#A78BFA" stroke-width="2" stroke-linecap="round"/>
      <line x1="31" y1="31" x2="35.3" y2="35.3" stroke="#A78BFA" stroke-width="2" stroke-linecap="round"/>
      <line x1="35.3" y1="12.7" x2="31" y2="17" stroke="#A78BFA" stroke-width="2" stroke-linecap="round"/>
      <line x1="17" y1="31" x2="12.7" y2="35.3" stroke="#A78BFA" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  'Inteligencia Artificial': {
    gradient: 'linear-gradient(135deg, #0f1f35 0%, #0e3460 100%)',
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="14" width="28" height="20" rx="4" stroke="#60A5FA" stroke-width="2"/>
      <circle cx="17" cy="22" r="2.5" fill="#60A5FA"/>
      <circle cx="24" cy="22" r="2.5" fill="#60A5FA"/>
      <circle cx="31" cy="22" r="2.5" fill="#60A5FA"/>
      <line x1="17" y1="27" x2="31" y2="27" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="10" x2="16" y2="14" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
      <line x1="24" y1="10" x2="24" y2="14" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
      <line x1="32" y1="10" x2="32" y2="14" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="34" x2="16" y2="38" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
      <line x1="24" y1="34" x2="24" y2="38" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
      <line x1="32" y1="34" x2="32" y2="38" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  Conceptos: {
    gradient: 'linear-gradient(135deg, #0f2820 0%, #064e3b 100%)',
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 8C18 8 13 13 13 19c0 4 2 7.5 5 9.5V32h12v-3.5c3-2 5-5.5 5-9.5 0-6-5-11-11-11z" stroke="#34D399" stroke-width="2" stroke-linejoin="round"/>
      <line x1="18" y1="36" x2="30" y2="36" stroke="#34D399" stroke-width="2" stroke-linecap="round"/>
      <line x1="20" y1="40" x2="28" y2="40" stroke="#34D399" stroke-width="2" stroke-linecap="round"/>
      <line x1="24" y1="8" x2="24" y2="5" stroke="#34D399" stroke-width="2" stroke-linecap="round"/>
      <line x1="36" y1="19" x2="39" y2="19" stroke="#34D399" stroke-width="2" stroke-linecap="round"/>
      <line x1="9" y1="19" x2="12" y2="19" stroke="#34D399" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  Arquitectura: {
    gradient: 'linear-gradient(135deg, #1f1200 0%, #451a03 100%)',
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="8,34 18,18 28,26 38,12" stroke="#FB923C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="6" y="32" width="8" height="8" rx="1" stroke="#FB923C" stroke-width="2"/>
      <rect x="20" y="22" width="8" height="18" rx="1" stroke="#FB923C" stroke-width="2"/>
      <rect x="34" y="16" width="8" height="24" rx="1" stroke="#FB923C" stroke-width="2"/>
    </svg>`,
  },
  Herramientas: {
    gradient: 'linear-gradient(135deg, #1a1a0f 0%, #3d3d00 100%)',
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 10a8 8 0 0 0-8 8c0 1 .2 2 .5 2.8L10 33a2.8 2.8 0 1 0 4 4l12.2-12.5c.8.3 1.8.5 2.8.5a8 8 0 1 0 1-15z" stroke="#FBBF24" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="30" cy="18" r="2" fill="#FBBF24"/>
    </svg>`,
  },
  Ética: {
    gradient: 'linear-gradient(135deg, #1f0f2e 0%, #4c1d95 100%)',
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 8l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9z" stroke="#C084FC" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  },
}
