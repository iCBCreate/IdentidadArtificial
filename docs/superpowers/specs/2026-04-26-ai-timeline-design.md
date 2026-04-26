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
  dateValue: number   // 2024.4 (numeric, for positioning on axis)
  description: string // 1–2 sentences max
  color: string       // hex
}
```

**Axis range:** Jan 2022 → Dec 2026 (6 years). `dateValue` maps linearly to 0–100% on each lane track.

**Initial models (5 companies):**

| Company | Color | Models |
|---------|-------|--------|
| OpenAI | `#10A37F` | GPT-3.5, GPT-4, GPT-4o, o3, GPT-5 |
| Claude (Anthropic) | `#CC785C` | Claude 1, Claude 2, Claude 3 Opus, Claude 4 Sonnet |
| Gemini (Google) | `#8AB4F8` | Gemini 1.0, Gemini 1.5 Pro, Gemini 2.5 Pro |
| DeepSeek | `#5B8DEF` | DeepSeek V2, DeepSeek V3, DeepSeek R1 |
| Grok (xAI) | `#9BA3AF` | Grok 1, Grok 2, Grok 3 |

---

## Layout

```
[HOME PAGE]
  <HeroSection />
  <AITimeline />        ← new, above posts
  <section: posts grid>
  <Pagination />
```

Inside `AITimeline`:
```
section.tl-section
  h2 "Evolución de modelos de IA"
  div.tl-wrap (border, border-radius, dark bg)
    div.tl-scroll (overflow-x: auto)
      div.tl-inner (min-width: 720px)
        div.year-axis   ← year labels 2022–2026
        div.lane × 5    ← one per company
          div.lane-name
          div.lane-track
            div.dot × N ← one per model, positioned by dateValue
    div.legend          ← color key
    div.mobile-hint     ← "← desliza →"
  div#tt (fixed tooltip, hidden by default)
```

---

## Tooltip behavior

- Single `div#tt` with `position: fixed`, hidden by default
- Each `.dot` has `data-name`, `data-date`, `data-desc` attributes
- On `mouseenter`: populate tooltip, show, position with JS
- On `mousemove`: reposition to follow cursor
- On `mouseleave`: hide
- Positioning logic:
  - Appears **above** cursor if `clientY > TT_HEIGHT + GAP`, else **below**
  - Clamped horizontally: `max(8px, min(x, vw - TT_WIDTH - 8px))`
  - Arrow position adjusts to always point at dot

---

## Mobile

- Horizontal scroll on `overflow-x: auto`
- Right-edge gradient fade (`::after` pseudo-element) hints more content
- `← desliza →` text hint below legend
- Dots 12px desktop, 16px on mobile (touch targets)
- Tooltip: on mobile, triggered by `touchstart`, dismissed after 3s or on tap elsewhere

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
