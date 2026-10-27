import type { AppState } from '@/lib/schema';
import {
  AMAZON_ITEMS,
  AMAZON_PROBLEM_SLUGS,
  AMAZON_ASKED_SLUGS,
  effectiveTier,
  solidDays,
  revisionsDue,
  type AmazonItem,
} from './amazon';
import { AMAZON_LP, AMAZON_RESUME, AMAZON_GENAI, AMAZON_DAYOF, AMAZON_DAYS, AMAZON_FREQ } from '@/data/amazon';
import { todayISO, addDays } from './dates';

/**
 * Evidence, not a readiness percentage. An interview is passed with problems
 * solved cold, stories said out loud and mocks survived, so that is what gets
 * counted, and "logged" is never mistaken for "mastered".
 */

export interface Counter {
  done: number;
  total: number;
}

export interface AmazonSummary {
  problems: { total: number; logged: number; independent: number; hint: number; reviewed: number };
  asked: { total: number; logged: number; independent: number };
  revisions: { due: number; passed: number; scheduled: number };
  lp: Counter;
  resume: Counter;
  genai: Counter;
  dayof: Counter;
  mocks: Counter;
  learn: Counter;
  freq: Counter;
  items: Counter;
  minutes: { done: number; total: number };
  byPhase: Array<{ phase: number; done: number; total: number; minutesDone: number; minutesTotal: number }>;
  byDay: Array<{ n: number; done: number; total: number; pct: number }>;
  todayCount: number;
  streak: number;
  weakTopics: string[];
}

const count = (ids: readonly string[], done: Record<string, unknown>): Counter => ({
  done: ids.filter((id) => done[id]).length,
  total: ids.length,
});

/** Best outcome ever logged for a problem slug, across repeats and revisits. */
function slugOutcome(state: AppState, slug: string): 'independent' | 'hint' | 'reviewed' | null {
  const keys = AMAZON_ITEMS.filter((i) => i.slug === slug).map((i) => i.key);
  const outcomes = keys.map((k) => state.amazon.items[k]?.outcome).filter(Boolean);
  if (outcomes.length === 0) return null;
  if (outcomes.includes('independent')) return 'independent';
  if (outcomes.includes('hint')) return 'hint';
  return 'reviewed';
}

export function amazonSummary(state: AppState, today: string = todayISO()): AmazonSummary {
  const done = state.amazon.items;
  const solid = solidDays(state.amazon.solidTopics);

  const outcomes = AMAZON_PROBLEM_SLUGS.map((s) => slugOutcome(state, s));
  const askedOutcomes = AMAZON_ASKED_SLUGS.map((s) => slugOutcome(state, s));

  const logs = Object.values(done);
  const passed = logs.filter((l) => l.revisits > 0 && l.outcome === 'independent').length;
  const scheduled = logs.filter((l) => l.revisitOn && l.revisitOn > today).length;

  const byPhase = [1, 2, 3].map((phase) => {
    const items = AMAZON_ITEMS.filter((i) => i.phase === phase);
    const finished = items.filter((i) => done[i.key]);
    return {
      phase,
      done: finished.length,
      total: items.length,
      minutesDone: finished.reduce((n, i) => n + i.minutes, 0),
      minutesTotal: items.reduce((n, i) => n + i.minutes, 0),
    };
  });

  const byDay = AMAZON_DAYS.map((d) => {
    const items = AMAZON_ITEMS.filter((i) => i.day === d.n);
    const finished = items.filter((i) => done[i.key]).length;
    return { n: d.n, done: finished, total: items.length, pct: items.length ? Math.round((finished / items.length) * 100) : 0 };
  });

  // A day counts when anything was logged: a first solve (doneOn) or a re-solve
  // (a rev: id in that day's completed list).
  const dates = new Set(logs.map((l) => l.doneOn));
  for (const [date, log] of Object.entries(state.days)) {
    if (log.completed.some((id) => id.startsWith('rev:'))) dates.add(date);
  }
  let streak = 0;
  let cursor = dates.has(today) ? today : addDays(today, -1);
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  // Topics where more than one problem needed a hint or the solution.
  const weak = new Map<string, number>();
  for (const i of AMAZON_ITEMS) {
    const o = done[i.key]?.outcome;
    if (o === 'hint' || o === 'reviewed') weak.set(i.topic, (weak.get(i.topic) ?? 0) + 1);
  }
  const weakTopics = [...weak.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([t]) => t);

  const mockKeys = AMAZON_ITEMS.filter((i) => i.kind === 'Mock').map((i) => i.key);
  const learnKeys = AMAZON_ITEMS.filter((i) => i.kind === 'Learn').map((i) => i.key);
  const freqDone = AMAZON_FREQ.filter((r) =>
    r.keys ? r.keys.some((k) => done[k]) : r.xkey ? Boolean(state.amazon.extras[r.xkey]) : false,
  ).length;

  const counted = AMAZON_ITEMS.filter((i) => effectiveTier(i, solid) !== 'P3');
  const minutesTotal = counted.reduce((n, i) => n + i.minutes, 0);
  const minutesDone = counted.filter((i) => done[i.key]).reduce((n, i) => n + i.minutes, 0);

  return {
    problems: {
      total: AMAZON_PROBLEM_SLUGS.length,
      logged: outcomes.filter(Boolean).length,
      independent: outcomes.filter((o) => o === 'independent').length,
      hint: outcomes.filter((o) => o === 'hint').length,
      reviewed: outcomes.filter((o) => o === 'reviewed').length,
    },
    asked: {
      total: AMAZON_ASKED_SLUGS.length,
      logged: askedOutcomes.filter(Boolean).length,
      independent: askedOutcomes.filter((o) => o === 'independent').length,
    },
    revisions: { due: revisionsDue(state, today).length, passed, scheduled },
    lp: count(AMAZON_LP.map((x) => x.id), done),
    resume: count(AMAZON_RESUME.map((x) => x.id), done),
    genai: count(AMAZON_GENAI.map((x) => x.id), done),
    dayof: count(AMAZON_DAYOF.map((x) => x.id), done),
    mocks: count(mockKeys, done),
    learn: count(learnKeys, done),
    freq: { done: freqDone, total: AMAZON_FREQ.length },
    items: { done: AMAZON_ITEMS.filter((i) => done[i.key]).length, total: AMAZON_ITEMS.length },
    minutes: { done: minutesDone, total: minutesTotal },
    byPhase,
    byDay,
    todayCount: logs.filter((l) => l.doneOn === today).length + revisitsOn(state, today),
    streak,
    weakTopics,
  };
}

function revisitsOn(state: AppState, date: string): number {
  return (state.days[date]?.completed ?? []).filter((id) => id.startsWith('rev:')).length;
}

/** Items logged on a date, newest first, with their items resolved. */
export function amazonLoggedOn(state: AppState, date: string): AmazonItem[] {
  return Object.entries(state.amazon.items)
    .filter(([, l]) => l.doneOn === date)
    .map(([k]) => AMAZON_ITEMS.find((i) => i.key === k))
    .filter((i): i is AmazonItem => Boolean(i));
}
