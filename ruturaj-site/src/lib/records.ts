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
