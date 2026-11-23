// Turns the stored state blob into everything the two mails say, through the
// same engine the app runs (engine.mjs is generated from src/engine). The
// mail and the screen cannot disagree about today's plan.

import { getStore } from '@netlify/blobs';
import * as E from './engine.mjs';
import {
  itemViews,
  titleForId,
  exerciseCard,
  dayPlanRows,
  overflowNote,
  tonightRows,
  nextMoveFor,
  objectiveFor,
  winConditionFor,
  eveningLineFor,
} from './digest-copy.mjs';

export const STORE = 'blueprint';
export const STATE_KEY = 'state';

/**
 * The raw state blob, or null on a genuine first run. A read failure throws:
 * treating it as an empty blob once sent a "Day 1 is waiting" mail and blocked
 * the real one for the day, so callers skip the tick and retry instead.
 */
export async function readState() {
  const store = getStore(STORE);
  const data = await store.get(STATE_KEY, { type: 'json' });
  return data ?? null;
}

/** "Day 9 · Binary search" -> "Binary search"; the roadmap focus is returned as is. */
const topicOf = (focus) => focus.replace(/^Day \d+ · /, '');

function leadTitle(work) {
  const m = work.general?.missions[0];
  if (!m) return work.general?.dsa.headline ?? 'Roadmap';
  return m.kind === 'foundation' ? `${m.subject.name} · ${m.milestone.title}` : m.scored.task.title;
}

function workoutLabel(logged) {
  if (!logged) return null;
  const kind = logged.kind === 'run' ? 'Run' : logged.kind === 'walk' ? 'Walk' : logged.kind.charAt(0).toUpperCase() + logged.kind.slice(1);
  return `${kind} · ${logged.minutes} min${logged.km ? ` · ${logged.km} km` : ''}`;
}

const startOf = (slots, pred) => slots.find(pred)?.start ?? null;

const toMin = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** Minutes of his own time between getting home and the first block (0 on weekends). */
const ownTimeOf = (slots) => {
  const s = slots.find((x) => x.id === 'settle');
  return s ? Math.max(0, toMin(s.end) - toMin(s.start)) : 0;
};

/**
 * The full digest for `now`. Always returns a usable object: an empty blob
 * means "Day 1 is waiting", never a broken mail.
 */
export function buildDigest(raw, now = new Date()) {
  // A blob from an older epoch is read the way the app will rewrite it: old
  // progress dropped, Day 1 re-anchored to today. The mail never resurrects it.
  const parsed = E.parseState(raw);
  const state = E.isStaleEpoch(parsed) ? E.freshForNewEpoch(parsed, E.todayISO(now)) : parsed;
  E.configureMission(state.program.phase === 'general' ? state.program.generalStartedOn : null);

  const today = E.todayISO(now);
  const yesterday = E.addDays(today, -1);
  const info = E.programInfo(state, today);
  const work = E.todayWork(state, today);
  const dayType = E.dayTypeOf(today);
  const schedule = E.buildSchedule(state.settings, work.items, dayType, E.exerciseSlotFor(state, today), E.dayModeFor(state, today));
  const slots = E.withDinner(schedule.slots, today, state.settings.walkTargetKm);
  const session = E.sessionFor(state, today);
  const plan = work.amazon ?? null;
  const settings = state.settings;

  const log = state.days[today] ?? null;
  const completed = new Set(log?.completed ?? []);
  const items = itemViews(work, completed);
  const prepItems = work.phase === 'general' ? items : items.filter((i) => !i.lecture);
  const open = items.filter((i) => !i.done);
  const dayLog = log
    ? {
        planned: log.planned.length,
        hits: E.plannedHits(state, today),
        extras: E.dayExtras(state, today),
        score: E.dayScore(state, today) ?? null,
      }
    : null;

  // Ticks from the day log first, then prep logs the app did not tick (a
  // re-solve keeps its original doneOn, so it only ever appears once).
  const doneToday = [
    ...[...completed].map((id) => titleForId(id, items)),
    ...E.amazonLoggedOn(state, today)
      .filter((i) => !completed.has(i.key) && !completed.has(`rev:${i.key}`))
      .map((i) => i.title),
  ].filter((t, i, all) => all.indexOf(t) === i);

  const tonight = tonightRows(slots, items, settings.eveningEmailTime);
  const interview =
    plan && plan.daysToInterview !== null && state.amazon.interviewDate
      ? { date: state.amazon.interviewDate, daysTo: plan.daysToInterview }
      : null;
  const yesterdayActivity = E.activityFor(state, yesterday);
  const todayActivity = E.activityFor(state, today);
  const walkSlot = slots.find((s) => s.kind === 'walk') ?? null;

  const d = {
    today,
    clock: E.istClock(now),
    weekday: E.formatWeekday(today),
    dateLabel: E.formatShort(today),
    longDate: E.formatLong(today),
    dayType,
    dayTypeLabel: E.DAY_TYPE_LABEL[dayType],
    phase: work.phase,
    started: info.started,
    day: info.day,
    amazon: info.amazon,
    general: info.general,
    daysToTarget: info.daysToTarget,
    targetDate: E.TARGET_DATE,
    mode: plan ? plan.mode : 'general',
    interview,
    stage: state.amazon.stage,
    focus: work.focus,
    topic: topicOf(work.focus),
    leadTitle: work.phase === 'general' ? leadTitle(work) : topicOf(work.focus),
    curriculumDay: plan?.planned.find((p) => !p.revision)?.item.day ?? null,
    minutes: work.minutes,
    items,
    prepItems,
    prepMinutes: prepItems.reduce((n, i) => n + i.minutes, 0),
    lecture: (work.lecture ?? []).map((m) => ({ title: m.milestone.title, minutes: m.minutes, subject: m.subject.name })),
    open,
    plan,
    generalPlan: work.general ?? null,
    schedule,
    rows: dayPlanRows(slots, items, E.DINNER_SLOT_IDS),
    overflow: overflowNote(schedule),
    tonight,
    nextMove: nextMoveFor(open, tonight, settings.eveningEmailTime, dayLog),
    runAt: startOf(slots, (s) => s.kind === 'move'),
    prepAt: startOf(slots, (s) => s.study === 'deep'),
    dinnerAt: startOf(slots, (s) => E.DINNER_SLOT_IDS.has(s.id)),
    reviewAt: startOf(slots, (s) => s.id === 'sun-review'),
    freeAt: startOf(slots, (s) => s.kind === 'free' && s.id !== 'settle'),
    dinner: E.dinnerFor(today),
    walk: { at: walkSlot?.start ?? null, end: walkSlot?.end ?? null, targetKm: settings.walkTargetKm },
    ownTime: ownTimeOf(slots),
    exercise: exerciseCard(session, { slots }),
    workout: workoutLabel(session.logged),
    dayLog,
    doneToday,
    streak: info.started ? E.executionStreak(state, today) : 0,
    yesterday: {
      activity: E.hasActivity(yesterdayActivity) ? E.activityLine(yesterdayActivity) : null,
      plan: state.days[yesterday]?.tomorrow ?? null,
    },
    todayActivity: E.hasActivity(todayActivity) ? E.activityLine(todayActivity) : null,
    quote: E.quoteForDay(info.started ? info.day : 1),
    summary: work.phase === 'general' ? null : E.amazonSummary(state, today),
    settings: {
      name: settings.name.trim() || 'Ruturaj',
      morningEmailTime: settings.morningEmailTime,
      eveningEmailTime: settings.eveningEmailTime,
      studyBlock3Enabled: settings.studyBlock3Enabled,
      emailEnabled: settings.emailEnabled,
    },
  };
  d.objective = objectiveFor(d);
  d.win = winConditionFor(d);
  d.evening = eveningLineFor(dayLog, info.day);
  return d;
}
