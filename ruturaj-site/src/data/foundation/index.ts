import type { FoundationSubject, FoundationTier } from '@/engine/types';
import { COURSE_SUBJECTS } from './courses';
import { CORE_SUBJECTS } from './core';

/**
 * Ordered by Ruturaj's stated priority: Apna College first, then Five Minute
 * Engineering, then his own PPA/LB/LSP/DSA practice. The planner walks this
 * order; the Roadmap screen displays it.
 */
export const FOUNDATION_SUBJECTS: readonly FoundationSubject[] = [
  ...COURSE_SUBJECTS.filter((s) => s.tier === 1),
  ...CORE_SUBJECTS.filter((s) => s.tier === 1),
  ...COURSE_SUBJECTS.filter((s) => s.tier === 2),
  ...CORE_SUBJECTS.filter((s) => s.tier === 3),
];

export const TIER_LABEL: Record<FoundationTier, string> = {
  1: 'Apna College — first priority',
  2: 'Five Minute Engineering',
  3: 'PPA · LB · LSP · DSA practice',
};

export function subjectsInTier(tier: FoundationTier): FoundationSubject[] {
  return FOUNDATION_SUBJECTS.filter((s) => s.tier === tier);
}

export const MANDATORY_MILESTONE_COUNT = FOUNDATION_SUBJECTS.reduce(
  (sum, s) => sum + s.milestones.filter((m) => m.mandatory).length,
  0,
);

export const TOTAL_MILESTONE_COUNT = FOUNDATION_SUBJECTS.reduce(
  (sum, s) => sum + s.milestones.length,
  0,
);

/** Total budgeted hours for the whole foundation, mandatory work only. */
export const MANDATORY_HOURS = Math.round(
  FOUNDATION_SUBJECTS.reduce(
    (n, s) => n + s.milestones.filter((m) => m.mandatory).reduce((x, m) => x + m.estMinutes, 0),
    0,
  ) / 60,
);

export function subjectById(id: string): FoundationSubject | undefined {
  return FOUNDATION_SUBJECTS.find((s) => s.id === id);
}

export { COURSE_SUBJECTS, CORE_SUBJECTS };
