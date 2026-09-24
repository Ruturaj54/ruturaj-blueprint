import type { AppState } from '@/lib/schema';
import { todayISO, addDays, weekStartISO } from './dates';
import { dayScore, plannedHits } from './scoring';
import { weakPatternIds, patternStats } from './dsa';
import { nextUp } from './priority';
import { dayContext } from './mission';
import { currentDay } from './dates';
import { isBehindSchedule } from './scoring';
import { gateStatus } from './foundation';
import { FOUNDATION_SUBJECTS } from '@/data/foundation';

/**
 * §15 — the weekly review.
 *
 * Computed on demand rather than stored, so it always reflects current state.
 * Next week returns at most five priorities: a list of thirty is the same as
 * no list, and this is the one place the temptation to dump everything is
 * strongest.
 */

export interface WeeklyReviewData {
  weekStart: string;
  weekEnd: string;
  career: {
    dsaSolved: number;
    dsaAccuracy: number;
    tasksCompleted: number;
    foundationCompleted: number;
    weakestPattern: string | null;
  };
  job: {
    achievements: string[];
    metricNeeded: number;
  };
  health: {
    runs: number;
    km: number;
    avgSleep: number | null;
    supplementAdherence: number | null;
  };
  discipline: {
    plannedItems: number;
    completedItems: number;
    completionPct: number;
    focusMinutes: number;
    daysLogged: number;
    behindSchedule: boolean;
  };
  nextWeek: string[];
}

export function buildWeeklyReview(state: AppState, anchor = todayISO()): WeeklyReviewData {
  const weekStart = weekStartISO(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const inWeek = (d: string) => days.includes(d);

  /* ---- career ---- */
  const weekAttempts = state.dsa.filter((a) => inWeek(a.date));
  const clean = weekAttempts.filter((a) => a.outcome === 'solved').length;
  const weak = weakPatternIds(state, 1)[0];
  const weakName = weak
    ? (patternStats(state).find((p) => p.pattern.id === weak)?.pattern.name ?? null)
    : null;

  const tasksCompleted = Object.values(state.tasks).filter(
    (t) => t.status === 'done' && t.completedOn && inWeek(t.completedOn),
  ).length;

  // Foundation ticks carry no timestamp, so this reports the running total
  // rather than claiming a weekly delta it cannot actually measure.
  const foundationCompleted = FOUNDATION_SUBJECTS.reduce(
    (n, s) => n + s.milestones.filter((m) => state.foundation[m.id]).length,
    0,
  );

  /* ---- job ---- */
  const weekWork = state.work.filter((w) => inWeek(w.date));

  /* ---- health ---- */
  const weekRuns = state.runs.filter((r) => inWeek(r.date));
  const sleepValues = days.map((d) => state.health.sleep[d]).filter((v): v is number => Boolean(v));
  const activeSupps = state.health.supplements.filter((s) => s.active).length;
  const adherenceDays = days.filter((d) => (state.health.adherence[d] ?? []).length > 0).length;

  /* ---- discipline ---- */
  let planned = 0;
  let completed = 0;
  let daysLogged = 0;
  for (const d of days) {
    const log = state.days[d];
    if (!log) continue;
    daysLogged += 1;
    planned += log.planned.length;
    // Planned work closed, not every tick — the raw count put this past 100%.
    completed += plannedHits(state, d);
  }
  const focusMinutes = state.deepWork
    .filter((s) => inWeek(s.date))
    .reduce((n, s) => n + s.actualMinutes, 0);

  /* ---- next week: top 5, never more ---- */
  const ctx = dayContext(currentDay());
  const gate = gateStatus(state);
  let nextWeek: string[];

  if (!gate.unlocked) {
    nextWeek = FOUNDATION_SUBJECTS.flatMap((s) =>
      s.milestones
        .filter((m) => m.mandatory && !state.foundation[m.id])
        .slice(0, 1)
        .map((m) => `${s.name}: ${m.title}`),
    ).slice(0, 5);
  } else {
    nextWeek = nextUp(
      {
        state,
        phase: ctx.phase,
        weakPatterns: weakPatternIds(state),
        behindSchedule: isBehindSchedule(state),
      },
      5,
    ).map((s) => s.task.title);
  }

  if (weakName) {
    nextWeek = [`DSA: close the gap on ${weakName}`, ...nextWeek].slice(0, 5);
  }

  return {
    weekStart,
    weekEnd: addDays(weekStart, 6),
    career: {
      dsaSolved: weekAttempts.length,
      dsaAccuracy: weekAttempts.length ? Math.round((clean / weekAttempts.length) * 100) : 0,
      tasksCompleted,
      foundationCompleted,
      weakestPattern: weakName,
    },
    job: {
      achievements: weekWork.map((w) => w.statement ?? w.raw),
      metricNeeded: weekWork.filter((w) => w.metricNeeded).length,
    },
    health: {
      runs: weekRuns.length,
      km: Number(weekRuns.reduce((n, r) => n + r.km, 0).toFixed(1)),
      avgSleep: sleepValues.length
        ? Number((sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length).toFixed(1))
        : null,
      supplementAdherence: activeSupps > 0 ? Math.round((adherenceDays / 7) * 100) : null,
    },
    discipline: {
      plannedItems: planned,
      completedItems: completed,
      completionPct: planned ? Math.round((completed / planned) * 100) : 0,
      focusMinutes,
      daysLogged,
      behindSchedule: isBehindSchedule(state),
    },
    nextWeek,
  };
}

/** Day scores across the week, for the review's strip. */
export function weekScores(state: AppState, anchor = todayISO()) {
  const weekStart = weekStartISO(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return { date, score: dayScore(state, date) };
  });
}

/** Totals are meaningless on their own — this is the honest read. */
export function weeklyVerdict(r: WeeklyReviewData): string {
  if (r.discipline.daysLogged === 0) {
    return 'Nothing was logged this week, so there is nothing to review. Start days in the app or this section stays blank.';
  }
  if (r.discipline.completionPct >= 85) {
    return 'A strong week. Keep the standard rather than celebrating it — consistency is what compounds over the remaining months.';
  }
  if (r.discipline.completionPct >= 60) {
    return 'A solid week with slippage. Look at what you planned on the days you missed — usually the plan was too large, not the effort too small.';
  }
  if (r.career.dsaSolved === 0) {
    return 'No DSA this week. That is the single highest-weight item for every company on your list, and it does not recover on its own.';
  }
  return 'This week underdelivered against what you planned. Cut next week to five items and finish them rather than planning fifteen and closing four.';
}
