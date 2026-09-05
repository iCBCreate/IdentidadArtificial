# AI Models Timeline — Design Spec

## Summary

Swimlane horizontal timeline showing major AI/LLM model releases. Sits above the posts section in the home page. Interactive hover tooltips. Mobile-friendly horizontal scroll.

---

## Component

**File:** `source/components/AITimeline.astro`

Single self-contained Astro component. No external libraries. Pure HTML/CSS/JS.

---

## Data

**File:** `source/data/ai-models.ts`

Array of model objects. Adding a new model = one new entry in the array.

```ts
export interface AIModel {
  name: string        // "GPT-4o"
  company: string     // "OpenAI"
  date: string        // "May 2024" (display string)
  dateValue: number   // result of toDateValue(year, month)
  description: string // 1–2 sentences max
  color: string       // hex
}

// Use this helper — never write dateValue manually.
// toDateValue(2024, 5) → 2024.333... (May 2024)
export function toDateValue(year: number, month: number): number {
  return year + (month - 1) / 12
}
```

**Axis range:** `AXIS_START = 2022`, `AXIS_END = 2027` (exported constants). `dateValue` maps linearly to 0–100% on each lane track via:
```
left% = (dateValue - AXIS_START) / (AXIS_END - AXIS_START) * 100
```
Dots with `dateValue` outside `[AXIS_START, AXIS_END]` are clamped (not hidden). When models approach the right edge, update `AXIS_END`.

**Initial models (5 companies):**

| Company | Color | Models | dateValue |
|---------|-------|--------|-----------|
| OpenAI | `#10A37F` | GPT-3.5 | `toDateValue(2022, 11)` |
| | | GPT-4 | `toDateValue(2023, 3)` |
| | | GPT-4o | `toDateValue(2024, 5)` |
| | | o3 | `toDateValue(2024, 12)` |
| | | GPT-5 | `toDateValue(2025, 5)` |
| Claude (Anthropic) | `#CC785C` | Claude 1 | `toDateValue(2023, 3)` |
| | | Claude 2 | `toDateValue(2023, 7)` |
| | | Claude 3 Opus | `toDateValue(2024, 3)` |
| | | Claude 4 Sonnet | `toDateValue(2025, 2)` |
| Gemini (Google) | `#8AB4F8` | Gemini 1.0 | `toDateValue(2023, 12)` |
| | | Gemini 1.5 Pro | `toDateValue(2024, 5)` |
| | | Gemini 2.5 Pro | `toDateValue(2025, 3)` |
| DeepSeek | `#5B8DEF` | DeepSeek V2 | `toDateValue(2024, 5)` |
| | | DeepSeek V3 | `toDateValue(2024, 12)` |
| | | DeepSeek R1 | `toDateValue(2025, 1)` |
| Grok (xAI) | `#9BA3AF` | Grok 1 | `toDateValue(2023, 11)` |
| | | Grok 2 | `toDateValue(2024, 8)` |
| | | Grok 3 | `toDateValue(2025, 2)` |

---

## Layout

```
[HOME PAGE]
  <HeroSection />
  <AITimeline />        ← new, above posts
  <section: posts grid>
  <Pagination />
```

`AITimeline` must be rendered **at most once per page**. It uses `div#tt` (global id) — duplicate instances break tooltip behaviour.

Inside `AITimeline`:
```
section.tl-section  ← max-w-5xl mx-auto px-6 py-10 (matches posts section width)
  h2 "Evolución de modelos de IA"
  div.tl-wrap (border, border-radius, dark bg, position: relative)
    ← ::after pseudo on tl-wrap (NOT tl-scroll) for right-edge fade
    div.tl-scroll (overflow-x: auto)
      div.tl-inner (min-width: 720px)
        div.year-axis   ← year labels from AXIS_START to AXIS_END
        div.lane × 5    ← one per company (hidden if 0 models)
          div.lane-name
          div.lane-track
            div.dot × N ← one per model, left% = (dateValue - AXIS_START) / (AXIS_END - AXIS_START) * 100, clamped
    div.legend          ← color key
    div.mobile-hint     ← "← desliza →"
div#tt (fixed tooltip, hidden by default, outside tl-section)
```

---

## Tooltip behavior

- Single `div#tt` with `position: fixed`, hidden by default (placed just before `</body>`, outside `tl-section`)
- Each `.dot` has `data-name`, `data-date`, `data-desc` attributes
- On `mouseenter` / `touchend`: populate tooltip, show, position with JS
- On `mousemove`: reposition to follow cursor
- On `mouseleave` / 3s timeout (touch): hide
- Positioning logic:
  - Appears **above** cursor if `clientY > TT_HEIGHT + GAP`, else **below**
  - Clamped horizontally: `x = max(8, min(e.clientX - TT_WIDTH/2, vw - TT_WIDTH - 8))`
  - Arrow: separate `div#tt-arrow` child element. Its `left` CSS property is set via JS to `dotCenterX - tooltipLeft` so it always points at the dot regardless of horizontal clamp

---

## Mobile

- Horizontal scroll on `overflow-x: auto` on `tl-scroll`
- Right-edge gradient fade on `tl-wrap::after` (`position: absolute`, `pointer-events: none`) — must be on the non-scrolling parent or it scrolls with content
- `← desliza →` text hint below legend
- Dots 12px desktop, 16px on mobile (touch targets)
- Tooltip: on mobile, triggered by `touchend` (not `touchstart` — avoids conflict with horizontal scroll gesture), dismissed after 3s or on `touchend` elsewhere

---

## Styling

Matches site design language:
- Background: `#13131F`
- Borders: `#2A2A40`
- Muted text: `#A0A0C0`
- Lane track bg: `rgba(255,255,255,0.025)`
- Section label: `10px uppercase tracking-widest` same as posts section

---

## Updating data

To add a new model: open `source/data/ai-models.ts`, add one entry to the array. No other files need to change. The `dateValue` number determines horizontal position automatically.

---

## Out of scope

- Auto-fetching model data from the web (static data file only)
- Filtering by company (not needed for initial version)
- Animation on load
