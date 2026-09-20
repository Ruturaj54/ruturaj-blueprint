# Ruturaj Blueprint — design system

Dark-first "mission control". Professional, sharp, minimal, slightly intense.
Every screen glanceable in 3 seconds. Mobile-first — this is used on a phone daily.

## Color tokens

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#08080A` | page background |
| `--surface` | `#101014` | cards, sheets |
| `--surface-2` | `#16161B` | raised / hover |
| `--border` | `rgba(255,255,255,0.08)` | 1px hairlines |
| `--border-strong` | `rgba(255,255,255,0.14)` | focused / active |
| `--text` | `#F4F4F5` | primary |
| `--muted` | `#A1A1AA` | secondary |
| `--faint` | `#52525B` | tertiary, timestamps |
| `--accent` | `#FBBF24` | amber — energy, streaks, CTAs |
| `--success` | `#34D399` | emerald — completion |
| `--info` | `#38BDF8` | sky — informational |
| `--danger` | `#FB7185` | rose — overdue, blocked |

Priority colors: P0 `--danger` · P1 `--accent` · P2 `--info` · P3 `--faint`.

Radius: cards `16px`, controls `10px`, pills `999px`.
Never use a gradient as a surface fill. Accent is for emphasis, not decoration —
if more than ~10% of a screen is amber, it has stopped meaning anything.

## Typography

- **Space Grotesk** — display, day numbers, section headers. Tight tracking.
- **Inter** — all body, labels, buttons.
- **JetBrains Mono** — counters, timers, percentages, code, problem IDs.

Day number on Home is the largest type on the app (clamp 56–96px, Space Grotesk).
Nothing else competes with it.

## Motion

Framer Motion only. Default spring `{ stiffness: 400, damping: 30 }`.

- Checkbox tap: spring scale 1 → 0.92 → 1, check path draws via `pathLength`.
- Card entrance: stagger 40ms, y 12 → 0, opacity 0 → 1.
- Tab change: `AnimatePresence` cross-fade + 8px slide in the travel direction.
- Nav indicator: shared `layoutId` pill.
- Group completion: one tasteful burst on the card — never full-screen confetti.
- All of it disabled under `prefers-reduced-motion`; opacity-only fallbacks.

## Layout

Mobile: bottom nav, 5 primary destinations + overflow sheet. 16px gutters.
Desktop (`lg:`): left sidebar, all destinations visible, 1200px max content.
Generous whitespace — 24px between sections, 16px inside cards.
Touch targets never below 44px.

## Voice

Direct, evidence-led, occasionally strict. Never abusive.

- Good: "Yesterday you planned 3 DSA problems and finished 1. Today you're not
  starting anything new — you're clearing the backlog."
- Bad: "You failed yesterday!" / "Keep grinding! 💪"

Recognise genuine progress plainly: "Your DSA consistency improved this week."
State evidence and recommendation separately, never blended.
