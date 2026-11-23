// The derived pieces both mails say: item rows with reasons, the run, the
// day's key rows, tonight's blocks, the next move and the closing line. Pure
// functions over engine output; digest.mjs assembles them.

import { formatHM, formatShort, lcUrl, amazonItem, taskById, FOUNDATION_SUBJECTS, AMAZON_DAYOF, EVENING_LINES } from './engine.mjs';

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

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
  const lectures = new Map((work.lecture ?? []).map((m) => [m.milestone.id, m]));
  return work.items.map((i, idx) => {
    const p = planned.get(i.id);
    const m = missions.get(i.id);
    const l = lectures.get(i.id);
    return {
      n: idx + 1,
      id: i.id,
      title: i.title,
      minutes: i.minutes,
      kind: i.kind,
      context: i.context ?? '',
      tier: p ? p.tier : m?.kind === 'task' ? m.scored.task.priority : null,
      reason: p ? p.reason : l ? `Apna College · ${l.subject.name}, next in course order` : generalReason(i, m, work.general),
      url: p && p.item.type === 'lc' && p.item.slug ? lcUrl(p.item.slug) : null,
      revision: Boolean(p?.revision),
      lecture: Boolean(l),
      itemKind: p ? (p.revision ? 'Revision' : p.item.kind) : l ? 'Lecture' : i.kind,
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

/* ---------- the run ------------------------------------------------------------- */

export function exerciseCard(today, schedule) {
  const { session, slot, logged } = today;
  const done = Boolean(logged);
  const at = schedule.slots.find((s) => s.kind === 'move')?.start ?? null;
  if (slot === 'rest') return { rest: true, at, title: 'Rest morning', name: session.name, minutes: 0, done };
  return { rest: false, at, title: session.name, name: session.name, minutes: session.minutes, done };
}

/* ---------- rows ------------------------------------------------------------------- */

const shortTitle = (s, max = 44) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

const minutesLabel = (i) => (i.partial && i.totalMinutes ? `${formatHM(i.minutes)} of ${formatHM(i.totalMinutes)}` : formatHM(i.minutes));

/** One study item under its block: title, minutes, the planner's reason, the LeetCode link. */
function slotItem(i, views) {
  const v = views.find((x) => x.id === i.id);
  return {
    id: i.id,
    title: shortTitle(i.title, 52),
    minutes: minutesLabel(i),
    reason: v?.lecture ? null : v?.reason ?? null,
    url: v?.url ?? null,
    done: Boolean(v?.done),
  };
}

const KEY_KINDS = new Set(['move', 'walk']);
const HIDDEN_STUDY = new Set(['office', 'review']);
const FREELANCE = new Set(['freelance', 'sat-freelance', 'sun-freelance']);

/** The rows worth a line in the morning: the run, every study block with work, freelance, dinner, the walk. */
export function dayPlanRows(slots, views, dinnerIds) {
  return slots
    .filter(
      (s) =>
        KEY_KINDS.has(s.kind) ||
        dinnerIds.has(s.id) ||
        FREELANCE.has(s.id) ||
        (s.kind === 'study' && !HIDDEN_STUDY.has(s.study) && s.capacity > 0),
    )
    .map((s) => ({
      id: s.id,
      kind: s.kind,
      study: s.kind === 'study',
      lecture: s.study === 'lecture',
      start: s.start,
      end: s.end,
      label: s.label,
      items: s.items.map((i) => slotItem(i, views)),
    }));
}

const NOT_TONIGHT = new Set(['settle', 'office']);

/** Every block still ahead at the evening mail time, with its open items. */
export function tonightRows(slots, views, eveningTime) {
  return slots
    .filter((s) => s.kind !== 'sleep' && !NOT_TONIGHT.has(s.id))
    .filter((s) => s.end > eveningTime || s.end < s.start)
    .map((s) => {
      const items = s.items.map((i) => slotItem(i, views));
      const open = items.filter((i) => !i.done);
      const note =
        s.study === 'review'
          ? 'log today’s numbers, write tomorrow’s line'
          : s.kind === 'study' && s.capacity > 0 && !items.length
            ? 'nothing queued'
            : s.kind === 'study' && items.length && !open.length
              ? 'all done'
              : null;
      return {
        id: s.id,
        kind: s.kind,
        study: s.kind === 'study' && s.capacity > 0,
        start: s.start,
        end: s.end,
        time: `${s.start}–${s.end}`,
        label: s.label,
        items: open,
        note,
      };
    });
}

export function overflowNote(schedule) {
  if (!schedule.overflow.length) return null;
  return `Continues tomorrow: ${schedule.overflow.map((i) => `${i.title} (${formatHM(i.minutes)} left)`).join(' · ')}`;
}

export function nextMoveFor(open, tonight, eveningTime, dayLog) {
  const allDone = Boolean(dayLog && dayLog.planned > 0 && dayLog.hits >= dayLog.planned);
  const block = tonight.find((r) => r.study && r.items.length) ?? tonight.find((r) => r.study);
  const at = block ? (block.start > eveningTime ? block.start : 'now') : eveningTime;
  return { at, item: open[0] ?? null, allDone };
}

/* ---------- objective, win condition, evening line ------------------------------------ */

export function objectiveFor(d) {
  const n = plural(d.prepItems.length, 'item');
  const hm = formatHM(d.prepMinutes);
  if (!d.started) return `Day 1 is waiting. Press Start and today becomes Day 1: ${d.focus}, ${n}, ${hm}.`;
  if (d.phase === 'general') return `${d.leadTitle}: ${plural(d.items.length, 'item')}, ${formatHM(d.minutes)}.`;
  if (d.mode === 'interview-day') return `Interview day. No new problems; the day-of checklist (${AMAZON_DAYOF.length} items) is in Surprise Prep.`;
  if (d.mode === 'done') return d.prepItems.length ? `Curriculum complete. ${n} of revision, ${hm}.` : 'Curriculum complete. Nothing is due today.';
  if (d.mode === 'interview') return `${plural(d.interview.daysTo, 'day')} to the interview. ${d.focus}: ${n}, ${hm}.`;
  return `${d.focus}: ${n}, ${hm}.`;
}

const joinAnd = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** The one measurable line that makes tonight count, from what is actually planned. */
export function winConditionFor(d) {
  if (!d.started) return 'Day 1 started in the app, so tomorrow’s mail is Day 2';
  const pool = d.phase === 'general' ? d.items : d.prepItems;
  const problems = pool.filter((i) => i.itemKind === 'Problem').length;
  const revisions = pool.filter((i) => i.revision).length;
  const bits = [];
  if (problems > 1) bits.push(`${problems} problems (${Math.ceil(problems / 2)}+ without a hint)`);
  if (problems === 1) bits.push('1 problem');
  if (revisions) bits.push(plural(revisions, 'cold re-solve'));
  const lecture = d.lecture?.length ? ', plus the lecture' : '';
  if (!bits.length) return `every planned item logged, done or not${lecture}`;
  return `${joinAnd(bits)} logged with an outcome${lecture}`;
}

/** Strong, partial or empty, from the day log; the index varies by day number. */
export function eveningLineFor(dayLog, day) {
  const kind = !dayLog || dayLog.hits === 0 ? 'empty' : dayLog.hits / dayLog.planned >= 0.6 ? 'strong' : 'partial';
  const lines = EVENING_LINES[kind];
  return { kind, line: lines[Math.abs(day) % lines.length] };
}
