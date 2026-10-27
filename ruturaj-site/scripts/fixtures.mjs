// Fixture states for the mail scripts. Invented test data, never Ruturaj's.
// Every state is valid for parseState: program.startedOn set, amazon.items
// with doneOn/outcome/revisitOn, settings.settingsVersion 2.

import { addDays, todayISO } from '../netlify/functions/_shared/engine.mjs';

/** A Date for an IST wall-clock time on a date. */
export const ist = (iso, hhmm) => new Date(`${iso}T${hhmm}:00+05:30`);

/** Day 1 of the fixtures: Tuesday 27 Oct 2026. */
export const DAY1 = '2026-10-27';
export const THU = '2026-10-29'; // Day 3
export const FRI = '2026-10-30'; // Day 4, two revisions due
export const SAT = '2026-10-31'; // Day 5
export const SUN = '2026-11-01'; // Day 6

export function amazonState({ startedOn = DAY1, program = {}, amazon = {}, items = {}, days = {}, runs = [], settings = {}, exerciseOverrides = {} } = {}) {
  return {
    version: 3,
    dataEpoch: 4,
    updatedAt: '2026-10-27T01:00:00.000Z',
    program: { startedOn, phase: 'amazon', amazonWindowDays: 14, amazonExtendedDays: 0, ...program },
    amazon: { stage: 'awaiting_invite', oaDate: '2026-10-19', items, extras: {}, solidTopics: [], ...amazon },
    days,
    runs,
    exerciseOverrides,
    settings: { settingsVersion: 2, ...settings },
  };
}

/** Days 1–2 logged: one clean solve, one hint (re-solve in 3 days), one solution read (re-solve in 2 days). */
export const LOGGED = {
  'd1-bigo': { doneOn: DAY1, revisits: 0 },
  'two-sum': { doneOn: DAY1, outcome: 'independent', revisitOn: addDays(DAY1, 7), revisits: 0 },
  'contains-duplicate': { doneOn: DAY1, outcome: 'hint', revisitOn: addDays(DAY1, 3), revisits: 0 },
  'd1-lp': { doneOn: DAY1, revisits: 0 },
  'valid-anagram': { doneOn: addDays(DAY1, 1), outcome: 'reviewed', revisitOn: addDays(DAY1, 3), revisits: 0 },
  'd2-learn': { doneOn: addDays(DAY1, 1), revisits: 0 },
};

/** Before start: an empty blob, exactly what a fresh deploy sees. */
export const beforeStart = () => ({});

/** Day 4 (Friday) with two re-solves due. */
export const weekday = () => amazonState({ items: LOGGED });

/** The same day at 17:00: the first two planned items logged, the run done. */
export function weekdayEvening(morningDigest) {
  const planned = morningDigest.items.map((i) => i.id);
  const [first, second] = morningDigest.items;
  const items = { ...LOGGED };
  const completed = [];
  for (const i of [first, second]) {
    if (!i) continue;
    const revisit = i.id.startsWith('rev:');
    const key = revisit ? i.id.slice(4) : i.id;
    // As logAmazonItem writes it: a re-solve keeps its first doneOn and bumps revisits.
    items[key] = revisit
      ? { doneOn: items[key]?.doneOn ?? FRI, outcome: 'independent', revisits: (items[key]?.revisits ?? 0) + 1 }
      : { doneOn: FRI, outcome: 'independent', revisits: 0 };
    completed.push(i.id);
  }
  return amazonState({
    items,
    days: { [FRI]: { planned, completed } },
    runs: [{ id: 'wo-1', date: FRI, slot: 'morning', kind: 'run', minutes: 46, km: 4.1 }],
  });
}

export const saturday = () => amazonState({ items: LOGGED });
export const sunday = () => amazonState({ items: LOGGED });

/** Interview scheduled four days after Thursday 29 Oct. */
export const interviewSoon = () =>
  amazonState({ items: LOGGED, amazon: { stage: 'interview_scheduled', interviewDate: addDays(THU, 4) } });

/** The evening run, for a day where the slot was moved. */
export const eveningRun = () => amazonState({ items: LOGGED, exerciseOverrides: { [THU]: 'evening' } });

/**
 * General roadmap. buildPlan reads the real clock for its day number, so
 * this fixture is anchored on the real today rather than the fixed dates.
 */
export function general(now = new Date()) {
  const today = todayISO(now);
  return amazonState({
    startedOn: addDays(today, -20),
    program: { phase: 'general', amazonCompletedOn: addDays(today, -6), generalStartedOn: addDays(today, -6) },
    items: LOGGED,
  });
}
