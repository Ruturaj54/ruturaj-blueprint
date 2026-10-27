# Redesign brief — Amazon-first, light-first, two mails a day (Oct 2026)

Read `../CLAUDE.md` and `../design.md` first. This file is the contract between the
people building the screens, the mail pipeline and the docs in parallel.

## What already exists (do not rewrite)

Engine and data, all pure TypeScript, all IST-safe:

- `src/lib/schema.ts` — `AppState`, `Program`, `AmazonState`, `AmazonItemLog`, `WorkoutLog`,
  `Settings` (new timetable keys), `DEFAULT_SETTINGS`, `DEFAULT_PROGRAM`.
- `src/lib/parse.ts` — `parseState(raw)`; migrates old settings; keeps all history.
- `src/lib/storage.ts` — `update(draft => …)`, `getState`, `whenSynced`, `exportState`,
  `replaceState`, `resetAll`, passphrase helpers. Components use `useAppState()` and
  `useUpdateState()` from `src/hooks/useAppState.ts` only.
- `src/engine/dates.ts` — `todayISO`, `istClock`, `addDays`, `daysBetween`, `formatShort`,
  `formatLong`, `formatWeekday`, `configureMission`, `missionTotalDays`, `currentDay`,
  `dateForDay`, `TARGET_DATE`.
- `src/engine/program.ts` — `programInfo(state)` → `{ started, startedOn, day, phase,
  amazon: { day, windowDays, endsOn, daysLeft, overrun }, general: {...}, daysToTarget }`;
  mutators `startProgram`, `completeAmazonPhase`, `reactivateAmazonPhase`,
  `extendAmazonWindow`, `setAmazonWindow` (call inside `update`).
- `src/data/amazon/index.ts` — the tracker content, verbatim JSON: `AMAZON_DAYS` (28 days),
  `AMAZON_PHASES`, `AMAZON_BANK` (9 groups of asked problems), `AMAZON_FREQ` (120 rows),
  `AMAZON_LP` (24 stories), `AMAZON_RESUME` (13), `AMAZON_GENAI` (12), `AMAZON_DAYOF` (7),
  `AMAZON_SOURCES` (19), `AMAZON_COVERAGE` (25 topics), `lcUrl`, `richText`, `plainText`.
- `src/engine/amazon.ts` — `AMAZON_ITEMS` (282 tiered items with `key, day, phase, slot,
  type, title, rich, kind, slug, n, d, f3, f30, prem, asked, src, note, minutes, tier,
  repeat, topic`), `amazonItem(key)`, `effectiveTier`, `solidDays`, `revisionsDue`,
  mutators `logAmazonItem(draft, key, { outcome, minutes, note })`, `unlogAmazonItem`,
  `toggleAmazonCheck(draft, id)` (for LP/resume/GenAI/day-of ids), `toggleAmazonExtra`,
  `toggleSolidTopic`.
- `src/engine/amazon-plan.ts` — `buildAmazonDay(state, date?)` → `AmazonDayPlan`
  `{ date, mode: 'curriculum'|'interview'|'interview-day'|'done', capacity, budget,
  planned: PlannedItem[] { id, item, minutes, revision, tier, reason }, plannedIds,
  totalMinutes, tierFloor, pace: { remainingByTier, capacityLeft, daysLeft, fits,
  hoursPerDayNeeded, note }, focus, nextUp, daysToInterview }`. `dailyBudget(state, date)`.
- `src/engine/amazon-stats.ts` — `amazonSummary(state)` → evidence counters (`problems`,
  `asked`, `revisions`, `lp`, `resume`, `genai`, `dayof`, `mocks`, `learn`, `freq`, `items`,
  `minutes`, `byPhase`, `byDay`, `todayCount`, `streak`, `weakTopics`); `amazonLoggedOn`.
- `src/data/routine.ts` + `src/engine/schedule.ts` — `buildSchedule(settings, items, dayType,
  exerciseSlot)` → `DaySchedule { slots, overflow, totalPlanned, totalCapacity }`;
  `daySlots`, `studyCapacity`, `dayTypeOf`, `slotAt`, `nextSlot`, `dayClock`, `formatHM`,
  `weekdaySleepHours`. `SlotItem { id, title, context, minutes, kind:
  'amazon'|'revision'|'course'|'build'|'dsa', carried? }`. Slot kinds:
  wake · move · meal · work · study · walk · free · routine · sleep.
- `src/data/fitness.ts` + `src/engine/fitness.ts` — `SESSIONS`, `WEEKLY_SESSION`,
  `FAT_LOSS_NOTE`, `sessionFor(state, date)` → `{ session, slot, logged, done }`,
  `exerciseSlotFor`, `fitnessWeek`, `fitnessStreak`, `logWorkout(draft, …)`,
  `setExerciseOverride(draft, date, slot|null)`.
- `src/data/quotes.ts` — `quoteForDay(n)` (verified attributions or original), `EVENING_LINES`.
- General roadmap (unchanged logic): `engine/planner.ts buildPlan`, `priority.ts`,
  `foundation.ts gateStatus`, `mission.ts missionPhases/dayContext`, `courses.ts`,
  `readiness.ts`, `dsa.ts`, `weekly.ts`, `scoring.ts`, `praise.ts`, `achievements.ts`,
  data in `src/data/foundation/*`, `src/data/tasks/*`.
- UI kit: `components/ui/primitives.tsx` (`Card` with `tone`, `SectionTitle`, `Button`
  variants primary/outline/ghost/danger/amazon/success, `ProgressBar`, `PriorityPill`,
  `Chip` tones, `EmptyState`, `inputCls`, `textareaCls`), `components/ui/controls.tsx`
  (`TaskCheckbox` with tone success/amazon, `Segmented`, `Toggle`, `Field`, `Stat`,
  `Banner`), `components/ui/ProgressRing.tsx`, `components/Shell.tsx`, `App.tsx` routes:
  home · amazon · roadmap · projects · fitness · progress · settings.
- The previous dark-theme screens were removed once the redesign landed; their
  logic lives on in the screens and components listed above.

## Cross-component contracts (exact signatures)

- `components/amazon/AmazonSet.tsx`: `export function AmazonSet({ plan, compact, navigate }:
  { plan: AmazonDayPlan; compact?: boolean; navigate?: (id: string) => void })` — today's
  set with tick + outcome logging (Independent / Needed a hint / Read the solution),
  minutes, optional note, revision rows, reason per row, LeetCode link.
- `components/amazon/EvidenceCard.tsx`: `export function EvidenceCard({ summary, compact }:
  { summary: AmazonSummary; compact?: boolean })`.
- `components/amazon/AmazonStatusCard.tsx`: `export function AmazonStatusCard({ compact }:
  { compact?: boolean })` — OA done 19 Oct 2026 · outcome not confirmed · invite not
  received / scheduled (date) / done; editing lives in Settings and on the Amazon screen.
- `components/home/StartDayOne.tsx`: `export function StartDayOne({ navigate }:
  { navigate: (id: string) => void })` — preview of Day 1 (Amazon set, timetable, exercise)
  and the confirm button that calls `startProgram`.
- `components/fitness/ExerciseCard.tsx`: `export function ExerciseCard({ compact, onOpen }:
  { compact?: boolean; onOpen?: () => void })` — today's session, AM/PM/rest toggle for
  today, mark done (minutes, km).
- `components/today/DayTimetable.tsx`: `export function DayTimetable({ items, date }:
  { items: SlotItem[]; date: string })` — builds the schedule from settings + exercise slot
  for that date; previews Weekday/Saturday/Sunday.
- Screens: `screens/MyDay.tsx` `{ navigate }`, `screens/Amazon.tsx` `{ navigate }`,
  `screens/Roadmap.tsx` `{ navigate }`, `screens/Projects.tsx`, `screens/Fitness.tsx`,
  `screens/Progress.tsx` `{ navigate }`, `screens/Settings.tsx`.

## Non-negotiables for every screen

- Light theme tokens only (`bg-surface`, `text-fg`, `text-muted`, `border-line`, soft tints).
  Never `bg-white/[0.06]`, `text-black`, `border-white/10`, `bg-black/60`.
- Mobile first at 375px: no horizontal overflow, 44px targets, segmented tabs or
  disclosures for long lists, concise copy.
- Every file under 300 lines; split components.
- No `localStorage`/`fetch` in components. No emojis. No invented numbers.
- Explain recommendations in one line ("Why: …").
