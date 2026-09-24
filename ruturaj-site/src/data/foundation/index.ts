import type { FoundationSubject, FoundationTier } from '@/engine/types';
import { APNA_SUBJECTS } from './apna';
import { FIVEME_SUBJECTS } from './fiveme';
import { CORE_SUBJECTS } from './core';

/**
 * The Foundation Gate, in Ruturaj's stated order: Apna College first, then Five
 * Minute Engineering, then his own PPA/LB/DSA/LSP practice. Built only from the
 * syllabi he supplied — no invented checkpoints.
 */
export const FOUNDATION_SUBJECTS: readonly FoundationSubject[] = [
  ...APNA_SUBJECTS,
  ...FIVEME_SUBJECTS,
  ...CORE_SUBJECTS,
];

export const TIER_LABEL: Record<FoundationTier, string> = {
  1: 'Apna College Prime AI/ML — first priority',
  2: 'Five Minute Engineering — AI engineering',
  3: 'PPA · LB · DSA · LSP practice',
};

/**
 * Tiers 1 and 2 are courses with a real order — module 12 assumes module 11 —
 * so the planner walks them in sequence. Tier 3 is independent practice, so it
 * mixes subjects instead of finishing C before touching LSP.
 */
export const SEQUENTIAL_TIERS: ReadonlySet<FoundationTier> = new Set([1, 2]);

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

export { APNA_SUBJECTS, FIVEME_SUBJECTS, CORE_SUBJECTS };
