// Turns the stored state blob into everything the two mails say, through the
// same engine the app runs (engine.mjs is generated from src/engine). The
// mail and the screen cannot disagree about today's plan.

import { getStore } from '@netlify/blobs';
import * as E from './engine.mjs';
import {
  itemViews,
  titleForId,
  exerciseCard,
  timetableRows,
  overflowNote,
  tonightRows,
  nextMoveFor,
  objectiveFor,
  paceLine,
  outcomesFor,
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

/**
 * The full digest for `now`. Always returns a usable object: an empty blob
 * means "Day 1 is waiting", never a broken mail.
 */
export function buildDigest(raw, now = new Date()) {
  const state = E.parseState(raw);
  E.configureMission(state.program.phase === 'general' ? state.program.generalStartedOn : null);

  const today = E.todayISO(now);
  const info = E.programInfo(state, today);
  const work = E.todayWork(state, today);
  const dayType = E.dayTypeOf(today);
  const exerciseSlot = E.exerciseSlotFor(state, today);
  const schedule = E.buildSchedule(state.settings, work.items, dayType, exerciseSlot);
  const session = E.sessionFor(state, today);
  const plan = work.amazon ?? null;
  const settings = state.settings;

  const log = state.days[today] ?? null;
  const completed = new Set(log?.completed ?? []);
  const items = itemViews(work, completed);
  const open = items.filter((i) => !i.done);
  const dayLog = log
    ? {
        planned: log.planned.length,
        hits: E.plannedHits(state, today),
        extras: E.dayExtras(state, today),
        score: E.dayScore(state, today) ?? null,
      }
    : null;

  // Ticks from the day log first, then Amazon logs the app did not tick (a
  // re-solve keeps its original doneOn, so it only ever appears once).
  const doneToday = [
    ...[...completed].map((id) => titleForId(id, items)),
    ...E.amazonLoggedOn(state, today)
      .filter((i) => !completed.has(i.key) && !completed.has(`rev:${i.key}`))
      .map((i) => i.title),
  ].filter((t, i, all) => all.indexOf(t) === i);

  const timetable = timetableRows(schedule);
  const tonight = tonightRows(schedule, settings.eveningEmailTime);
  const interview =
    plan && plan.daysToInterview !== null && state.amazon.interviewDate
      ? { date: state.amazon.interviewDate, daysTo: plan.daysToInterview }
      : null;

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
    open,
    plan,
    generalPlan: work.general ?? null,
    schedule,
    timetable,
    overflow: overflowNote(schedule),
    tonight,
    nextMove: nextMoveFor(open, tonight, settings.eveningEmailTime, dayLog),
    freeAt: tonight.find((r) => r.kind === 'free')?.start ?? null,
    exercise: exerciseCard(session, schedule),
    workout: workoutLabel(session.logged),
    dayLog,
    doneToday,
    quote: E.quoteForDay(info.started ? info.day : 1),
    summary: work.phase === 'general' ? null : E.amazonSummary(state, today),
    settings: {
      morningEmailTime: settings.morningEmailTime,
      eveningEmailTime: settings.eveningEmailTime,
      studyBlock3Enabled: settings.studyBlock3Enabled,
      exerciseSlot: settings.exerciseSlot,
      emailEnabled: settings.emailEnabled,
    },
  };
  d.objective = objectiveFor(d);
  d.pace = paceLine(plan);
  d.outcomes = outcomesFor(d);
  d.evening = eveningLineFor(dayLog, info.day);
  return d;
}
