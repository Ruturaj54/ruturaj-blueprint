# Ruturaj Blueprint — design system

Light-first personal command center. Calm, premium, legible on a phone in
daylight. Every screen answers "what do I do next" in three seconds. Mobile-first:
this is opened on an iPhone every morning and every evening.

## Color tokens (src/index.css `@theme`)

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#F6F4EF` | warm ivory page background |
| `--color-surface` | `#FFFFFF` | cards, sheets |
| `--color-raised` | `#F1EEE8` | hover, segmented control track, subtle wells |
| `--color-line` / `--color-line2` | `#E6E1D8` / `#D3CCC0` | hairlines / input borders |
| `--color-fg` | `#1C2333` | primary text (deep navy) |
| `--color-muted` / `--color-faint` | `#5C6578` / `#8B93A3` | secondary / tertiary |
| `--color-accent` (+ `-soft`) | `#2B57D9` | one sophisticated blue: CTAs, active nav, links |
| `--color-success` (+ `-soft`) | `#1F8A5B` | done, streaks |
| `--color-warn` (+ `-soft`) | `#B4731A` | amber: behind, reminders, P1 |
| `--color-danger` (+ `-soft`) | `#C43D3D` | overdue, P0, destructive |
| `--color-info` (+ `-soft`) | `#1F7AA6` | informational, P2 |
| `--color-amazon` (+ `-soft`, `-ink`) | `#D9770A` | the Surprise Prep module's identity only |

Optional dark theme: `html[data-theme='dark']` in `src/index.css` swaps every token (deep slate
surfaces, lighter accent, `--color-on-accent` dark so filled buttons stay readable). Light is the
default; Settings, Appearance offers Light, Dark or System, and the header has a one-tap switch.

Priority colors: P0 danger · P1 warn · P2 info · P3 faint.
Radius: cards 16px, controls 12px, chips 999px. Shadows: `shadow-card` only.
No gradients as fills. No dark surfaces inside the light theme. Accent is for emphasis, not decoration.
The Surprise Prep tab is the one place orange appears: its header band, active nav
state, checkbox tone and primary button. Everything else is blue.

## Typography

- **Manrope** 600–800 — display, day numbers, section headers, big stats.
- **Inter** 400–600 — body, labels, buttons.
- **JetBrains Mono** 400–600 — counters, timers, times, problem numbers, P0–P3.

Body 15px/1.55. Section titles are 13px uppercase tracked, muted. The largest type on
My Day is the day number. Nothing competes with it.

## Layout

Mobile: bottom bar with My Day · Prep · Roadmap · Fitness · More (Projects, Progress,
Settings); the sidebar spells it Surprise Prep. 16px gutters, 44px minimum touch targets, no horizontal scroll, long lists
collapse behind disclosures or segmented tabs. Desktop (`lg:`): left sidebar, 1080px
max content. 24px between sections, 16px inside cards.

## Motion

Framer Motion only. Default spring `{ stiffness: 400, damping: 30 }`; `popSpring`
(380/17) for things that land. Phone-first: the app is mostly used on his iPhone.

- Checkbox: scale 1 → 0.88 → 1, check pops in, a ring blooms outward once on tick (`TickBloom`).
- Card entrance: stagger 40ms, y 12 → 0. Timetable rows: stagger 25ms, y 8 → 0.
- Tabs slide in from the side they sit on in the nav (`pageSlide`, x ±28); the page wrapper clips x.
- Bottom nav: tap shrinks to 0.88, the active icon lifts 2px and grows to 1.12; indicator is a shared `layoutId`.
- Numbers count to their value (`AnimatedNumber`): stats, the day number, the walk km.
- The day number lands with `popSpring`; the phase chip re-enters when its text changes; the CTA arrow nudges every few seconds.
- Right now: a breathing live dot and a bar for how much of the current block is left; the title cross-fades between blocks.
- A live streak gets a small flickering flame (`StreakFlame`); the walk target gets one pop and a ring.
- First sync: skeleton cards that breathe, not a bare spinner.
- One tasteful bloom on a completed day; never confetti.

Everything collapses to opacity-only (or stillness) under `prefers-reduced-motion`.

## Voice

Direct, warm, evidence-led. Reference what actually happened, never generic hype.
Good: "You planned 5 prep items yesterday and closed 3. Today starts with the two you
missed." Bad: "Keep grinding!" Recognise real progress plainly. State evidence and
recommendation separately.
