import type { DsaAttempt, DeepWorkSession, TaskState, Priority } from '@/engine/types';
import type {
  WorkoutLog,
  DayLog,
  ActivityLog,
  WorkAchievement,
  Application,
  HealthState,
  WeeklyReview,
} from './records';
import { todayISO } from '@/engine/dates';
import { DEFAULT_SETTINGS, PREFERENCE_KEYS, type Settings } from './settings';

export { SETTINGS_VERSION, DEFAULT_SETTINGS, PREFERENCE_KEYS } from './settings';
export type { Settings, Theme } from './settings';

export type {
  WorkoutKind,
  WorkoutLog,
  DayLog,
  ActivityLog,
  WorkAchievement,
  ApplicationStage,
  Application,
  LabValue,
  Supplement,
  HealthState,
  WeeklyReview,
} from './records';

export const STATE_VERSION = 3;

/**
 * Bumped when stored progress must be discarded rather than migrated.
 *
 * Epoch 5 (28 Oct 2026): the first clean restart.
 *
 * Epoch 6 (23 Nov 2026): the restart he asked for when he got serious about
 * surprise prep. Old course ticks, day logs, DSA attempts and deep-work
 * sessions go. What stays: his preferences, the prep tracker, the work log,
 * applications, and every real-life record (runs, daily activity, weight,
 * labs). If Day 1 had been pressed it re-anchors to the day the app (or the
 * next mail) first reads the new epoch, so that day is Day 1. The prep window
 * goes to the tracker's full 28 days, because his weekday prep block is now
 * two hours rather than five.
 */
export const DATA_EPOCH = 6;

/* ---------- program: Day 1, phases ---------------------------------------- */

export type ProgramPhase = 'amazon' | 'general';

/** Exercise is a morning run; a day can be marked as rest. Evenings belong to the walk. */
export type ExerciseOverride = 'rest';

export interface Program {
  /** Day 1, set by the explicit "Start Day 1" action. Absent = not started. */
  startedOn?: string;
  phase: ProgramPhase;
  /** Surprise-prep window in days (the Amazon tracker), plus any extensions. */
  amazonWindowDays: number;
  amazonExtendedDays: number;
  amazonCompletedOn?: string;
  /** Day 1 of the general roadmap; set when the Amazon phase is marked complete. */
  generalStartedOn?: string;
}

/* ---------- Amazon SDE-1 ---------------------------------------------------- */

export type AmazonStage = 'awaiting_invite' | 'interview_scheduled' | 'interview_done';
export type AmazonOutcome = 'independent' | 'hint' | 'reviewed';

export interface AmazonItemLog {
  doneOn: string;
  outcome?: AmazonOutcome;
  minutes?: number;
  note?: string;
  /** Next cold re-solve date, from the spaced-revision rules. */
  revisitOn?: string;
  revisits: number;
  /** What each re-solve overwrote, newest last, so a mis-tap can be reverted. */
  history?: Array<{ on: string; outcome?: AmazonOutcome; revisitOn?: string }>;
}

export interface AmazonState {
  stage: AmazonStage;
  /** Online assessment date, as he reported it. */
  oaDate: string;
  interviewDate?: string;
  interviewNote?: string;
  /** Curriculum item key -> log. Only a logged outcome counts; opening does not. */
  items: Record<string, AmazonItemLog>;
  /** Frequency-list extras (xkey) -> date ticked. */
  extras: Record<string, string>;
  /** Topic coverage ids he marked solid, so their basics drop to optional. */
  solidTopics: string[];
}

export interface AppState {
  version: number;
  dataEpoch: number;
  updatedAt: string;
  program: Program;
  amazon: AmazonState;
  foundation: Record<string, boolean>;
  foundationUnlockedAt?: string;
  foundationOverride?: boolean;
  tasks: Record<string, TaskState>;
  days: Record<string, DayLog>;
  praiseSeen: Record<string, boolean>;
  habits: Record<string, string[]>;
  dsa: DsaAttempt[];
  deepWork: DeepWorkSession[];
  runs: WorkoutLog[];
  /** ISO date -> 'rest' when that day's run is skipped on purpose. */
  exerciseOverrides: Record<string, ExerciseOverride>;
  /** ISO date -> the day's movement numbers (steps, km, calories). */
  activity: Record<string, ActivityLog>;
  work: WorkAchievement[];
  applications: Application[];
  health: HealthState;
  settings: Settings;
  weeklyReviews: Record<string, WeeklyReview>;
}

/** The tracker's own length: 28 days fits its plan into a two-hour weekday prep block. */
export const PREP_WINDOW_DAYS = 28;

export const DEFAULT_PROGRAM: Program = {
  phase: 'amazon',
  amazonWindowDays: PREP_WINDOW_DAYS,
  amazonExtendedDays: 0,
};

export const DEFAULT_AMAZON: AmazonState = {
  stage: 'awaiting_invite',
  oaDate: '2026-10-19',
  items: {},
  extras: {},
  solidTopics: [],
};

export function defaultState(): AppState {
  return {
    version: STATE_VERSION,
    dataEpoch: DATA_EPOCH,
    // "Never written": a fresh device must lose to any real copy on the server.
    updatedAt: new Date(0).toISOString(),
    program: { ...DEFAULT_PROGRAM },
    amazon: { ...DEFAULT_AMAZON, items: {}, extras: {}, solidTopics: [] },
    foundation: {},
    tasks: {},
    days: {},
    praiseSeen: {},
    habits: {},
    dsa: [],
    deepWork: [],
    runs: [],
    exerciseOverrides: {},
    activity: {},
    work: [],
    applications: [],
    health: { supplements: [], labs: [], sleep: {}, adherence: {}, focus: [], weight: {} },
    settings: { ...DEFAULT_SETTINGS },
    weeklyReviews: {},
  };
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  P0: 'Must do',
  P1: 'High value',
  P2: 'Useful',
  P3: 'Optional',
};

export function isStaleEpoch(state: AppState): boolean {
  return state.dataEpoch < DATA_EPOCH;
}

/**
 * A clean start for a new epoch: old progress goes; preferences, the prep
 * tracker and real-life records stay; a started programme re-anchors to today.
 */
export function freshForNewEpoch(from: AppState, today: string = todayISO()): AppState {
  const fresh = defaultState();
  for (const key of PREFERENCE_KEYS) {
    (fresh.settings as unknown as Record<string, unknown>)[key] = from.settings[key];
  }
  fresh.amazon = structuredClone(from.amazon);
  fresh.program = {
    ...from.program,
    amazonWindowDays: PREP_WINDOW_DAYS,
    amazonExtendedDays: 0,
    ...(from.program.startedOn ? { startedOn: today } : {}),
    ...(from.program.generalStartedOn ? { generalStartedOn: today } : {}),
    ...(from.program.amazonCompletedOn ? { amazonCompletedOn: today } : {}),
  };
  fresh.health.supplements = from.health.supplements;
  fresh.health.labs = from.health.labs;
  fresh.health.nextTestDate = from.health.nextTestDate;
  fresh.health.focus = from.health.focus;
  fresh.health.weight = from.health.weight;
  fresh.health.sleep = from.health.sleep;
  // Real-life records survive every restart (records.ts): what he ran and walked happened.
  fresh.runs = from.runs;
  fresh.activity = from.activity;
  fresh.work = from.work;
  fresh.applications = from.applications;
  return fresh;
}

/**
 * The manual reset in Settings: a full start-over. Progress, the prep tracker
 * and Day 1 go; the timetable, preferences and real-life records stay.
 */
export function freshKeepingSettings(from: AppState): AppState {
  const fresh = freshForNewEpoch(from);
  fresh.settings = { ...DEFAULT_SETTINGS, ...from.settings };
  fresh.amazon = { ...DEFAULT_AMAZON, items: {}, extras: {}, solidTopics: [] };
  fresh.program = { ...DEFAULT_PROGRAM };
  return fresh;
}
