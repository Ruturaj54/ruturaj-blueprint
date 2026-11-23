// Fixture states for the mail scripts. Invented test data, never Ruturaj's.
// Every state is valid for parseState: program.startedOn set, amazon.items
// with doneOn/outcome/revisitOn, settings.settingsVersion 3, dataEpoch 6.

import { addDays, todayISO } from '../netlify/functions/_shared/engine.mjs';

/** A Date for an IST wall-clock time on a date. */
export const ist = (iso, hhmm) => new Date(`${iso}T${hhmm}:00+05:30`);

/** The default send times (Settings): morning 07:45, evening 17:15. */
export const AM = '07:45';
export const PM = '17:15';

/** Day 1 of the fixtures: Tuesday 27 Oct 2026. */
export const DAY1 = '2026-10-27';
export const THU = '2026-10-29'; // Day 3
export const FRI = '2026-10-30'; // Day 4, two revisions due
export const SAT = '2026-10-31'; // Day 5
export const SUN = '2026-11-01'; // Day 6

export function amazonState({ startedOn = DAY1, program = {}, amazon = {}, items = {}, days = {}, runs = [], activity = {}, settings = {}, exerciseOverrides = {}, foundation = {} } = {}) {
  return {
    version: 3,
    dataEpoch: 6,
    updatedAt: '2026-10-27T01:00:00.000Z',
    program: { startedOn, phase: 'amazon', amazonWindowDays: 28, amazonExtendedDays: 0, ...program },
    amazon: { stage: 'awaiting_invite', oaDate: '2026-10-19', items, extras: {}, solidTopics: [], ...amazon },
    foundation,
    days,
    runs,
    activity,
    exerciseOverrides,
    settings: { settingsVersion: 3, ...settings },
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

/** Thursday's numbers and his line for Friday, so Friday's morning mail can read them back. */
const THU_ACTIVITY = { [THU]: { steps: 9240, distanceKm: 6.1, walkKm: 5.2, activeKcal: 512, totalKcal: 2240 } };
const THU_DAY = { [THU]: { planned: [], completed: [], tomorrow: 'Two re-solves before 18:30, then the full 5 km' } };

/** Before start: an empty blob, exactly what a fresh deploy sees. */
export const beforeStart = () => ({});

/** Day 4 (Friday) with two re-solves due; Thursday's numbers and plan are logged. */
export const weekday = () => amazonState({ items: LOGGED, activity: THU_ACTIVITY, days: THU_DAY });

/** The same day at 17:15: the first two planned items logged, the run done. */
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
    days: { ...THU_DAY, [FRI]: { planned, completed } },
    runs: [{ id: 'wo-1', date: FRI, slot: 'morning', kind: 'run', minutes: 25, km: 3.1 }],
    activity: { ...THU_ACTIVITY, [FRI]: { runKm: 3.1 } },
  });
}

export const saturday = () => amazonState({ items: LOGGED });
export const sunday = () => amazonState({ items: LOGGED });

/** Interview scheduled four days after Thursday 29 Oct. */
export const interviewSoon = () =>
  amazonState({ items: LOGGED, amazon: { stage: 'interview_scheduled', interviewDate: addDays(THU, 4) } });

/** A planned rest morning on Thursday. */
export const restMorning = () => amazonState({ items: LOGGED, exerciseOverrides: { [THU]: 'rest' } });

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
