# Ruturaj Blueprint — engineering rules

Personal career-execution OS for Ruturaj Dharne. Static SPA on Netlify free tier.
**Mission: 161 days, Day 1 = 2026-09-24, Day 161 = 2027-03-03.** A mission day
runs 04:00→04:00 (`DAY_START_HOUR`), so the 22:00–02:00 night block belongs to
the day it was planned on.

## Stack — do not add to this without a reason
Vite · React 18 · TypeScript (strict) · Tailwind v4 (CSS-first tokens) ·
Radix primitives · Framer Motion · lucide-react · cmdk.
Backend is Netlify Functions only. Storage is Netlify Blobs + localStorage mirror.
No database server. No SSR. No Next.js. Push to `main` = live.

## Hard rules

1. **Framer Motion for every interactive tap.** Springs, not linear easings.
   Default `{ type: 'spring', stiffness: 400, damping: 30 }`. Honour
   `prefers-reduced-motion` via the `useReducedMotion` hook — never ship motion
   that ignores it.
2. **No emojis in the UI.** Lucide icons only. Emojis are allowed in email
   templates (they render in Gmail and the old copy uses them) but never in a
   React component.
3. **Storage only via `src/lib/storage.ts`.** Never call `localStorage` or
   `fetch('/.netlify/functions/sync')` from a component. Every read is guarded
   by a Zod-less runtime schema check with a typed fallback; a corrupt blob must
   degrade to defaults, never throw into the render tree.
4. **No file over 300 lines.** Split by responsibility, not by line count.
5. **No secrets in source.** `process.env` in functions only. Never import a
   secret into anything under `src/` — it ships to the browser.
6. **Dates are IST-local.** Use `src/engine/dates.ts` helpers. Never
   `new Date(str)` on a bare `YYYY-MM-DD` (parses as UTC and shifts the day).
   Always `new Date(str + 'T12:00:00')`.
7. **Priority language is P0/P1/P2/P3** everywhere — data, UI, emails. P0 is
   critical, P3 is droppable. The scheduler sheds P2/P3 first when behind.
8. **All day scoring goes through `src/engine/scoring.ts`.** Score planned work
   that got done (`plannedHits`), never `completed.length / planned.length` —
   `completed` accumulates all day and that ratio produced 800% in six places.
9. **Client and server must agree.** `netlify/functions/_shared/plan.mjs`,
   `schedule.mjs` and `digest.mjs` mirror `src/engine/`. Change one, change the
   other, and re-run `node scripts/preview-emails.mjs`.
10. **Resetting stored progress means bumping `DATA_EPOCH`** in both
    `src/lib/schema.ts` and `_shared/digest.mjs`. Never clear it by hand.
11. **Deploys cost credits** (15 each, ~20/month on the free plan). Verify
    locally and push once per session — never after every small fix.

## Syllabus rules

The Foundation Gate is built only from what Ruturaj supplied: Apna College
Prime modules (numbered as in the course player), the Five Minute Engineering
bootcamp's own section names, and the PPA/LB tracks from his original tracker.
Do not add invented checkpoints to it.

## Content rules

- Copy is real UX writing: specific, direct, occasionally strict. Never
  humiliating. Reference actual progress over generic motivation.
- Never fabricate a metric. When a metric is missing, render the literal string
  `Metric needed`.
- Health features track and inform. They never diagnose or prescribe a dose.
  Always distinguish: personal tracking / general evidence / doctor-directed.
- When the roadmap prioritises a skill, state the evidence separately from the
  recommendation. No "everyone uses it" reasoning.

## Verification before calling anything done
`npm run build` clean · `npx tsc --noEmit` clean · zero console errors ·
screenshots at 375px and 1440px · day-math boundaries re-verified.
