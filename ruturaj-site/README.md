# Ruturaj Blueprint

A personal career-execution app for one person, Ruturaj. It tells him what to do
today, in which block, and why; it tracks what actually got done; and it mails
him twice a day. Static React SPA on Netlify's free tier, with five small
Netlify Functions: the progress store, the two scheduled mails, an on-demand
preview/test send, and a mail-status endpoint. No accounts, no database server.

## The screens

| Screen | What it is for |
|---|---|
| **My Day** | The day number, today's objective, the timetable with every block filled, and the day's items with tick + outcome. Before Day 1 it shows the "Start Day 1" card with a preview of the first set. |
| **Amazon SDE-1** | The intensive: today's planned set (P0–P3 tiers, a reason per item, LeetCode links, cold re-solves), evidence counters, the 28-day curriculum, asked-problem bank, LP stories, resume and GenAI prep, the day-of checklist, and the interview status (OA done 19 Oct 2026; invite / scheduled / done). |
| **Roadmap** | The general programme after the intensive: Course 1 Apna College, Course 2 Five Minute Engineering, then practice (PPA, LB, DSA, LSP), with the Foundation Gate and the priority engine. |
| **Projects** | The small number of defensible projects and their milestones. |
| **Fitness** | Today's session (run, strength, long run, recovery), the AM/PM/rest slot for the day, logging, the week strip. The honest note on fat loss lives here. |
| **Progress** | Day scores, execution streak, DSA patterns, phase bars, weekly review. |
| **Settings** | Day 1 date, timetable, exercise slot, mail times, the Amazon window and interview date, theme (light default, dark, system), sync passphrase, data tools, mail preview / test send / status. |

## Day 1 and the two phases

**Day 1 is whatever date he presses "Start Day 1"** (`state.program.startedOn`).
Nothing is hard-coded to a calendar. A mission day runs 04:00 → 04:00 IST, so the
23:30–01:00 block belongs to the day it was planned on.

1. **Amazon intensive** — default 14 days, configurable and extendable in Settings.
   The planner (`src/engine/amazon-plan.ts`) fits the ~185-hour tracker curriculum
   into the time actually left: P0 always, then P1, P2, P3 while they fit. Due
   re-solves come first; a hint means a cold re-solve in 3 days, a solution read in
   2, and an asked problem solved clean comes back after a week, twice. If an
   interview date is set and within 10 days, Phase 3 (asked problems and mocks)
   jumps to the front.
2. **General roadmap** — its Day 1 is the date the Amazon phase is marked complete,
   and it runs to the application target, 10 Mar 2027 (`TARGET_DATE`).

The timetable (`src/data/routine.ts`, driven by Settings) is his real day: home
17:00, study 18:00–20:00, dinner to 21:00, deep block 21:00–23:00, walk, optional
final block to 01:00. Weekends have their own shapes; Sunday has the weekly review
at 20:30.

## Exactly two mails a day

Both mails are built server-side from the synced state through the **same engine
the app runs**: `scripts/gen-engine.mjs` bundles `src/engine/server-entry.ts` into
`netlify/functions/_shared/engine.mjs` (generated, committed, regenerated on every
build; never edit it by hand).

| Mail | Default IST time | Cron (UTC) | Ticks cover (IST) |
|---|---|---|---|
| Morning (`send-morning-email.mjs`) | 06:00 | `0,15,30,45 0-3 * * *` | 05:30–09:15 |
| Evening (`send-evening-email.mjs`) | 17:00 | `0,15,30,45 10-13 * * *` | 15:30–19:15 |

Each function ticks every 15 minutes inside its window. On every tick,
`_shared/scheduled.mjs` reads the state, checks `emailEnabled`, and sends only when
the IST clock is at or after the configured time (`morningEmailTime` /
`eveningEmailTime`) and within four hours of it. The send log in Netlify Blobs
(store `blueprint`, key `mail-log`, `_shared/maillog.mjs`) records one entry per
mission day and type, so:

- a tick after a successful send skips with "already sent";
- a failed SMTP attempt is recorded with its error and the next tick retries;
- a window that was missed entirely is simply missed, it never bursts later;
- the morning entry never blocks the evening one;
- the "Send test mail" button in Settings is logged under `tests[]` with
  `test: true` and never counts as the routine mail.

**Morning:** greeting, the day line, one quote, today's objective (with the tier
floor and pace), the morning exercise (or "Run moved to 17:15 this evening", or
"Rest day"), the compact timetable with items under each study block, the Amazon
set (or roadmap missions) with minutes, tier, reason and LeetCode link, two
measurable outcomes for tonight, and one button. Before Day 1 it says Day 1 is
waiting and previews the first set.

**Evening:** "That's the office done.", the next move at 18:00 (first open item with
its reason, or "already logged"), tonight's blocks with their items, what is already
logged today, and one honest line chosen by how the day went.

Subjects are built from real content, for example `Day 4 · Fri — 2 re-solves, then
Day 2: Two pointers and prefix sums` or `Saturday 17:00 — 11 items left, free
evening at 17:30`.

Other endpoints (all behind `BLUEPRINT_KEY` in the `x-blueprint-key` header):

- `POST /.netlify/functions/send-email?type=morning|evening&preview=1` returns
  `{ ok, type, subject, html, text }` without sending; without `preview=1` it sends
  now, logs a test entry and returns `{ ok, type, subject, messageId }`.
- `GET /.netlify/functions/mail-status` returns what is configured (addresses
  masked as `r•••@domain`), both schedules with the configured times, the last 14
  days of the log, and the IST clock.
- `GET|PUT /.netlify/functions/sync` is the progress store.

## Local commands

```bash
npm install
npm run dev            # Vite dev server
npm run build          # gen:engine, then tsc --noEmit, then vite build (what Netlify runs)
npm run typecheck      # tsc --noEmit only
npm run gen:engine     # regenerate netlify/functions/_shared/engine.mjs from src/engine/server-entry.ts
npm run verify         # gen:engine + scripts/verify-engine.mjs: day numbers, window, capacity, planner, revisions
npm run test:mail      # gen:engine + scripts/test-mail.mjs: IST boundaries, send window, dedupe log, rendering; sends nothing
npm run preview:mail   # gen:engine + scripts/preview-emails.mjs: writes scripts/preview-*.html (gitignored), prints subjects
```

`verify`, `test:mail` and `preview:mail` need no browser and no network. If a file
under `src/` is mid-edit and an import cannot be resolved, `gen:engine` keeps the
last good bundle with a warning so the mail scripts still run (`GEN_ENGINE_STRICT=1`
makes it fail instead; the real build fails anyway at `tsc`).

## Environment variables

Set these in Netlify → Site configuration → Environment variables. See
`.env.example`; never commit real values.

| Variable | Purpose |
|---|---|
| `BLUEPRINT_KEY` | Shared passphrase for the progress store and the mail endpoints. Entered once per device in Settings. |
| `SENDER_EMAIL` | Gmail address the mails are sent from. |
| `SENDER_PASS` | A Gmail **app password** for that account (2-Step Verification → App passwords), not the account password. |
| `MY_EMAIL` | Where the mails go. |
| `SITE_URL` | Optional. The URL the mail buttons open. Defaults to `https://winner-ruturaj.netlify.app`. |

## Deploy (Netlify free tier)

1. Push to `main`. Netlify runs `npm run build` and publishes `dist/`; the functions
   in `netlify/functions/` are bundled with esbuild (`netlify.toml`).
2. Set the environment variables above, then trigger a redeploy so the functions see
   them.
3. Netlify Blobs needs no setup; the `blueprint` store is created on first write.
4. Open the site, enter the passphrase in Settings, press "Start Day 1" when ready.
5. In the Netlify dashboard, open **Functions** and confirm `send-morning-email` and
   `send-evening-email` are listed as scheduled with the next run shown. Use "Send
   test mail" in Settings once to confirm SMTP works; it is logged as a test.

## Honest limitations

- **Cron is UTC and static.** The ticks run every 15 minutes inside fixed windows,
  so the configured mail times must sit inside them: morning between 05:30 and
  09:15 IST, evening between 15:30 and 19:15 IST, and a time between ticks goes
  out at the next tick (06:05 sends at 06:15).
- **Netlify scheduled functions** are available on all plans, but confirm the
  cadence in the Functions tab after the first deploy; a free site that is paused
  or has exceeded its function budget will not tick.
- **Progress sync needs the passphrase on each device.** There are no accounts;
  one passphrase, one store. Lose it and the server copy is unreadable until the
  env var is changed.
- **Mobile install** on iOS is Safari → Share → Add to Home Screen (there is a web
  manifest; no native app).
- **The mails say only what the store knows.** If the app was not opened and synced
  today, the evening mail has no day log and says so.

## Amazon module: where the content comes from

`src/data/amazon/*.json` is imported verbatim from the SDE-1 tracker built on
21 Oct 2026. Every claim carries its label:

- **Candidate-reported**: 18 interview reports describing 17 loops (the Reddit
  post and LC 8542365 tell the same loop) from 2022–2026 (LeetCode Discuss,
  takeuforward, Roundz, GeeksforGeeks, Medium, one Reddit post), listed with links
  in `sources.json`. "Asked" flags and the LP / GenAI / LLD round notes come from
  these.
- **Frequency data**: Amazon problem frequency from LeetCode company tags (the
  liquidslr dataset, updated 20 Oct 2026), 120 rows in `freq.json`.
- **Our own inference**: the P0–P3 tiers, minutes per item, the day budget and the
  spaced-revision rules in `src/engine/amazon*.ts`. They are rules you can read,
  not measurements.
- **General advice**: the per-problem method (restate, brute force, improve, dry
  run, complexity) and the day-of checklist.

No invented interview reports, frequencies, timelines or metrics; where a number is
missing the app renders `Metric needed`. The repository is public: weight, sleep
and lab values never appear in source, only in the private synced store.

## Layout

```
src/engine/        pure TypeScript engine (dates, program, Amazon planner, schedule, fitness, scoring)
src/engine/server-entry.ts   what the mail functions need; bundled into engine.mjs
src/data/          tracker JSON, routine, fitness sessions, quotes, courses, tasks
src/lib/           schema, parse, storage, mail-api, router
src/screens/, src/components/   the React app (light theme, Framer Motion, lucide)
netlify/functions/ sync.mjs · send-morning-email.mjs · send-evening-email.mjs · send-email.mjs · mail-status.mjs
netlify/functions/_shared/      engine.mjs (generated) · digest · templates (morning, evening) · voice · plaintext · mail · maillog · scheduled · auth · crons
scripts/           gen-engine · verify-engine · test-mail · preview-emails · fixtures
```
