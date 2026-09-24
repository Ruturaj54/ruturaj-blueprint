import type { AppState } from '@/lib/schema';
import { todayISO, addDays } from './dates';

/**
 * How a day went, measured against its plan. Every score in the app — the day
 * card, the weekly review, the praise engine, the behind-schedule check —
 * reads from here.
 *
 * The one rule: score PLANNED work that got done, not total work. `planned` is
 * a snapshot taken when the day starts, while `completed` accumulates every
 * tick all day, so `completed / planned` produced 800% and lived on in four
 * separate places before it was consolidated here. Work beyond the plan is
 * real and is credited as "extra", never folded into the percentage.
 */

/** Planned items actually closed. */
export function plannedHits(state: AppState, date: string): number {
  const log = state.days[date];
  if (!log) return 0;
  const planned = new Set(log.planned);
  return log.completed.filter((id) => planned.has(id)).length;
}

/** Items closed that were not in the plan — genuine bonus work. */
export function dayExtras(state: AppState, date: string): number {
  const log = state.days[date];
  if (!log) return 0;
  const planned = new Set(log.planned);
  return log.completed.filter((id) => !planned.has(id)).length;
}

/** 0–100: share of the plan that got done. Undefined when nothing was planned. */
export function dayScore(state: AppState, date: string): number | undefined {
  const log = state.days[date];
  if (!log || log.planned.length === 0) return undefined;
  return Math.min(100, Math.round((plannedHits(state, date) / log.planned.length) * 100));
}

/** Consecutive days scoring 50 or better, counting back from yesterday. */
export function executionStreak(state: AppState): number {
  let streak = 0;
  const today = todayISO();
  for (let i = 0; i < 365; i += 1) {
    const date = addDays(today, -i);
    const score = dayScore(state, date);
    if (score === undefined) {
      if (i === 0) continue; // today may not be scored yet
      break;
    }
    if (score < 50) break;
    streak += 1;
  }
  return streak;
}

/**
 * Behind schedule = fewer than half of the planned items closed across the last
 * seven logged days. Drives automatic shedding of P2/P3 work.
 *
 * Counted with plannedHits: with the raw completed count, a busy day of extra
 * ticks made this report "on track" no matter how much of the plan was missed.
 */
export function isBehindSchedule(state: AppState): boolean {
  const today = todayISO();
  let planned = 0;
  let hits = 0;
  for (let i = 1; i <= 7; i += 1) {
    const date = addDays(today, -i);
    const log = state.days[date];
    if (!log) continue;
    planned += log.planned.length;
    hits += plannedHits(state, date);
  }
  if (planned < 5) return false; // too little history to judge
  return hits / planned < 0.5;
}
