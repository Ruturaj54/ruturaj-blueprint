/** Shared domain types. Everything the priority engine and UI agree on. */

/** P0 must happen. P3 is the first thing shed when a week goes badly. */
export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export const PRIORITY_ORDER: readonly Priority[] = ['P0', 'P1', 'P2', 'P3'];

export type TrackId =
  | 'dsa'
  | 'cs'
  | 'ai'
  | 'backend'
  | 'java'
  | 'react'
  | 'systems'
  | 'devops'
  | 'telecom'
  | 'project'
  | 'work';

export type Difficulty = 'intro' | 'core' | 'advanced';

/**
 * How a task is proven done. The old app tracked "watched 80% of videos" and
 * called it 80% skill; these levels exist so learning and demonstration are
 * never conflated.
 */
export type ProofType =
  | 'watch'
  | 'notes'
  | 'implement'
  | 'exercise'
  | 'checkpoint'
  | 'project';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'skipped';

export type TargetRole = 'ai-engineer' | 'sde' | 'both';

export interface Task {
  id: string;
  title: string;
  track: TrackId;
  priority: Priority;
  /** Realistic focused minutes, not optimistic minutes. */
  estMinutes: number;
  /** 1–10. How much this moves the Jan-2027 interview needle. */
  careerValue: number;
  difficulty: Difficulty;
  proof: ProofType;
  targetRole: TargetRole;
  /** Task ids that must be `done` before this is workable. */
  prereqs?: string[];
  /** Course or resource this comes from. */
  source?: string;
  interviewCritical: boolean;
  portfolioCritical: boolean;
  optional: boolean;
  /** Why this earns a slot — evidence, stated separately from the pitch. */
  rationale?: string;
  /**
   * Earliest phase this should realistically surface in. Without it the
   * priority engine ranks globally and pulls mock interviews and company-
   * specific prep into month 2, leaving months 3 and 4 with nothing.
   *
   * It is a heavy ranking penalty rather than a hard filter, so an early phase
   * can never end up with an empty plan — the work just sorts to the bottom
   * until its time comes.
   */
  earliestPhase?: 'm2' | 'm3' | 'm4';
}

export interface TaskState {
  status: TaskStatus;
  /** ISO date completed. */
  completedOn?: string;
  /** Actual minutes spent, summed from Deep Work sessions. */
  actualMinutes?: number;
  notes?: string;
}

/** §22 — a skill is never one number. */
export interface SkillProgress {
  learning: number;
  practice: number;
  demonstration: number;
  interview: number;
}

export type FoundationStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'verified';

export interface FoundationMilestone {
  id: string;
  title: string;
  proof: ProofType;
  /** Mandatory milestones gate the Foundation Gate; optional ones do not. */
  mandatory: boolean;
  /**
   * Realistic focused minutes. Course parts run 60–120 min each, so a
   * milestone covering three parts is budgeted at three parts, not one.
   * This is what makes the daily plan honest about how much fits in a day.
   */
  estMinutes: number;
}

/**
 * Priority tier. The planner clears tier 1 before tier 2, and tier 2 before
 * tier 3 — Ruturaj's stated order: Apna College first, then Five Minute
 * Engineering, then his own PPA/LB/LSP/DSA practice. Mixing is allowed: when
 * the current tier has nothing workable left, the planner pulls forward.
 */
export type FoundationTier = 1 | 2 | 3;

export interface FoundationSubject {
  id: string;
  name: string;
  source: string;
  track: TrackId;
  tier: FoundationTier;
  blurb: string;
  milestones: FoundationMilestone[];
}

/** Total budgeted minutes for a subject. */
export function subjectMinutes(s: FoundationSubject): number {
  return s.milestones.reduce((n, m) => n + m.estMinutes, 0);
}

export interface MissionPhase {
  id: 'm1' | 'm2' | 'm3' | 'm4';
  label: string;
  title: string;
  startDay: number;
  endDay: number;
  focus: string;
  description: string;
}

export type DsaOutcome = 'solved' | 'solved_with_hint' | 'failed';

export interface DsaAttempt {
  id: string;
  date: string;
  problem: string;
  pattern: string;
  difficulty: 'easy' | 'medium' | 'hard';
  outcome: DsaOutcome;
  minutes: number;
  /** True when this is a re-solve of a problem seen before. */
  revision: boolean;
}

export type DeepWorkOutcome =
  | 'completed'
  | 'partial'
  | 'blocked'
  | 'distracted';

export interface DeepWorkSession {
  id: string;
  date: string;
  taskId?: string;
  label: string;
  plannedMinutes: number;
  actualMinutes: number;
  outcome: DeepWorkOutcome;
  note?: string;
}
