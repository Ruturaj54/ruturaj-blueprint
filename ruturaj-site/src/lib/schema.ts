import type { DsaAttempt, DeepWorkSession, TaskState, Priority } from '@/engine/types';
import type {
  WorkoutLog,
  DayLog,
  WorkAchievement,
  Application,
  HealthState,
  WeeklyReview,
} from './records';
import { todayISO } from '@/engine/dates';

export type {
  WorkoutKind,
  WorkoutLog,
  DayLog,
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
 * Epoch 5 (28 Oct 2026): the clean restart he asked for. Old course ticks,
 * day logs, DSA attempts, runs and deep-work sessions go. What stays: his
 * preferences, the Amazon tracker state, work log, applications, weight and
 * lab records. If Day 1 had been pressed, it re-anchors to the day the app
 * is next opened, so today is Day 1.
 */
export const DATA_EPOCH = 5;

/** Timetable keys were renamed on 25 Oct 2026; older settings take new defaults. */
export const SETTINGS_VERSION = 2;

/* ---------- program: Day 1, phases ---------------------------------------- */

export type ProgramPhase = 'amazon' | 'general';

/** Light is the default; system follows the device. */
export type Theme = 'light' | 'dark' | 'system';

export interface Program {
  /** Day 1, set by the explicit "Start Day 1" action. Absent = not started. */
  startedOn?: string;
  phase: ProgramPhase;
  /** Intensive Amazon window in days, plus any extensions. */
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

export interface Settings {
  settingsVersion: number;
  name: string;
  /* weekday timetable, 24h "HH:MM" IST */
  wakeTime: string;
  exerciseStart: string;
  exerciseEnd: string;
  /** Leaving home to getting back. */
  officeStart: string;
  officeEnd: string;
  /** Spare light study at the office; 0 by default. */
  officeStudyHours: number;
  studyBlock1Start: string;
  studyBlock1End: string;
  studyBlock2Start: string;
  studyBlock2End: string;
  /** The short walk runs from studyBlock2End to walkEnd. */
  walkEnd: string;
  studyBlock3End: string;
  studyBlock3Enabled: boolean;
  /* weekend */
  weekendWakeTime: string;
  weekendSleepTime: string;
  /* exercise */
  exerciseSlot: 'morning' | 'evening';
  /* email */
  timezone: string;
  morningEmailTime: string;
  eveningEmailTime: string;
  emailEnabled: boolean;
  /* study */
  deepWorkMinutes: number;
  dsaTargetPerDay: number;
  /* appearance */
  theme: Theme;
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
  /** ISO date -> exercise slot override for that day. */
  exerciseOverrides: Record<string, 'morning' | 'evening' | 'rest'>;
  work: WorkAchievement[];
  applications: Application[];
  health: HealthState;
  settings: Settings;
  weeklyReviews: Record<string, WeeklyReview>;
}

/**
 * His day as described on 25 Oct 2026: home at 17:00, study 18:00–20:00,
 * dinner and recovery to 21:00, deep study 21:00–23:00, a short walk, then an
 * optional final block to 01:00. Six hours of sleep from 01:00 to 07:00.
 */
export const DEFAULT_SETTINGS: Settings = {
  settingsVersion: SETTINGS_VERSION,
  name: 'Ruturaj',
  wakeTime: '07:00',
  exerciseStart: '07:10',
  exerciseEnd: '08:00',
  officeStart: '08:45',
  officeEnd: '17:00',
  officeStudyHours: 0,
  studyBlock1Start: '18:00',
  studyBlock1End: '20:00',
  studyBlock2Start: '21:00',
  studyBlock2End: '23:00',
  walkEnd: '23:30',
  studyBlock3End: '01:00',
  studyBlock3Enabled: true,
  weekendWakeTime: '08:00',
  weekendSleepTime: '23:30',
  exerciseSlot: 'morning',
  timezone: 'Asia/Kolkata',
  morningEmailTime: '06:00',
  eveningEmailTime: '17:00',
  emailEnabled: true,
  deepWorkMinutes: 50,
  dsaTargetPerDay: 3,
  theme: 'light',
};

export const DEFAULT_PROGRAM: Program = {
  phase: 'amazon',
  amazonWindowDays: 14,
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

/** Preferences that survive a timetable migration or an epoch change. */
export const PREFERENCE_KEYS = ['emailEnabled', 'dsaTargetPerDay', 'deepWorkMinutes', 'name', 'theme'] as const;

/**
 * A clean start for a new epoch: old progress goes; preferences, the Amazon
 * tracker, real-life records stay; a started programme re-anchors to today.
 */
export function freshForNewEpoch(from: AppState, today: string = todayISO()): AppState {
  const fresh = defaultState();
  for (const key of PREFERENCE_KEYS) {
    (fresh.settings as unknown as Record<string, unknown>)[key] = from.settings[key];
  }
  fresh.amazon = structuredClone(from.amazon);
  fresh.program = {
    ...from.program,
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
  fresh.work = from.work;
  fresh.applications = from.applications;
  return fresh;
}

/** The manual reset in Settings: same as an epoch change, but the timetable is kept. */
export function freshKeepingSettings(from: AppState): AppState {
  const fresh = freshForNewEpoch(from);
  fresh.settings = { ...DEFAULT_SETTINGS, ...from.settings };
  return fresh;
}
