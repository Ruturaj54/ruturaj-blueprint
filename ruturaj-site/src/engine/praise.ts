import type { AppState } from '@/lib/schema';
import { addDays, todayISO } from './dates';
import { dayScore, executionStreak, plannedHits } from './scoring';
import { dsaStreak } from './dsa';

/**
 * Compares today against yesterday and names what actually changed.
 *
 * §21 asks for recognition of genuine progress, and the example given is
 * "you were zero, now you did something". That only lands if it is true, so
 * every line here is derived from a real delta. When nothing improved it says
 * so plainly rather than inventing a compliment — praise that fires regardless
 * of performance stops meaning anything within a week.
 */

export type WinKind = 'breakthrough' | 'improvement' | 'consistency' | 'best';

export interface Win {
  kind: WinKind;
  label: string;
  detail: string;
}

export interface DayPraise {
  date: string;
  /** True when there is something real to celebrate. */
  hasWins: boolean;
  headline: string;
  body: string;
  wins: Win[];
  score?: number;
  yesterdayScore?: number;
}

interface DayStats {
  dsa: number;
  clean: number;
  runs: number;
  km: number;
  focus: number;
  completed: number;
  planned: number;
  score?: number;
}

function statsFor(state: AppState, date: string): DayStats {
  const attempts = state.dsa.filter((a) => a.date === date);
  const runs = state.runs.filter((r) => r.date === date);
  const log = state.days[date];
  return {
    dsa: attempts.length,
    clean: attempts.filter((a) => a.outcome === 'solved').length,
    runs: runs.length,
    km: Number(runs.reduce((n, r) => n + r.km, 0).toFixed(1)),
    focus: state.deepWork
      .filter((d) => d.date === date)
      .reduce((n, d) => n + d.actualMinutes, 0),
    // Planned work closed. The raw tick count produced "cleared 24 of 3".
    completed: plannedHits(state, date),
    planned: log?.planned.length ?? 0,
    score: dayScore(state, date),
  };
}

/** Best value seen on any day before `date`, for personal-best detection. */
function priorBest(state: AppState, date: string, pick: (s: DayStats) => number): number {
  const dates = new Set<string>([
    ...state.dsa.map((a) => a.date),
    ...state.runs.map((r) => r.date),
    ...state.deepWork.map((d) => d.date),
    ...Object.keys(state.days),
  ]);
  let best = 0;
  for (const d of dates) {
    if (d >= date) continue;
    best = Math.max(best, pick(statsFor(state, d)));
  }
  return best;
}

export function buildPraise(state: AppState, date: string = todayISO()): DayPraise {
  const today = statsFor(state, date);
  const yesterday = statsFor(state, addDays(date, -1));
  const wins: Win[] = [];

  // Breakthroughs — the "you were zero, now you did something" case.
  if (yesterday.dsa === 0 && today.dsa > 0) {
    wins.push({
      kind: 'breakthrough',
      label: 'DSA is off zero',
      detail: `Yesterday: nothing logged. Today: ${today.dsa}. Starting again is the hard part and you did it.`,
    });
  }
  if (yesterday.focus === 0 && today.focus > 0) {
    wins.push({
      kind: 'breakthrough',
      label: 'Focused work is back',
      detail: `${today.focus} minutes of deep work after a day with none.`,
    });
  }
  if (yesterday.runs === 0 && today.runs > 0) {
    wins.push({
      kind: 'breakthrough',
      label: 'Back to running',
      detail: `${today.km} km after a rest day.`,
    });
  }

  // Improvements against yesterday.
  if (yesterday.dsa > 0 && today.dsa > yesterday.dsa) {
    wins.push({
      kind: 'improvement',
      label: 'More DSA than yesterday',
      detail: `${yesterday.dsa} → ${today.dsa} problems.`,
    });
  }
  if (
    today.score !== undefined &&
    yesterday.score !== undefined &&
    today.score > yesterday.score
  ) {
    wins.push({
      kind: 'improvement',
      label: 'Better day than yesterday',
      detail: `${yesterday.score}% → ${today.score}% of what you planned.`,
    });
  }
  if (yesterday.focus > 0 && today.focus > yesterday.focus) {
    wins.push({
      kind: 'improvement',
      label: 'Longer focus',
      detail: `${yesterday.focus} → ${today.focus} minutes.`,
    });
  }

  // Personal bests.
  const bestDsa = priorBest(state, date, (s) => s.dsa);
  if (today.dsa > 0 && today.dsa > bestDsa) {
    wins.push({
      kind: 'best',
      label: 'Most DSA in a single day',
      detail: `${today.dsa} problems — your highest yet.`,
    });
  }
  const bestFocus = priorBest(state, date, (s) => s.focus);
  if (today.focus > 0 && today.focus > bestFocus) {
    wins.push({
      kind: 'best',
      label: 'Longest focused day',
      detail: `${today.focus} minutes — a new high.`,
    });
  }

  // Consistency.
  const execStreak = executionStreak(state);
  const dsaDays = dsaStreak(state);
  if (dsaDays >= 3) {
    wins.push({
      kind: 'consistency',
      label: `${dsaDays}-day DSA streak`,
      detail:
        dsaDays >= 14
          ? 'Two weeks unbroken. Consistency at this length is rarer than talent.'
          : 'Unbroken. This is the habit that compounds.',
    });
  }
  if (today.score === 100 && today.planned > 0) {
    wins.push({
      kind: 'best',
      label: 'Cleared everything you planned',
      detail: `${today.completed} of ${today.planned}. A clean day.`,
    });
  }

  const hasWins = wins.length > 0;

  let headline: string;
  let body: string;

  if (!hasWins) {
    if (today.completed === 0 && today.dsa === 0 && today.focus === 0) {
      headline = 'Nothing logged today';
      body =
        'No praise for this one, because there is nothing to praise yet — and a message that congratulates you regardless would be worthless. Tomorrow, start with the smallest item on the list.';
    } else {
      headline = 'Day logged';
      body = `${today.completed} of ${today.planned} closed, ${today.dsa} DSA, ${today.focus} focused minutes. Steady rather than standout — which is most days, and most days are what get you there.`;
    }
  } else if (wins.some((w) => w.kind === 'breakthrough')) {
    headline = 'You turned it around today';
    body = 'Yesterday this was at zero. Today it is not. That restart is the single hardest move in a long plan, and you made it without anyone watching.';
  } else if (wins.some((w) => w.kind === 'best')) {
    headline = 'Best day so far';
    body = 'Not just a good day — the best one yet. Note what was different about today, because that is the thing worth repeating.';
  } else if (execStreak >= 7) {
    headline = `${execStreak} days holding the line`;
    body = 'A week of this is no longer motivation, it is a working system. Protect it.';
  } else {
    headline = 'Better than yesterday';
    body = 'The direction is right. Interview readiness is built from exactly this: a slightly better day, repeated.';
  }

  return {
    date,
    hasWins,
    headline,
    body,
    wins,
    score: today.score,
    yesterdayScore: yesterday.score,
  };
}
