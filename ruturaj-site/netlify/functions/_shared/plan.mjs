// Mirrors src/engine/planner.ts so the mail and the app agree on what today is.
//
// Two rules matter most, and both must match the client exactly:
//   1. Anything planned on an earlier day and still open comes first — missed
//      work carries forward instead of dropping off the list.
//   2. Apna and 5ME are courses, so they are walked in module order; the
//      PPA/LB/DSA/LSP practice tier is interleaved across subjects.

import catalog from './catalog.json' with { type: 'json' };

const MISSIONS_PER_DAY = 3;
const CARRY_LOOKBACK_DAYS = 7;
const SEQUENTIAL = new Set(catalog.sequentialTiers ?? [1, 2]);

const isDone = (state, id) => {
  const task = state.tasks?.[id]?.status;
  return Boolean(state.foundation?.[id]) || task === 'done' || task === 'skipped';
};

/** id -> most recent earlier date it was planned for, while still open. */
export function carriedOver(state, date, addDays) {
  const out = new Map();
  for (let i = 1; i <= CARRY_LOOKBACK_DAYS; i += 1) {
    const d = addDays(date, -i);
    const log = state.days?.[d];
    if (!log) continue;
    for (const id of log.planned ?? []) {
      if (!out.has(id) && !isDone(state, id)) out.set(id, d);
    }
  }
  return out;
}

const asMission = (subject, m, carried) => ({
  id: m.id,
  title: m.title,
  context: subject.name,
  minutes: m.estMinutes,
  proof: m.proof,
  mandatory: m.mandatory,
  carriedFrom: carried.get(m.id) ?? null,
});

function openInTier(state, tier) {
  const queues = catalog.foundation
    .filter((s) => s.tier === tier)
    .map((subject) =>
      subject.milestones
        .filter((m) => m.mandatory && !state.foundation?.[m.id])
        .map((m) => ({ subject, m })),
    );
  if (SEQUENTIAL.has(tier)) return queues.flat();
  const out = [];
  const longest = Math.max(0, ...queues.map((q) => q.length));
  for (let i = 0; i < longest; i += 1) for (const q of queues) if (q[i]) out.push(q[i]);
  return out;
}

export function nextFoundation(state, date, addDays) {
  const carried = carriedOver(state, date, addDays);
  const out = [];
  const seen = new Set();
  const take = ({ subject, m }) => {
    if (out.length >= MISSIONS_PER_DAY || seen.has(m.id)) return;
    seen.add(m.id);
    out.push(asMission(subject, m, carried));
  };
  const everything = catalog.foundation.flatMap((subject) =>
    subject.milestones.map((m) => ({ subject, m })),
  );

  for (const x of everything) if (carried.has(x.m.id) && !state.foundation?.[x.m.id]) take(x);
  for (const tier of [1, 2, 3]) openInTier(state, tier).forEach(take);
  for (const x of everything) if (!state.foundation?.[x.m.id]) take(x);
  return out;
}

/** Mirrors the client priority engine closely enough to agree on the top few. */
export function nextTasks(state, date, addDays, phaseId = 'm2') {
  const PRIORITY_BONUS = { P0: 45, P1: 25, P2: 8, P3: 0 };
  const PHASE_ORDER = { m1: 1, m2: 2, m3: 3, m4: 4 };
  const carried = carriedOver(state, date, addDays);
  const done = (id) => state.tasks?.[id]?.status === 'done';

  const ranked = catalog.tasks
    .filter((t) => !done(t.id) && state.tasks?.[t.id]?.status !== 'skipped')
    .filter((t) => (t.prereqs ?? []).every(done))
    .map((t) => ({
      id: t.id,
      title: t.title,
      context: t.track,
      minutes: t.estMinutes,
      proof: t.proof,
      carriedFrom: carried.get(t.id) ?? null,
      score:
        t.careerValue * 8 +
        (PRIORITY_BONUS[t.priority] ?? 0) +
        (state.tasks?.[t.id]?.status === 'in_progress' ? 18 : 0) +
        (PHASE_ORDER[t.earliestPhase ?? 'm2'] > PHASE_ORDER[phaseId] ? -70 : 0) -
        Math.round(t.estMinutes / 20),
    }))
    .sort((a, b) => b.score - a.score);

  return [...ranked.filter((t) => t.carriedFrom), ...ranked.filter((t) => !t.carriedFrom)].slice(
    0,
    MISSIONS_PER_DAY,
  );
}

export function titleFor(id) {
  const task = catalog.tasks.find((t) => t.id === id);
  if (task) return task.title;
  for (const s of catalog.foundation) {
    const m = s.milestones.find((x) => x.id === id);
    if (m) return m.title;
  }
  // In an old day log but no longer in the catalog. A raw id in an email reads
  // like a bug, so say what actually happened.
  return 'a retired item (syllabus has since changed)';
}

/** Items still open that a day's plan included — what carries to tomorrow. */
export function stillOpen(state, date) {
  const log = state.days?.[date];
  if (!log) return [];
  return (log.planned ?? []).filter((id) => !isDone(state, id)).map(titleFor);
}

export function gateCounts(state) {
  let total = 0;
  let done = 0;
  for (const s of catalog.foundation) {
    for (const m of s.milestones) {
      if (!m.mandatory) continue;
      total += 1;
      if (state.foundation?.[m.id]) done += 1;
    }
  }
  return { total, done };
}
