import type { AppState } from '@/lib/schema';
import { FOUNDATION_SUBJECTS, TIER_LABEL, TIER_SHORT } from '@/data/foundation';
import type { FoundationTier } from './types';
import { currentDay, dateForDay, missionTotalDays } from './dates';
import { missionPhases } from './mission';

/**
 * The general roadmap in course order: Course 1 (Apna College), Course 2
 * (Five Minute Engineering), then practice, with a forecast finish day for
 * each at three missions a day. A forecast, not a promise.
 */

export const MISSIONS_PER_DAY = 3;

export type CourseStatus = 'done' | 'active' | 'next' | 'queued';

export interface CourseProgress {
  tier: FoundationTier;
  label: string;
  short: string;
  total: number;
  done: number;
  pct: number;
  status: CourseStatus;
  etaDay: number | null;
  etaDate: string | null;
}

export function courseProgress(state: AppState, day: number = currentDay()): CourseProgress[] {
  let cumulative = 0;
  let unfinishedSeen = 0;
  const total = missionTotalDays();

  return ([1, 2, 3] as const).map((tier) => {
    const milestones = FOUNDATION_SUBJECTS.filter((s) => s.tier === tier).flatMap((s) => s.milestones.filter((m) => m.mandatory));
    const count = milestones.length;
    const done = milestones.filter((m) => state.foundation[m.id]).length;
    const left = count - done;
    cumulative += left;
    const status: CourseStatus = left === 0 ? 'done' : (['active', 'next'] as const)[unfinishedSeen] ?? 'queued';
    if (left > 0) unfinishedSeen += 1;
    const etaDay = left === 0 ? null : day + Math.ceil(cumulative / MISSIONS_PER_DAY) - 1;
    return {
      tier,
      label: TIER_LABEL[tier],
      short: TIER_SHORT[tier],
      total: count,
      done,
      pct: count === 0 ? 100 : Math.round((done / count) * 100),
      status,
      etaDay,
      etaDate: etaDay === null || etaDay > total ? null : dateForDay(etaDay),
    };
  });
}

/** The Foundation Gate deadline: the last day of phase 1. */
export function gateDeadlineDay(): number {
  return (missionPhases()[0] as { endDay: number }).endDay;
}
