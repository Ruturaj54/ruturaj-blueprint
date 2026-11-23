/**
 * Real-life records: things he did or measured, as opposed to plan state.
 * They survive every reset and epoch change (see schema.ts).
 */

export type WorkoutKind = 'run' | 'walk' | 'strength' | 'mobility' | 'rest';

export interface WorkoutLog {
  id: string;
  date: string;
  slot: 'morning' | 'evening';
  kind: WorkoutKind;
  minutes: number;
  km?: number;
  /** Session parts ticked (warm-up, run, cool-down, strength). */
  parts?: string[];
}

export interface DayLog {
  closedAt?: string;
  /** Item ids planned for this date, captured when the day was first opened. */
  planned: string[];
  completed: string[];
  notes?: string;
  score?: number;
  blockers?: string;
  /** His one-line plan for the next day, written in the 23:15 revise-and-plan block. */
  tomorrow?: string;
}

/**
 * One day's movement numbers, typed in from his phone or watch. Every field
 * is optional: a day with only steps logged is still a logged day. Private:
 * it lives only in the synced store, never in source.
 */
export interface ActivityLog {
  /** Morning run distance. */
  runKm?: number;
  /** The evening walk in the society. */
  walkKm?: number;
  steps?: number;
  /** All walking and running distance the phone counted for the day. */
  distanceKm?: number;
  /** Calories burned by moving (active energy). */
  activeKcal?: number;
  /** Everything burned in the day: active plus resting. */
  totalKcal?: number;
}

export interface WorkAchievement {
  id: string;
  date: string;
  raw: string;
  statement?: string;
  metricNeeded: boolean;
  tags: string[];
}

export type ApplicationStage =
  | 'saved'
  | 'applied'
  | 'oa'
  | 'recruiter'
  | 'interview'
  | 'final'
  | 'offer'
  | 'rejected';

export interface Application {
  id: string;
  company: string;
  role: string;
  jobId?: string;
  location?: string;
  compensation?: string;
  appliedOn?: string;
  referral?: string;
  stage: ApplicationStage;
  recruiter?: string;
  gaps?: string;
  notes?: string;
}

export interface LabValue {
  id: string;
  date: string;
  marker: string;
  value: string;
  unit?: string;
  referenceRange?: string;
}

export interface Supplement {
  id: string;
  name: string;
  dose: string;
  directedBy: 'doctor' | 'self';
  timing?: 'morning' | 'night';
  startedOn?: string;
  active: boolean;
}

export interface HealthState {
  /** Retained records; no longer shown on the active dashboard. */
  supplements: Supplement[];
  labs: LabValue[];
  nextTestDate?: string;
  sleep: Record<string, number>;
  adherence: Record<string, string[]>;
  focus: string[];
  weight: Record<string, number>;
}

export interface WeeklyReview {
  weekStart: string;
  generatedAt: string;
  plannedMinutes: number;
  actualMinutes: number;
  completionPct: number;
  topPriorities: string[];
  workItems: string[];
  note?: string;
}
