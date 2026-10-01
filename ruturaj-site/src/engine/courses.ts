import type { AppState } from '@/lib/schema';
import { FOUNDATION_SUBJECTS, TIER_LABEL, TIER_SHORT } from '@/data/foundation';
import type { FoundationTier } from './types';
import { currentDay, dateForDay, TOTAL_DAYS } from './dates';
import { MISSION_PHASES } from './mission';

/**
 * The overall plan in course order: Course 1 (Apna College), then Course 2
 * (Five Minute Engineering), then the practice tier.
 *
 * The finish dates are a forecast, not a promise: if he clears the planner's
 * three missions a day from today, this is when each tier closes. It is
 * computed from what is actually left, so a slow week moves the date and a
 * strong one pulls it in. Mirrored by courseProgress in _shared/plan.mjs.
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
  /** Mission day this tier closes at three a day; null once done. */
  etaDay: number | null;
  etaDate: string | null;
}

export function courseProgress(state: AppState, day: number = currentDay()): CourseProgress[] {
  let cumulative = 0;
  let unfinishedSeen = 0;

  return ([1, 2, 3] as const).map((tier) => {
    const milestones = FOUNDATION_SUBJECTS.filter((s) => s.tier === tier).flatMap((s) =>
      s.milestones.filter((m) => m.mandatory),
    );
    const total = milestones.length;
    const done = milestones.filter((m) => state.foundation[m.id]).length;
    const left = total - done;
    cumulative += left;

    // First unfinished tier is active, the one after it is next, the rest wait.
    const status: CourseStatus =
      left === 0 ? 'done' : (['active', 'next'] as const)[unfinishedSeen] ?? 'queued';
    if (left > 0) unfinishedSeen += 1;

    const etaDay = left === 0 ? null : day + Math.ceil(cumulative / MISSIONS_PER_DAY) - 1;
    return {
      tier,
      label: TIER_LABEL[tier],
      short: TIER_SHORT[tier],
      total,
      done,
      pct: total === 0 ? 100 : Math.round((done / total) * 100),
      status,
      etaDay,
      etaDate: etaDay === null || etaDay > TOTAL_DAYS ? null : dateForDay(etaDay),
    };
  });
}

/** The Foundation Gate deadline — the last day of phase 1. */
export const GATE_DEADLINE_DAY = MISSION_PHASES[0]!.endDay;
