# Ruturaj Blueprint — engineering rules

Personal career-execution OS for Ruturaj Dharne. Static SPA on Netlify free tier.
**Day 1 is whatever date he pressed "Start Day 1"** (`state.program.startedOn`); never
hard-code a calendar start. The programme has two phases: **Surprise Prep** (the Amazon
SDE-1 tracker, studied before any interview call; default 28 days, configurable,
extendable; internal ids stay `amazon`) and then the **general roadmap**, whose Day 1 is
the date prep was marked complete and whose length runs to the switch target
`TARGET_DATE` (28 Feb 2027). During prep the after-dinner lecture block holds the next
Apna College module (`src/engine/lecture.ts`). A mission day runs 04:00→04:00 IST
(`DAY_START_HOUR`). Timetable: `src/data/routine.ts` driven by `Settings` (wake 08:00,
run 08:05–08:30, home 17:15, own time to 17:30, prep 17:30–19:30, freelance to 20:15,
protein dinner to 21:00, lecture 21:00–22:15, 5 km walk and a call home to 23:15,
revise and plan tomorrow to 23:45). Runs are morning-only; a day can be marked rest.

**Naming.** In the UI and the mails it is "Surprise Prep" / "study for surprises", never
"Amazon". The only exceptions are factual source labels on real data (official Amazon
guidance, LeetCode's Amazon company tag, candidate reports), which must stay accurate.

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
10. **Exactly two routine emails a day**: morning (default 07:45 IST, waiting when
    he wakes) and evening (default 17:15 IST, as he gets home). Both are short, and
    every subject opens with one emoji and is built from the day's real content.
    Both run inside a 15-minute cron window and are guarded
    by the send log in Netlify Blobs (`_shared/maillog.mjs`), so a retry can never
    produce a duplicate and a missed window never bursts later. Any other send is
    an explicit button press by Ruturaj and is logged as a test.
11. **Deploys cost credits.** Verify locally and push once per session.
12. **The repository is public. No personal health data in source.** Weight,
    sleep, lab values and daily activity numbers (steps, km, calories) live only in
    the private synced store.
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
- Dinners are vegetarian with eggs (no chicken, fish or meat). Protein figures in
  `src/data/meals.ts` are labelled rough estimates for the portion written.

## Verification before calling anything done
`npm run build` clean · `npx tsc --noEmit` clean · `npm run verify` ·
`npm run test:mail` · zero console errors · screenshots at 375px and 1440px.
