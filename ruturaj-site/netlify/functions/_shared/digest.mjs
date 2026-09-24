// Turns the stored state blob into everything an email needs to say.
//
// This is why the progress store exists: scheduled functions run server-side
// with no access to the browser, so without it the morning mail could only ever
// send a date-derived counter and a rotating quote.

import { getStore } from '@netlify/blobs';
import catalog from './catalog.json' with { type: 'json' };
import { buildSchedule } from './schedule.mjs';
import { buildPraise } from './praise.mjs';
import { nextFoundation, nextTasks, titleFor, stillOpen, gateCounts } from './plan.mjs';

export const MISSION_START = '2026-09-24';
export const MISSION_END = '2027-03-03';
export const TOTAL_DAYS = 161;
/** Must match DATA_EPOCH in src/lib/schema.ts. */
export const DATA_EPOCH = 3;
/** Must match DAY_START_HOUR in src/engine/dates.ts. */
const DAY_START_HOUR = 4;
const DAY_MS = 86_400_000;

const PHASES = [
  { id: 'm1', label: 'P1', title: 'Foundation Gate', startDay: 1, endDay: 42 },
  { id: 'm2', label: 'P2', title: 'SDE Fundamentals + AI Engineering', startDay: 43, endDay: 91 },
  { id: 'm3', label: 'P3', title: 'Interview-Level Preparation', startDay: 92, endDay: 133 },
  { id: 'm4', label: 'P4', title: 'Interview Execution', startDay: 134, endDay: TOTAL_DAYS },
];

const parse = (iso) => new Date(`${iso}T12:00:00`);

const fmt = (d) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

/**
 * Today's mission date in IST, with the day rolling over at 04:00 rather than
 * midnight. The deep-work block runs to 02:00, and the end-of-day mail sends at
 * 02:30 — both belong to the day that is ending, not the next one.
 */
export function istToday(now = new Date()) {
  const istMs = now.getTime() + 330 * 60_000 - DAY_START_HOUR * 3_600_000;
  return fmt(new Date(istMs));
}

export const addDays = (iso, delta) => {
  const d = parse(iso);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function dayForDate(iso) {
  return Math.round((parse(iso) - parse(MISSION_START)) / DAY_MS) + 1;
}

export function phaseForDay(n) {
  return PHASES.find((p) => n >= p.startDay && n <= p.endDay) ?? PHASES[0];
}

export async function readState() {
  try {
    const store = getStore('blueprint');
    const data = await store.get('state', { type: 'json' });
    return data ?? null;
  } catch (err) {
    console.error('digest: could not read state blob:', err);
    return null;
  }
}

/**
 * Progress from an older epoch was discarded on every device. Until the app is
 * next opened the blob may still hold it, so the mail ignores it too — only
 * the schedule settings carry across.
 */
function currentEpoch(state) {
  if (!state) return null;
  if ((state.dataEpoch ?? 0) >= DATA_EPOCH) return state;
  return { settings: state.settings ?? {}, dataEpoch: DATA_EPOCH };
}

function dsaSummary(state, today) {
  const attempts = state.dsa ?? [];
  const solved = attempts.filter((a) => a.outcome === 'solved').length;

  // Mirrors the client weakness engine: coverage gap and inaccuracy, scaled by
  // how often the pattern shows up in interviews.
  const weakest = [...catalog.patterns]
    .map((p) => {
      const mine = attempts.filter((a) => a.pattern === p.id);
      const unique = new Set(mine.map((a) => a.problem.toLowerCase().trim())).size;
      const clean = mine.filter((a) => a.outcome === 'solved').length;
      const accuracy = mine.length === 0 ? 1 : clean / mine.length;
      const gap = 1 - Math.min(1, unique / p.targetProblems);
      return { name: p.name, score: (gap * 35 + (1 - accuracy) * 45) * (p.weight / 10) };
    })
    .sort((a, b) => b.score - a.score)[0];

  let streak = 0;
  const days = new Set(attempts.map((a) => a.date));
  let cursor = days.has(today) ? today : addDays(today, -1);
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  const target = state.settings?.dsaTargetPerDay ?? 3;
  const weakestName = weakest?.name ?? null;
  return {
    headline: weakestName ? `${weakestName} — ${target} problems` : `${target} problems, pattern-tagged`,
    total: attempts.length,
    solvedClean: solved,
    accuracy: attempts.length ? Math.round((solved / attempts.length) * 100) : 0,
    todayCount: attempts.filter((a) => a.date === today).length,
    weakest: weakestName,
    streak,
    target,
  };
}

function dayLog(state, date) {
  const log = state.days?.[date];
  if (!log) return null;
  const planned = log.planned ?? [];
  const completed = log.completed ?? [];
  const plannedSet = new Set(planned);
  // Only planned work scores; everything else is credited as extra. `completed`
  // accumulates all day while `planned` is a snapshot — the naive ratio read 800%.
  const hit = completed.filter((id) => plannedSet.has(id)).length;
  return {
    date,
    planned: planned.length,
    completed: hit,
    extras: completed.filter((id) => !plannedSet.has(id)).length,
    score: planned.length ? Math.min(100, Math.round((hit / planned.length) * 100)) : null,
    missed: stillOpen(state, date),
    done: completed.map(titleFor),
    notes: log.notes ?? null,
    recapSent: Boolean(log.recapSentAt),
  };
}

/**
 * The full digest. Returns a usable object even when no state exists yet, so a
 * first-run email is still correct rather than broken.
 */
export function buildDigest(rawState, now = new Date()) {
  const state = currentEpoch(rawState);
  const s = state ?? {};
  const today = istToday(now);
  const rawDay = dayForDate(today);
  const day = Math.min(TOTAL_DAYS, Math.max(1, rawDay));
  const phase = phaseForDay(day);

  const { total, done } = gateCounts(s);
  const gateOpen = Boolean(s.foundationUnlockedAt);
  const missions = gateOpen ? nextTasks(s, today, addDays, phase.id) : nextFoundation(s, today, addDays);
  const dsa = dsaSummary(s, today);

  const mandatoryToday = missions.filter((m) => m.mandatory).length;
  const focusToday = (s.deepWork ?? [])
    .filter((d) => d.date === today)
    .reduce((n, d) => n + d.actualMinutes, 0);

  return {
    hasState: Boolean(state),
    today,
    day,
    daysLeft: Math.max(0, TOTAL_DAYS - day),
    beforeStart: rawDay < 1,
    phase,
    gate: {
      open: gateOpen,
      overridden: s.foundationOverride === true,
      done,
      total,
      pct: Math.round((done / total) * 100),
    },
    missions,
    carriedCount: missions.filter((m) => m.carriedFrom).length,
    dsa,
    yesterday: dayLog(s, addDays(today, -1)),
    todayLog: dayLog(s, today),
    schedule: buildSchedule(s.settings, missions, dsa),
    // What today's plan is worth: the gate moves by this much if it all lands.
    gateAfterToday: gateOpen ? null : Math.round(((done + mandatoryToday) / total) * 100),
    praise: buildPraise(s, today, addDays),
    dayClosed: Boolean(s.days?.[today]?.closedAt),
    runsToday: (s.runs ?? []).filter((r) => r.date === today).map((r) => `${r.slot} ${r.km}km`),
    focusToday,
    workCount: (s.work ?? []).length,
    applications: (s.applications ?? []).length,
  };
}
