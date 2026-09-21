// Turns the stored state blob into everything an email needs to say.
//
// This is why the progress store exists: scheduled functions run server-side
// with no access to the browser, so without it the morning mail could only ever
// send a date-derived counter and a rotating quote.

import { getStore } from '@netlify/blobs';
import catalog from './catalog.json' with { type: 'json' };

export const MISSION_START = '2026-09-21';
export const MISSION_END = '2027-02-28';
export const TOTAL_DAYS = 161;
const DAY_MS = 86_400_000;

const PHASES = [
  { id: 'm1', label: 'P1', title: 'Foundation Gate', startDay: 1, endDay: 42 },
  { id: 'm2', label: 'P2', title: 'SDE Fundamentals + AI Engineering', startDay: 43, endDay: 91 },
  { id: 'm3', label: 'P3', title: 'Interview-Level Preparation', startDay: 92, endDay: 133 },
  { id: 'm4', label: 'P4', title: 'Interview Execution', startDay: 134, endDay: TOTAL_DAYS },
];

const parse = (iso) => new Date(`${iso}T12:00:00`);

const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Today in IST, regardless of where the function actually runs. */
export function istToday() {
  const now = new Date();
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60_000);
  return fmt(ist);
}

export const addDays = (iso, delta) => {
  const d = parse(iso);
  d.setDate(d.getDate() + delta);
  return fmt(d);
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
 * Mirrors the client planner: Apna College (tier 1), then Five Minute
 * Engineering (tier 2), then PPA/LB/LSP/DSA (tier 3). A tier is only left
 * behind once it has no mandatory work remaining.
 */
function nextFoundation(state, count) {
  const out = [];
  const open = (m) => !state.foundation?.[m.id];

  for (const tier of [1, 2, 3]) {
    for (const subject of catalog.foundation.filter((s) => s.tier === tier)) {
      if (out.length >= count) return out;
      const next = subject.milestones.find((m) => open(m) && m.mandatory);
      if (next && !out.some((o) => o.id === next.id)) {
        out.push({ id: next.id, title: next.title, context: subject.name });
      }
    }
    if (out.length > 0) return out;
  }

  for (const subject of catalog.foundation) {
    if (out.length >= count) return out;
    const next = subject.milestones.find(open);
    if (next && !out.some((o) => o.id === next.id)) {
      out.push({ id: next.id, title: next.title, context: subject.name });
    }
  }
  return out;
}

/** Mirrors the client priority engine closely enough to agree on the top few. */
function nextTasks(state, count) {
  const PRIORITY_BONUS = { P0: 45, P1: 25, P2: 8, P3: 0 };
  const done = (id) => state.tasks?.[id]?.status === 'done';

  return catalog.tasks
    .filter((t) => !done(t.id) && state.tasks?.[t.id]?.status !== 'skipped')
    .filter((t) => (t.prereqs ?? []).every(done))
    .map((t) => ({
      id: t.id,
      title: t.title,
      context: t.track,
      score:
        t.careerValue * 8 +
        (PRIORITY_BONUS[t.priority] ?? 0) +
        (state.tasks?.[t.id]?.status === 'in_progress' ? 18 : 0) -
        Math.round(t.estMinutes / 20),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

function dsaSummary(state) {
  const attempts = state.dsa ?? [];
  const today = istToday();
  const solved = attempts.filter((a) => a.outcome === 'solved').length;
  const seen = new Set(attempts.map((a) => a.pattern));

  // Mirrors the client weakness engine: coverage gap and inaccuracy, both
  // scaled by how often the pattern shows up in interviews. Staleness is left
  // out here — it moves the ranking far less than the other two and would mean
  // duplicating the date walk for every pattern on every send.
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

  return {
    total: attempts.length,
    solvedClean: solved,
    accuracy: attempts.length ? Math.round((solved / attempts.length) * 100) : 0,
    todayCount: attempts.filter((a) => a.date === today).length,
    patternsTouched: seen.size,
    weakest: weakest?.name ?? null,
    streak,
    target: state.settings?.dsaTargetPerDay ?? 3,
  };
}

function dayLog(state, date) {
  const log = state.days?.[date];
  if (!log) return null;
  const planned = log.planned ?? [];
  const completed = log.completed ?? [];
  return {
    date,
    planned: planned.length,
    completed: completed.length,
    score: planned.length ? Math.round((completed.length / planned.length) * 100) : null,
    missed: planned.filter((id) => !completed.includes(id)).map(titleFor),
    notes: log.notes ?? null,
  };
}

export function titleFor(id) {
  const task = catalog.tasks.find((t) => t.id === id);
  if (task) return task.title;
  for (const s of catalog.foundation) {
    const m = s.milestones.find((x) => x.id === id);
    if (m) return m.title;
  }
  // The id is in an old day log but no longer in the catalog — the syllabus was
  // rewritten under it. A raw id in an email reads like a bug, so say what
  // actually happened instead.
  return 'a retired item (syllabus has since changed)';
}

/**
 * The full digest. Returns a usable object even when no state exists yet, so a
 * first-run email is still correct rather than broken.
 */
export function buildDigest(state) {
  const s = state ?? {};
  const today = istToday();
  const rawDay = dayForDate(today);
  const day = Math.min(TOTAL_DAYS, Math.max(1, rawDay));
  const phase = phaseForDay(day);

  const mandatoryTotal = catalog.foundation.reduce(
    (n, x) => n + x.milestones.filter((m) => m.mandatory).length,
    0,
  );
  const mandatoryDone = catalog.foundation.reduce(
    (n, x) => n + x.milestones.filter((m) => m.mandatory && s.foundation?.[m.id]).length,
    0,
  );
  const gateOpen = Boolean(s.foundationUnlockedAt);

  const missions = gateOpen ? nextTasks(s, 3) : nextFoundation(s, 3);

  const runsToday = (s.runs ?? []).filter((r) => r.date === today);
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
      done: mandatoryDone,
      total: mandatoryTotal,
      pct: Math.round((mandatoryDone / mandatoryTotal) * 100),
    },
    missions,
    dsa: dsaSummary(s),
    yesterday: dayLog(s, addDays(today, -1)),
    todayLog: dayLog(s, today),
    runsToday: runsToday.map((r) => `${r.slot} ${r.km}km`),
    focusToday,
    workCount: (s.work ?? []).length,
    applications: (s.applications ?? []).length,
  };
}
