import type { AppState, ActivityLog } from '@/lib/schema';
import { cleanActivityValue } from '@/lib/parse';
import { todayISO, addDays } from './dates';

/**
 * The day's movement numbers he types in from his phone or watch: run and
 * walk distance, steps, total distance, calories from moving and calories for
 * the whole day. Only what he entered is shown; nothing is estimated.
 */

export type ActivityKey = keyof ActivityLog;

export interface ActivityField {
  key: ActivityKey;
  label: string;
  unit: string;
  /** Short label for compact rows and the mail. */
  short: string;
  decimals: number;
}

export const ACTIVITY_FIELDS: readonly ActivityField[] = [
  { key: 'runKm', label: 'Running', short: 'run', unit: 'km', decimals: 2 },
  { key: 'walkKm', label: 'Walking', short: 'walk', unit: 'km', decimals: 2 },
  { key: 'steps', label: 'Total steps', short: 'steps', unit: 'steps', decimals: 0 },
  { key: 'distanceKm', label: 'Total distance', short: 'total', unit: 'km', decimals: 2 },
  { key: 'activeKcal', label: 'Calories from moving', short: 'active', unit: 'kcal', decimals: 0 },
  { key: 'totalKcal', label: 'Total calories burned', short: 'burned', unit: 'kcal', decimals: 0 },
];

export function activityFor(state: AppState, date: string): ActivityLog {
  return state.activity[date] ?? {};
}

export function hasActivity(log: ActivityLog | undefined): boolean {
  return Boolean(log && Object.keys(log).length > 0);
}

/** Sets or clears one number; an empty or invalid value removes it. Apply inside storage.update. */
export function setActivity(draft: AppState, date: string, key: ActivityKey, value: number | undefined): void {
  const clean = cleanActivityValue(key, value);
  const log: ActivityLog = { ...(draft.activity[date] ?? {}) };
  if (clean === undefined) delete log[key];
  else log[key] = clean;
  if (Object.keys(log).length) draft.activity[date] = log;
  else delete draft.activity[date];
}

/** "9,240" for steps, "5.2" for km, "512" for kcal. */
export function formatActivity(key: ActivityKey, value: number): string {
  const field = ACTIVITY_FIELDS.find((f) => f.key === key);
  if (!field || field.decimals === 0) return Math.round(value).toLocaleString('en-IN');
  return String(Math.round(value * 10) / 10);
}

/** "9,240 steps · 6.1 km · walk 5.2 km · 512 active kcal": only the numbers he entered. */
export function activityLine(log: ActivityLog): string {
  const parts: string[] = [];
  if (log.steps) parts.push(`${formatActivity('steps', log.steps)} steps`);
  if (log.distanceKm) parts.push(`${formatActivity('distanceKm', log.distanceKm)} km`);
  if (log.runKm) parts.push(`run ${formatActivity('runKm', log.runKm)} km`);
  if (log.walkKm) parts.push(`walk ${formatActivity('walkKm', log.walkKm)} km`);
  if (log.activeKcal) parts.push(`${formatActivity('activeKcal', log.activeKcal)} active kcal`);
  if (log.totalKcal) parts.push(`${formatActivity('totalKcal', log.totalKcal)} kcal burned`);
  return parts.join(' · ');
}

export interface ActivityWeek {
  days: Array<{ date: string; log: ActivityLog }>;
  /** Days with at least one number entered. */
  loggedDays: number;
  totals: Required<ActivityLog>;
  /** Per logged day, for the fields that were logged; null when none were. */
  averages: Record<ActivityKey, number | null>;
  /** Days the walk reached his target. */
  walkTargetDays: number;
}

/** The seven days ending `today`, with totals and per-day averages over the days he logged. */
export function activityWeek(state: AppState, walkTargetKm: number, today: string = todayISO()): ActivityWeek {
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i)).map((date) => ({ date, log: activityFor(state, date) }));
  const totals = { runKm: 0, walkKm: 0, steps: 0, distanceKm: 0, activeKcal: 0, totalKcal: 0 };
  const counts = { runKm: 0, walkKm: 0, steps: 0, distanceKm: 0, activeKcal: 0, totalKcal: 0 };
  for (const { log } of days) {
    for (const f of ACTIVITY_FIELDS) {
      const v = log[f.key];
      if (typeof v === 'number') {
        totals[f.key] += v;
        counts[f.key] += 1;
      }
    }
  }
  const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;
  const averages = Object.fromEntries(
    ACTIVITY_FIELDS.map((f) => [f.key, counts[f.key] ? round(totals[f.key] / counts[f.key], f.decimals === 0 ? 0 : 1) : null]),
  ) as Record<ActivityKey, number | null>;
  for (const f of ACTIVITY_FIELDS) totals[f.key] = round(totals[f.key], f.decimals === 0 ? 0 : 1);
  return {
    days,
    loggedDays: days.filter((d) => hasActivity(d.log)).length,
    totals,
    averages,
    walkTargetDays: days.filter((d) => (d.log.walkKm ?? 0) >= walkTargetKm).length,
  };
}

/** Consecutive days the walk reached the target, ending today or yesterday. */
export function walkStreak(state: AppState, walkTargetKm: number, today: string = todayISO()): number {
  const hit = (d: string) => (state.activity[d]?.walkKm ?? 0) >= walkTargetKm;
  let cursor = hit(today) ? today : addDays(today, -1);
  let streak = 0;
  while (hit(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
