# Ruturaj Blueprint — engineering rules

Personal career-execution OS for Ruturaj Dharne. Static SPA on Netlify free tier.
**Day 1 is whatever date he pressed "Start Day 1"** (`state.program.startedOn`); never
hard-code a calendar start. The programme has two phases: the **Amazon SDE-1
intensive** (default 14 days, configurable, extendable) and then the **general
roadmap**, whose Day 1 is the date the Amazon phase was marked complete and whose
length runs to the application target `TARGET_DATE` (10 Mar 2027). A mission day runs
04:00→04:00 IST (`DAY_START_HOUR`), so the 23:30–01:00 block belongs to the day it was
planned on. Timetable: `src/data/routine.ts` driven by `Settings` (home 17:00, study
18–20, dinner 20–21, deep 21–23, walk 23–23:30, optional final block to 01:00).

## Stack — do not add to this without a reason
Vite · React 18 · TypeScript (strict) · Tailwind v4 (CSS-first tokens) ·
Radix primitives · Framer Motion · lucide-react.
Backend is Netlify Functions only. Storage is Netlify Blobs + localStorage mirror.
No database server. No SSR. No Next.js. Push to `main` = live.

## Hard rules

1. **Framer Motion for every interactive tap.** Springs, not linear easings.
   Default `{ type: 'spring', stiffness: 400, damping: 30 }`. Honour
   `prefers-reduced-motion` via `useReducedMotion`.
2. **No emojis in the UI.** Lucide icons only. Emojis are allowed in email
   templates but never in a React component.
3. **Storage only via `src/lib/storage.ts`** through the hooks in
   `src/hooks/useAppState.ts`. Never call `localStorage` or `fetch` to the sync
   endpoint from a component. Reads are guarded by `src/lib/parse.ts`; a corrupt
   blob must degrade to defaults, never throw into the render tree.
4. **No file over 300 lines.** Split by responsibility. Large data lives in JSON
   under `src/data/amazon/` (imported verbatim from the tracker; do not edit by hand).
5. **No secrets in source.** `process.env` in functions only. Never import a
   secret into anything under `src/`.
6. **Dates are IST.** Use `src/engine/dates.ts`. `todayISO()` is IST-explicit so
   it is correct in a Netlify function too. Never `new Date(str)` on a bare
   `YYYY-MM-DD`; always `parseDay`.
7. **Priority language is P0/P1/P2/P3** everywhere. The Amazon planner sheds
   P3 first, then P2 (`src/engine/amazon-plan.ts`); every item shows its reason.
8. **All day scoring goes through `src/engine/scoring.ts`.** Score planned work
   that got done (`plannedHits`), never `completed.length / planned.length`.
9. **Client and server share one engine.** `scripts/gen-engine.mjs` bundles
   `src/engine/server-entry.ts` into `netlify/functions/_shared/engine.mjs`
   (generated, committed, regenerated on every build). Functions import from it;
   never re-implement engine logic in `.mjs`.
10. **Exactly two routine emails a day**: morning (default 06:00 IST) and
    evening (17:00 IST). Both run inside a 15-minute cron window and are guarded
    by the send log in Netlify Blobs (`_shared/maillog.mjs`), so a retry can never
    produce a duplicate and a missed window never bursts later. Any other send is
    an explicit button press by Ruturaj and is logged as a test.
11. **Deploys cost credits.** Verify locally and push once per session.
12. **The repository is public. No personal health data in source.** Weight,
    sleep and lab values live only in the private synced store.
13. **Never fabricate.** No invented interview reports, question frequencies,
    timelines, quotes or metrics. Label every claim: official Amazon guidance /
    candidate-reported / general advice / our own inference. When a metric is
    missing render the literal string `Metric needed`.

## Content rules

- Copy is real UX writing: specific, direct, occasionally strict, never
  humiliating. It must read as written by a thoughtful person, not a template.
- Course order for the general roadmap is fixed: Course 1 Apna College, Course 2
  Five Minute Engineering, then practice (PPA, LB, DSA, LSP). Do not invent
  expansions of those abbreviations.
- Fitness tracks and informs. Never claim spot fat reduction; the honest note is
  `FAT_LOSS_NOTE` in `src/data/fitness.ts`.

## Verification before calling anything done
`npm run build` clean · `npx tsc --noEmit` clean · `npm run verify` ·
`npm run test:mail` · zero console errors · screenshots at 375px and 1440px.
