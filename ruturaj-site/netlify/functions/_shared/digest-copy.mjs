// The derived pieces both mails say: item rows with reasons, the exercise
// card, the timetable, tonight's blocks, the objective and the "by tonight"
// outcomes. Pure functions over engine output; digest.mjs assembles them.

import { formatHM, formatShort, lcUrl, amazonItem, taskById, FOUNDATION_SUBJECTS, AMAZON_DAYOF, EVENING_LINES } from './engine.mjs';

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The first sentence of a longer note, for one-line summaries. */
export const firstSentence = (s) => {
  const m = /^(.*?[.!?])(\s|$)/.exec(String(s ?? ''));
  return m ? m[1] : String(s ?? '');
};

/* ---------- items ----------------------------------------------------------- */

function generalReason(item, mission, plan) {
  if (item.kind === 'dsa') return firstSentence(plan?.dsa?.note) || 'Daily DSA target';
  if (!mission) return 'Next in course order';
  if (mission.carriedFrom) return `Planned on ${formatShort(mission.carriedFrom)} and still open`;
  if (mission.kind === 'foundation') return `${mission.subject.name} · next in course order`;
  return mission.scored.reasons[0]?.label ?? 'Ranked by the priority engine';
}

/** Every planned item with its tier, one-line reason, link and done flag. */
export function itemViews(work, completed) {
  const planned = new Map((work.amazon?.planned ?? []).map((p) => [p.id, p]));
  const missions = new Map(
    (work.general?.missions ?? []).map((m) => [m.kind === 'foundation' ? m.milestone.id : m.scored.task.id, m]),
  );
  return work.items.map((i, idx) => {
    const p = planned.get(i.id);
    const m = missions.get(i.id);
    return {
      n: idx + 1,
      id: i.id,
      title: i.title,
      minutes: i.minutes,
      kind: i.kind,
      context: i.context ?? '',
      tier: p ? p.tier : m?.kind === 'task' ? m.scored.task.priority : null,
      reason: p ? p.reason : generalReason(i, m, work.general),
      url: p && p.item.type === 'lc' && p.item.slug ? lcUrl(p.item.slug) : null,
      revision: Boolean(p?.revision),
      itemKind: p ? (p.revision ? 'Revision' : p.item.kind) : i.kind,
      done: completed.has(i.id),
      carried: Boolean(i.carried),
    };
  });
}

/** A readable title for a completed id that may not be in today's plan any more. */
export function titleForId(id, items) {
  const own = items.find((i) => i.id === id);
  if (own) return own.title;
  const revision = id.startsWith('rev:');
  const a = amazonItem(revision ? id.slice(4) : id);
  if (a) return revision ? `Re-solve: ${a.title}` : a.title;
  const t = taskById(id);
  if (t) return t.title;
  for (const s of FOUNDATION_SUBJECTS) {
    const m = s.milestones.find((x) => x.id === id);
    if (m) return m.title;
  }
  return id;
}

/* ---------- exercise ---------------------------------------------------------- */

export function exerciseCard(today, schedule) {
  const { session, slot, logged } = today;
  const done = Boolean(logged);
  if (slot === 'rest') return { rest: true, moved: null, title: 'Rest day', name: session.name, lines: [], minutes: 0, done };
  const parts = session.parts.length > 3 ? session.parts.filter((p) => p.id !== 'cool') : session.parts;
  const lines = parts.slice(0, 3).map((p) => `${p.label} · ${p.minutes}m — ${p.detail}`);
  const moved = slot === 'evening' ? (schedule.slots.find((s) => s.id === 'pm-move')?.start ?? null) : null;
  return {
    rest: false,
    moved,
    title: moved ? `Run moved to ${moved} this evening` : session.name,
    name: session.name,
    lines,
    minutes: session.minutes,
    done,
  };
}

/* ---------- timetable and tonight ----------------------------------------------- */

/** Timetable rows stay compact; the full title is in the numbered set. */
const shortTitle = (s, max = 44) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

const itemLabel = (i) =>
  `${shortTitle(i.title)} · ${i.partial && i.totalMinutes ? `${formatHM(i.minutes)} of ${formatHM(i.totalMinutes)}` : formatHM(i.minutes)}`;

const row = (s) => ({
  id: s.id,
  kind: s.kind,
  study: Boolean(s.study) && s.capacity > 0,
  start: s.start,
  end: s.end,
  time: `${s.start}–${s.end}`,
  label: s.label,
  items: s.items.map(itemLabel),
});

/** One row per slot, study items under their slot, never more than 12 rows. */
export function timetableRows(schedule) {
  let slots = schedule.slots;
  if (slots.length > 12) slots = slots.filter((s) => s.kind !== 'sleep');
  return slots.slice(0, 12).map(row);
}

export function overflowNote(schedule) {
  if (!schedule.overflow.length) return null;
  return `Continues tomorrow: ${schedule.overflow.map((i) => `${i.title} (${formatHM(i.minutes)} left)`).join(' · ')}`;
}

const NOT_TONIGHT = new Set(['settle', 'settle-short']);

/** The blocks still ahead at the evening mail time, with their items. */
export function tonightRows(schedule, eveningTime) {
  return schedule.slots
    .filter((s) => s.kind !== 'sleep' && s.kind !== 'work' && !NOT_TONIGHT.has(s.id))
    .filter((s) => s.end > eveningTime || s.end < s.start)
    .map((s) => {
      const r = row(s);
      const note =
        s.id === 'block3' && !r.items.length
          ? 'optional, only if you are fresh'
          : r.study && !r.items.length
            ? 'nothing queued'
            : null;
      return { ...r, note };
    });
}

export function nextMoveFor(open, tonight, eveningTime, dayLog) {
  const allDone = Boolean(dayLog && dayLog.planned > 0 && dayLog.hits >= dayLog.planned);
  const block = tonight.find((r) => r.study && r.items.length) ?? tonight.find((r) => r.study);
  const at = block ? (block.start > eveningTime ? block.start : 'now') : eveningTime;
  return { at, item: open[0] ?? null, allDone };
}

/* ---------- objective, outcomes, evening line ------------------------------------- */

export function objectiveFor(d) {
  const n = plural(d.items.length, 'item');
  const hm = formatHM(d.minutes);
  if (!d.started) return `Day 1 is waiting. Press Start and today becomes Day 1: ${d.focus}, ${n}, ${hm}.`;
  if (d.phase === 'general') return `${d.leadTitle}: ${n}, ${hm}.`;
  if (d.mode === 'interview-day') return `Interview day. No new problems; the day-of checklist (${AMAZON_DAYOF.length} items) is on the Amazon tab.`;
  if (d.mode === 'done') return d.items.length ? `Curriculum complete. ${n} of revision, ${hm}.` : 'Curriculum complete. Nothing is due today.';
  if (d.mode === 'interview') return `${plural(d.interview.daysTo, 'day')} to the interview. ${d.focus}: ${n}, ${hm}.`;
  return `${d.focus}: ${n}, ${hm}.`;
}

export function paceLine(plan) {
  if (!plan || plan.mode === 'interview-day') return null;
  return `Tier floor ${plan.tierFloor} · ${firstSentence(plan.pace.note)}`;
}

/** Two measurable outcomes for tonight, derived from what is actually planned. */
export function outcomesFor(d) {
  const out = [];
  if (!d.started) out.push('Day 1 started in the app, so tomorrow’s mail is Day 2');
  if (d.phase === 'general') {
    const missions = d.items.filter((i) => i.kind !== 'dsa').length;
    if (missions) out.push(`${plural(missions, 'mission')} closed`);
    const dsa = d.generalPlan?.dsa?.target ?? 0;
    if (dsa) out.push(`${plural(dsa, 'DSA problem')} logged with solve times`);
  } else {
    const problems = d.items.filter((i) => i.itemKind === 'Problem').length;
    const revisions = d.items.filter((i) => i.revision).length;
    const lp = d.items.filter((i) => i.itemKind === 'LP').length;
    const mocks = d.items.filter((i) => i.itemKind === 'Mock').length;
    if (problems === 1) out.push('1 problem logged with an outcome');
    if (problems > 1) out.push(`${problems} problems logged with an outcome, at least ${Math.ceil(problems / 2)} solved without a hint`);
    if (revisions) out.push(`${plural(revisions, 're-solve')} passed cold`);
    if (lp) out.push(`${plural(lp, 'LP story', 'LP stories')} written and said out loud`);
    if (mocks) out.push(`${plural(mocks, 'mock')} done under time`);
  }
  if (out.length < 2) out.push('Every planned item logged, done or not');
  return out.slice(0, 2);
}

/** Strong, partial or empty, from the day log; the index varies by day number. */
export function eveningLineFor(dayLog, day) {
  const kind = !dayLog || dayLog.hits === 0 ? 'empty' : dayLog.hits / dayLog.planned >= 0.6 ? 'strong' : 'partial';
  const lines = EVENING_LINES[kind];
  return { kind, line: lines[Math.abs(day) % lines.length] };
}
