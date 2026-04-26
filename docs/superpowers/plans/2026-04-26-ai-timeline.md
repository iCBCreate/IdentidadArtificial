# AI Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive swimlane timeline of AI model releases above the posts section on the home page.

**Architecture:** Two new files — a data file (`ai-models.ts`) with all model data and a self-contained Astro component (`AITimeline.astro`) with pure HTML/CSS/inline JS. One edit to `index.astro` to insert the component above the posts section.

**Tech Stack:** Astro, TypeScript, vanilla CSS, vanilla JS (no external libraries)

---

## Files

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `source/data/ai-models.ts` | Model data, types, helper function, axis constants |
| Create | `source/components/AITimeline.astro` | Full timeline component — markup, styles, tooltip JS |
| Modify | `source/pages/index.astro` | Import and insert `<AITimeline />` above posts |

---

### Task 1: Create data file

**Files:**
- Create: `source/data/ai-models.ts`

- [ ] **Step 1: Create the file with types, constants, helper, and all 18 initial models**

```typescript
// source/data/ai-models.ts

export const AXIS_START = 2022
export const AXIS_END   = 2027

export interface AIModel {
  name:        string
  company:     string
  date:        string   // display string, e.g. "May 2024"
  dateValue:   number   // use toDateValue() — never write manually
  description: string   // 1–2 sentences
  color:       string   // hex
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
  { name: 'GPT-3.5',        company: 'OpenAI',    date: 'Nov 2022', dateValue: toDateValue(2022, 11), color: '#10A37F', description: 'Lanzó ChatGPT al mundo. Primer modelo masivo de lenguaje accesible para todos.' },
  { name: 'GPT-4',          company: 'OpenAI',    date: 'Mar 2023', dateValue: toDateValue(2023,  3), color: '#10A37F', description: 'Gran salto en razonamiento. Multimodal: entendía texto e imágenes por primera vez.' },
  { name: 'GPT-4o',         company: 'OpenAI',    date: 'May 2024', dateValue: toDateValue(2024,  5), color: '#10A37F', description: 'Más rápido y barato que GPT-4. Audio, imagen y texto unificados en un solo modelo.' },
  { name: 'o3',             company: 'OpenAI',    date: 'Dic 2024', dateValue: toDateValue(2024, 12), color: '#10A37F', description: 'Razonamiento profundo: piensa antes de responder. Récord en benchmarks matemáticos y científicos.' },
  { name: 'GPT-5',          company: 'OpenAI',    date: 'May 2025', dateValue: toDateValue(2025,  5), color: '#10A37F', description: 'Unifica velocidad de GPT-4o y razonamiento de o3. El modelo más capaz de OpenAI hasta la fecha.' },
  // Claude (Anthropic)
  { name: 'Claude 1',       company: 'Claude',    date: 'Mar 2023', dateValue: toDateValue(2023,  3), color: '#CC785C', description: 'Primera respuesta de Anthropic a GPT. Enfocado en seguridad y reducir alucinaciones.' },
  { name: 'Claude 2',       company: 'Claude',    date: 'Jul 2023', dateValue: toDateValue(2023,  7), color: '#CC785C', description: 'Contexto de 100 000 tokens — el doble que la competencia. Ideal para analizar documentos largos.' },
  { name: 'Claude 3 Opus',  company: 'Claude',    date: 'Mar 2024', dateValue: toDateValue(2024,  3), color: '#CC785C', description: 'Superó a GPT-4 en benchmarks clave. Familia Haiku / Sonnet / Opus con distintas velocidades.' },
  { name: 'Claude 4 Sonnet',company: 'Claude',    date: 'Feb 2025', dateValue: toDateValue(2025,  2), color: '#CC785C', description: 'Líder en coding y razonamiento. El modelo detrás de Claude Code y agentes autónomos.' },
  // Gemini (Google)
  { name: 'Gemini 1.0',     company: 'Gemini',    date: 'Dic 2023', dateValue: toDateValue(2023, 12), color: '#8AB4F8', description: 'Primer modelo nativo multimodal de Google. Integrado en todo el ecosistema Google.' },
  { name: 'Gemini 1.5 Pro', company: 'Gemini',    date: 'May 2024', dateValue: toDateValue(2024,  5), color: '#8AB4F8', description: 'Contexto de 1 millón de tokens. Podía analizar libros enteros u horas de vídeo.' },
  { name: 'Gemini 2.5 Pro', company: 'Gemini',    date: 'Mar 2025', dateValue: toDateValue(2025,  3), color: '#8AB4F8', description: 'Razonamiento avanzado. Compite con o3 y Claude 4 en tareas científicas y de código.' },
  // DeepSeek
  { name: 'DeepSeek V2',    company: 'DeepSeek',  date: 'May 2024', dateValue: toDateValue(2024,  5), color: '#5B8DEF', description: 'Modelo chino open source. Igualó a GPT-4 con una fracción del coste de entrenamiento.' },
  { name: 'DeepSeek V3',    company: 'DeepSeek',  date: 'Dic 2024', dateValue: toDateValue(2024, 12), color: '#5B8DEF', description: 'Rendimiento de frontera a coste mínimo. Cuestionó la ventaja tecnológica occidental.' },
  { name: 'DeepSeek R1',    company: 'DeepSeek',  date: 'Ene 2025', dateValue: toDateValue(2025,  1), color: '#5B8DEF', description: 'Razonamiento open source rival de o1. Su lanzamiento sacudió la industria y hundió bolsas.' },
  // Grok (xAI)
  { name: 'Grok 1',         company: 'Grok',      date: 'Nov 2023', dateValue: toDateValue(2023, 11), color: '#9BA3AF', description: 'Modelo de xAI integrado en X (Twitter). Acceso único a datos en tiempo real de la red social.' },
  { name: 'Grok 2',         company: 'Grok',      date: 'Ago 2024', dateValue: toDateValue(2024,  8), color: '#9BA3AF', description: 'Competidor serio de GPT-4o. Generación de imágenes con el modelo Aurora integrado.' },
  { name: 'Grok 3',         company: 'Grok',      date: 'Feb 2025', dateValue: toDateValue(2025,  2), color: '#9BA3AF', description: '10× más cómputo que Grok 2. Modo DeepSearch para razonamiento profundo paso a paso.' },
]

export const COMPANIES = [...new Set(AI_MODELS.map(m => m.company))]
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/ignaciocubelasfortes/Documents/Antigravity/IdentidadArtificial
npx astro check 2>&1 | head -30
```

Expected: no errors in `source/data/ai-models.ts`

- [ ] **Step 3: Commit**

```bash
git add source/data/ai-models.ts
git commit -m "feat: add AI models data file with timeline constants and helper"
```

---

### Task 2: Create AITimeline component

**Files:**
- Create: `source/components/AITimeline.astro`

- [ ] **Step 1: Create the component**

```astro
---
// source/components/AITimeline.astro
import { AI_MODELS, COMPANIES, AXIS_START, AXIS_END, toPct } from '../data/ai-models'

const modelsByCompany = Object.fromEntries(
  COMPANIES.map(co => [co, AI_MODELS.filter(m => m.company === co)])
)

const yearCount = AXIS_END - AXIS_START
const years = Array.from({ length: yearCount + 1 }, (_, i) => AXIS_START + i)
---

<section class="tl-section">
  <h2 class="tl-heading">Evolución de modelos de IA</h2>

  <div class="tl-wrap">
    <div class="tl-scroll">
      <div class="tl-inner">

        <!-- Year axis -->
        <div class="year-axis">
          <div class="axis-spacer"></div>
          <div class="axis-ticks">
            {years.map(y => <span class="year-tick">{y}</span>)}
          </div>
        </div>

        <!-- Lanes -->
        {COMPANIES.map(company => {
          const models = modelsByCompany[company]
          if (!models.length) return null
          const color = models[0].color
          return (
            <div class="lane">
              <div class="lane-name" style={`color: ${color}`}>{company}</div>
              <div class="lane-track">
                {models.map(model => (
                  <button
                    class="dot"
                    style={`left: ${toPct(model.dateValue)}%; background: ${color}`}
                    data-name={model.name}
                    data-date={model.date}
                    data-desc={model.description}
                    aria-label={`${model.name} — ${model.date}`}
                  />
                ))}
              </div>
            </div>
          )
        })}

      </div>
    </div>

    <!-- Legend -->
    <div class="legend">
      {COMPANIES.map(co => {
        const color = AI_MODELS.find(m => m.company === co)!.color
        return (
          <div class="legend-item">
            <span class="legend-dot" style={`background: ${color}`}></span>
            <span>{co}</span>
          </div>
        )
      })}
    </div>

    <p class="mobile-hint">← desliza →</p>
  </div>
</section>

<!-- Tooltip — position: fixed, outside scroll context, single instance per page -->
<div id="tt" role="tooltip" aria-hidden="true">
  <div id="tt-arrow"></div>
  <p id="tt-name"></p>
  <p id="tt-date"></p>
  <p id="tt-desc"></p>
</div>

<style>
.tl-section {
  max-width: 64rem; /* 5xl */
  margin: 0 auto;
  padding: 0 1.5rem 2.5rem;
}

.tl-heading {
  font-size: 0.625rem;
  font-weight: 600;
  color: #A0A0C0;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  border-bottom: 1px solid #2A2A40;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.tl-wrap {
  border: 1px solid #2A2A40;
  border-radius: 8px;
  background: #13131F;
  padding: 20px 0 14px;
  position: relative;
}

/* Right-edge fade — must be on tl-wrap (non-scrolling) */
.tl-wrap::after {
  content: '';
  position: absolute;
  right: 0; top: 0; bottom: 0; width: 56px;
  background: linear-gradient(to right, transparent, #13131F);
  border-radius: 0 8px 8px 0;
  pointer-events: none;
  z-index: 4;
}

.tl-scroll {
  overflow-x: auto;
  padding: 0 20px 8px;
  scrollbar-width: thin;
  scrollbar-color: #2A2A40 transparent;
}
.tl-scroll::-webkit-scrollbar { height: 4px; }
.tl-scroll::-webkit-scrollbar-thumb { background: #2A2A40; border-radius: 2px; }

.tl-inner { min-width: 720px; }

/* Year axis */
.year-axis {
  display: flex;
  margin-bottom: 10px;
}
.axis-spacer { width: 76px; flex-shrink: 0; }
.axis-ticks  { flex: 1; display: flex; }
.year-tick {
  flex: 1; font-size: 9px; color: #3A3A5A;
  position: relative;
}
.year-tick::before {
  content: ''; position: absolute;
  left: 0; top: 100%; width: 1px; height: 6px; background: #2A2A40;
}

/* Lanes */
.lane { display: flex; align-items: center; margin-bottom: 8px; }
.lane-name {
  width: 72px; font-size: 10px; font-weight: 600;
  text-align: right; padding-right: 12px; flex-shrink: 0;
}
.lane-track {
  flex: 1; height: 30px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid #2A2A40;
  border-radius: 4px;
  position: relative;
  /* overflow must be visible so dots' hover ring shows */
  overflow: visible;
}

/* Dots */
.dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px; height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.12s, box-shadow 0.12s;
}
.dot:hover,
.dot:focus-visible {
  transform: translate(-50%, -50%) scale(1.5);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15);
  outline: none;
  z-index: 5;
}

@media (max-width: 640px) {
  .dot { width: 16px; height: 16px; }
}

/* Legend */
.legend {
  display: flex; gap: 14px; flex-wrap: wrap;
  padding: 10px 20px 0;
}
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #A0A0C0; }
.legend-dot  { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

.mobile-hint { text-align: center; font-size: 10px; color: #3A3A5A; padding-top: 6px; letter-spacing: 1px; }

/* Tooltip */
#tt {
  display: none;
  position: fixed;
  z-index: 9999;
  background: #1E1E3A;
  border: 1px solid #3A3A5A;
  border-radius: 8px;
  padding: 10px 12px;
  width: 190px;
  pointer-events: none;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.7);
}
#tt.tt-visible { display: block; }
#tt-arrow {
  position: absolute;
  width: 0; height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
}
#tt-arrow.tt-up   { border-bottom: 6px solid #3A3A5A; bottom: 100%; }
#tt-arrow.tt-down { border-top:    6px solid #3A3A5A; top: 100%;    }
#tt-name { font-size: 12px; font-weight: 700; color: #E8E8F0; margin: 0 0 2px; }
#tt-date { font-size: 10px; color: #6A6A8A; margin: 0 0 6px; }
#tt-desc { font-size: 11px; color: #A0A0C0; line-height: 1.5; margin: 0; }
</style>

<script>
(function () {
  const tt      = document.getElementById('tt')!
  const ttArrow = document.getElementById('tt-arrow')!
  const ttName  = document.getElementById('tt-name')!
  const ttDate  = document.getElementById('tt-date')!
  const ttDesc  = document.getElementById('tt-desc')!
  const TT_W = 190
  const TT_H = 120
  const GAP  = 12
  let touchTimer: ReturnType<typeof setTimeout> | null = null

  function show(dot: HTMLElement, clientX: number, clientY: number) {
    ttName.textContent = dot.dataset.name ?? ''
    ttDate.textContent = dot.dataset.date ?? ''
    ttDesc.textContent = dot.dataset.desc ?? ''
    position(clientX, clientY)
    tt.classList.add('tt-visible')
    tt.setAttribute('aria-hidden', 'false')
  }

  function hide() {
    tt.classList.remove('tt-visible')
    tt.setAttribute('aria-hidden', 'true')
    if (touchTimer) { clearTimeout(touchTimer); touchTimer = null }
  }

  function position(clientX: number, clientY: number) {
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Horizontal: centred on dot, clamped to viewport
    const x = Math.max(8, Math.min(clientX - TT_W / 2, vw - TT_W - 8))

    // Vertical: above cursor if space, else below
    let y: number
    let arrowDir: 'tt-up' | 'tt-down'
    if (clientY - TT_H - GAP > 0) {
      y = clientY - TT_H - GAP
      arrowDir = 'tt-down'
    } else {
      y = clientY + GAP
      arrowDir = 'tt-up'
    }
    y = Math.max(8, Math.min(y, vh - TT_H - 8))

    tt.style.left = `${x}px`
    tt.style.top  = `${y}px`

    // Arrow: always point at dot regardless of horizontal clamp
    const arrowX = Math.max(10, Math.min(clientX - x, TT_W - 10))
    ttArrow.className = arrowDir
    ttArrow.style.left = `${arrowX}px`
    ttArrow.style.transform = 'translateX(-50%)'
  }

  document.querySelectorAll<HTMLElement>('.dot').forEach(dot => {
    // Desktop
    dot.addEventListener('mouseenter', e => show(dot, (e as MouseEvent).clientX, (e as MouseEvent).clientY))
    dot.addEventListener('mousemove',  e => position((e as MouseEvent).clientX, (e as MouseEvent).clientY))
    dot.addEventListener('mouseleave', hide)
    dot.addEventListener('focus',      () => {
      const r = dot.getBoundingClientRect()
      show(dot, r.left + r.width / 2, r.top)
    })
    dot.addEventListener('blur', hide)

    // Mobile
    dot.addEventListener('touchend', e => {
      e.preventDefault()
      const t = (e as TouchEvent).changedTouches[0]
      show(dot, t.clientX, t.clientY)
      if (touchTimer) clearTimeout(touchTimer)
      touchTimer = setTimeout(hide, 3000)
    })
  })

  // Dismiss tooltip on tap elsewhere (mobile)
  document.addEventListener('touchend', e => {
    if (!(e.target as HTMLElement).classList.contains('dot')) hide()
  })
})()
</script>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/ignaciocubelasfortes/Documents/Antigravity/IdentidadArtificial
npx astro check 2>&1 | head -40
```

Expected: no errors in `source/components/AITimeline.astro`

- [ ] **Step 3: Commit**

```bash
git add source/components/AITimeline.astro
git commit -m "feat: add AITimeline swimlane component"
```

---

### Task 3: Integrate into home page

**Files:**
- Modify: `source/pages/index.astro`

- [ ] **Step 1: Add import and component to index.astro**

Open `source/pages/index.astro`. Add the import at the top of the frontmatter (with the other imports):

```ts
import AITimeline from '../components/AITimeline.astro'
```

Then insert `<AITimeline />` between `<HeroSection />` and the posts `<div>`:

```astro
<BaseLayout title={SITE.name} description={SITE.description}>
  <HeroSection />

  <AITimeline />

  <div class="max-w-5xl mx-auto px-6 py-10">
    <h2 id="entradas" class="text-xs font-semibold text-[#A0A0C0] uppercase tracking-widest mb-6 pb-3 border-b border-[#2A2A40]">
      Últimas entradas
    </h2>
    ...
```

- [ ] **Step 2: Run dev server and verify visually**

```bash
cd /Users/ignaciocubelasfortes/Documents/Antigravity/IdentidadArtificial
npm run dev
```

Open http://localhost:4321 and verify:
- Timeline appears above posts
- All 5 company lanes visible with correct brand colors
- Year axis shows 2022–2026
- Hovering a dot shows tooltip above/below cursor
- Tooltip text matches the model (name, date, description)
- Arrow in tooltip points at the dot even when tooltip is horizontally clamped
- Right-edge gradient fade visible
- No TypeScript errors in terminal

- [ ] **Step 3: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: `dist/` produced with no errors.

- [ ] **Step 4: Commit**

```bash
git add source/pages/index.astro
git commit -m "feat: integrate AITimeline into home page above posts"
```

---

## Self-Review Checklist

- [x] Data file with types, helper, constants, all 18 models → Task 1
- [x] `toPct()` clamps dateValue to axis range → Task 1
- [x] `toDateValue` helper prevents manual encoding errors → Task 1
- [x] `AXIS_START/AXIS_END` as exported constants → Task 1
- [x] Component HTML structure matches spec → Task 2
- [x] `tl-wrap::after` (not `tl-scroll`) for right-edge fade → Task 2
- [x] `div#tt` placed outside `tl-section`, single instance → Task 2
- [x] Tooltip uses `position: fixed` + JS positioning → Task 2
- [x] Arrow `left` set via JS to always point at dot → Task 2
- [x] `touchend` (not `touchstart`) for mobile → Task 2
- [x] 3s auto-dismiss on mobile → Task 2
- [x] Focus/blur support for keyboard accessibility → Task 2
- [x] Dots 16px on mobile → Task 2 CSS
- [x] `max-w-5xl mx-auto px-6` on `tl-section` → Task 2 CSS
- [x] Component inserted above posts in `index.astro` → Task 3
- [x] Build verification → Task 3
