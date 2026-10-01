import type {
  DsaAttempt,
  DeepWorkSession,
  TaskState,
  Priority,
} from '@/engine/types';

export const STATE_VERSION = 2;

/**
 * Bumped whenever stored progress must be discarded rather than migrated.
 *
 * Epoch 3 (24 Sep 2026): the Foundation Gate was rebuilt from Ruturaj's actual
 * syllabi and the progress so far was test clicks.
 *
 * Epoch 4 (1 Oct 2026): the fresh start he asked for — 1 October is Day 1 —
 * together with his real daily routine (07:00 wake, 10:00–17:30 office,
 * 22:00–01:00 night block). Study progress resets. Real-life records do not:
 * labs, supplements, work achievements and job applications carry across, and
 * so do his preferences. The schedule itself takes the new defaults, because
 * the old ones described a day he no longer lives.
 */
export const DATA_EPOCH = 4;

export interface RunLog {
  id: string;
  date: string;
  slot: 'morning' | 'evening';
  km: number;
  minutes: number;
}

export interface DayLog {
  /** Set when the night check-in is done. Presence means the day is reviewed. */
  closedAt?: string;
  /** Task ids planned for this date, captured when the day was started. */
  planned: string[];
  /** Task ids actually completed. */
  completed: string[];
  notes?: string;
  /** 0–100, computed at day close. */
  score?: number;
  blockers?: string;
  /** Set when the end-of-day recap was sent on demand, so the scheduled one skips. */
  recapSentAt?: string;
}

export interface WorkAchievement {
  id: string;
  date: string;
  raw: string;
  /** Resume-grade rewrite. Never invents a number. */
  statement?: string;
  /** True when the statement needs a number Ruturaj has not supplied. */
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
  /** Verbatim from the report. Never inferred by the app. */
  referenceRange?: string;
}

export interface Supplement {
  id: string;
  name: string;
  dose: string;
  /** Who directed it. The app never prescribes. */
  directedBy: 'doctor' | 'self';
  /** Where it sits in the day, so the timetable can remind at the right slot. */
  timing?: 'morning' | 'night';
  startedOn?: string;
  active: boolean;
}

export interface HealthState {
  supplements: Supplement[];
  labs: LabValue[];
  nextTestDate?: string;
  /** ISO date -> hours slept. */
  sleep: Record<string, number>;
  /** ISO date -> supplement ids taken. */
  adherence: Record<string, string[]>;
  /**
   * Health focus areas he switched on (ids from src/data/health.ts). Lives in
   * the private synced store, never in source — the repository is public.
   */
  focus: string[];
  /** ISO date -> body weight in kg, as he measured it. */
  weight: Record<string, number>;
}

export interface Settings {
  /** 24h "HH:MM" IST. Schedule is configurable, never hardcoded. */
  wakeTime: string;
  morningRunTime: string;
  morningRunEnd: string;
  /** Leaving home to getting back, so the commute is part of the block. */
  officeStart: string;
  officeEnd: string;
  /** Spare capacity at work, used for course/reading only — never instead of the job. */
  officeStudyHours: number;
  /** Evening block: course and learning. */
  studyBlock1Start: string;
  studyBlock1End: string;
  eveningRunTime: string;
  eveningRunEnd: string;
  /** Night block: deep work, DSA and project building. */
  studyBlock2Start: string;
  studyBlock2End: string;
  deepWorkStart: string;
  sleepTarget: string;
  timezone: string;
  morningEmailTime: string;
  eveningEmailTime: string;
  emailEnabled: boolean;
  deepWorkMinutes: number;
  /** Daily DSA target, used by the planner and the evening email. */
  dsaTargetPerDay: number;
  interviewMode: boolean;
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

export interface AppState {
  version: number;
  /** See DATA_EPOCH. State from an older epoch is discarded on load. */
  dataEpoch: number;
  updatedAt: string;
  /** milestoneId -> completed */
  foundation: Record<string, boolean>;
  /** Set when the Foundation Gate is cleared. Presence unlocks Advanced Mode. */
  foundationUnlockedAt?: string;
  /** True when the gate was forced rather than earned. Shown in the UI. */
  foundationOverride?: boolean;
  tasks: Record<string, TaskState>;
  days: Record<string, DayLog>;
  /** ISO dates whose praise card has already been shown, so it appears once. */
  praiseSeen: Record<string, boolean>;
  /** ISO date -> daily care habit ids ticked (src/data/health.ts). */
  habits: Record<string, string[]>;
  dsa: DsaAttempt[];
  deepWork: DeepWorkSession[];
  runs: RunLog[];
  work: WorkAchievement[];
  applications: Application[];
  health: HealthState;
  settings: Settings;
  weeklyReviews: Record<string, WeeklyReview>;
}

/**
 * His weekday as he described it on 1 Oct 2026: up at 07:00, run until 08:15,
 * office 10:00–17:30 including the commute, course 18:00–20:00, run
 * 20:00–21:15, dinner, night block 22:00–01:00, six hours of sleep.
 */
export const DEFAULT_SETTINGS: Settings = {
  wakeTime: '07:00',
  morningRunTime: '07:15',
  morningRunEnd: '08:15',
  officeStart: '10:00',
  officeEnd: '17:30',
  officeStudyHours: 2,
  studyBlock1Start: '18:00',
  studyBlock1End: '20:00',
  eveningRunTime: '20:00',
  eveningRunEnd: '21:15',
  studyBlock2Start: '22:00',
  studyBlock2End: '01:00',
  deepWorkStart: '22:00',
  sleepTarget: '01:00',
  timezone: 'Asia/Kolkata',
  morningEmailTime: '07:00',
  eveningEmailTime: '02:30',
  emailEnabled: true,
  deepWorkMinutes: 50,
  dsaTargetPerDay: 3,
  interviewMode: false,
};

export function defaultState(): AppState {
  return {
    version: STATE_VERSION,
    dataEpoch: DATA_EPOCH,
    // "Never written". A fresh device must lose to any real copy on the server;
    // stamping it with the current time made empty state look newer than real
    // progress, so the next push could overwrite it.
    updatedAt: new Date(0).toISOString(),
    foundation: {},
    tasks: {},
    days: {},
    praiseSeen: {},
    habits: {},
    dsa: [],
    deepWork: [],
    runs: [],
    work: [],
    applications: [],
    health: { supplements: [], labs: [], sleep: {}, adherence: {}, focus: [], weight: {} },
    settings: { ...DEFAULT_SETTINGS },
    weeklyReviews: {},
  };
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  P0: 'Critical',
  P1: 'High value',
  P2: 'Useful',
  P3: 'Optional',
};

/** True when stored progress predates the current epoch and must be discarded. */
export function isStaleEpoch(state: AppState): boolean {
  return state.dataEpoch < DATA_EPOCH;
}

/**
 * Preferences that survive an epoch change. Everything else in Settings is the
 * timetable, which an epoch change resets to his current routine.
 * Must match PREFERENCE_KEYS in netlify/functions/_shared/digest.mjs.
 */
export const PREFERENCE_KEYS = ['emailEnabled', 'dsaTargetPerDay', 'deepWorkMinutes', 'interviewMode'] as const;

/**
 * A clean Day 1 for a new epoch. Study progress goes; real-life records
 * (labs, supplements, work achievements, applications) and preferences stay.
 */
export function freshForNewEpoch(from: AppState): AppState {
  const fresh = defaultState();
  for (const key of PREFERENCE_KEYS) {
    (fresh.settings as unknown as Record<string, unknown>)[key] = from.settings[key];
  }
  fresh.health.supplements = from.health.supplements;
  fresh.health.labs = from.health.labs;
  fresh.health.nextTestDate = from.health.nextTestDate;
  fresh.health.focus = from.health.focus;
  fresh.health.weight = from.health.weight;
  fresh.work = from.work;
  fresh.applications = from.applications;
  return fresh;
}

/**
 * The manual reset in Settings. Same as an epoch change, except his current
 * timetable is kept exactly — the screen promises that.
 */
export function freshKeepingSettings(from: AppState): AppState {
  const fresh = freshForNewEpoch(from);
  fresh.settings = { ...DEFAULT_SETTINGS, ...from.settings };
  return fresh;
}
