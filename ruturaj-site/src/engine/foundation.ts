import type { AppState } from '@/lib/schema';
import type { FoundationStatus, FoundationSubject } from './types';
import {
  FOUNDATION_SUBJECTS,
  MANDATORY_MILESTONE_COUNT,
} from '@/data/foundation';

/**
 * §6 — the Foundation Gate.
 *
 * Advanced Mode does not unlock because a button was pressed. It unlocks when
 * every mandatory milestone across all eight subjects is ticked, or when the
 * gate is explicitly overridden — and an override is recorded and shown, so a
 * forced unlock never masquerades as an earned one.
 */

export interface SubjectProgress {
  subject: FoundationSubject;
  status: FoundationStatus;
  done: number;
  total: number;
  mandatoryDone: number;
  mandatoryTotal: number;
  pct: number;
}

export function subjectProgress(state: AppState, subject: FoundationSubject): SubjectProgress {
  const total = subject.milestones.length;
  const done = subject.milestones.filter((m) => state.foundation[m.id]).length;
  const mandatory = subject.milestones.filter((m) => m.mandatory);
  const mandatoryDone = mandatory.filter((m) => state.foundation[m.id]).length;

  let status: FoundationStatus;
  if (done === 0) status = 'not_started';
  else if (mandatoryDone < mandatory.length) status = 'in_progress';
  else if (done < total) status = 'completed';
  else status = 'verified';

  return {
    subject,
    status,
    done,
    total,
    mandatoryDone,
    mandatoryTotal: mandatory.length,
    pct: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

export function allSubjectProgress(state: AppState): SubjectProgress[] {
  return FOUNDATION_SUBJECTS.map((s) => subjectProgress(state, s));
}

export interface GateStatus {
  mandatoryDone: number;
  mandatoryTotal: number;
  pct: number;
  /** True when every mandatory milestone is ticked. */
  earned: boolean;
  /** True when Advanced Mode is open, whether earned or overridden. */
  unlocked: boolean;
  overridden: boolean;
  unlockedAt?: string;
  /** Subjects still holding the gate shut. */
  blockingSubjects: string[];
}

export function gateStatus(state: AppState): GateStatus {
  const progress = allSubjectProgress(state);
  const mandatoryDone = progress.reduce((s, p) => s + p.mandatoryDone, 0);
  const earned = mandatoryDone >= MANDATORY_MILESTONE_COUNT;

  return {
    mandatoryDone,
    mandatoryTotal: MANDATORY_MILESTONE_COUNT,
    pct: Math.round((mandatoryDone / MANDATORY_MILESTONE_COUNT) * 100),
    earned,
    unlocked: Boolean(state.foundationUnlockedAt),
    overridden: state.foundationOverride === true,
    unlockedAt: state.foundationUnlockedAt,
    blockingSubjects: progress
      .filter((p) => p.mandatoryDone < p.mandatoryTotal)
      .map((p) => p.subject.name),
  };
}

export const FOUNDATION_UNLOCK_MESSAGE =
  'Ruturaj, the foundation is done. Now stop collecting courses. We build interview strength, engineering depth and production-level AI skills.';
