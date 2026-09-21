import type {
  DsaAttempt,
  DeepWorkSession,
  TaskState,
  Priority,
} from '@/engine/types';

export const STATE_VERSION = 2;

export interface RunLog {
  id: string;
  date: string;
  slot: 'morning' | 'evening';
  km: number;
  minutes: number;
}

export interface DayLog {
  /** Task ids planned for this date, captured when the day was started. */
  planned: string[];
  /** Task ids actually completed. */
  completed: string[];
  notes?: string;
  /** 0–100, computed at day close. */
  score?: number;
  blockers?: string;
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
}

export interface Settings {
  /** 24h "HH:MM" IST. Schedule is configurable, never hardcoded. */
  wakeTime: string;
  morningRunTime: string;
  officeStart: string;
  officeEnd: string;
  /** Spare capacity at work, used for course/reading only — never instead of the job. */
  officeStudyHours: number;
  /** Evening block: course and learning. */
  studyBlock1Start: string;
  studyBlock1End: string;
  eveningRunTime: string;
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
  updatedAt: string;
  /** milestoneId -> completed */
  foundation: Record<string, boolean>;
  /** Set when the Foundation Gate is cleared. Presence unlocks Advanced Mode. */
  foundationUnlockedAt?: string;
  /** True when the gate was forced rather than earned. Shown in the UI. */
  foundationOverride?: boolean;
  tasks: Record<string, TaskState>;
  days: Record<string, DayLog>;
  dsa: DsaAttempt[];
  deepWork: DeepWorkSession[];
  runs: RunLog[];
  work: WorkAchievement[];
  applications: Application[];
  health: HealthState;
  settings: Settings;
  weeklyReviews: Record<string, WeeklyReview>;
}

export const DEFAULT_SETTINGS: Settings = {
  wakeTime: '07:00',
  morningRunTime: '07:00',
  officeStart: '10:30',
  officeEnd: '18:00',
  officeStudyHours: 2,
  studyBlock1Start: '18:00',
  studyBlock1End: '20:00',
  eveningRunTime: '20:30',
  studyBlock2Start: '22:00',
  studyBlock2End: '02:00',
  deepWorkStart: '22:00',
  sleepTarget: '02:00',
  timezone: 'Asia/Kolkata',
  morningEmailTime: '07:00',
  eveningEmailTime: '22:00',
  emailEnabled: true,
  deepWorkMinutes: 50,
  dsaTargetPerDay: 3,
  interviewMode: false,
};

export function defaultState(): AppState {
  return {
    version: STATE_VERSION,
    updatedAt: new Date().toISOString(),
    foundation: {},
    tasks: {},
    days: {},
    dsa: [],
    deepWork: [],
    runs: [],
    work: [],
    applications: [],
    health: { supplements: [], labs: [], sleep: {}, adherence: {} },
    settings: { ...DEFAULT_SETTINGS },
    weeklyReviews: {},
  };
}

/* ---------- runtime guards ---------------------------------------------- */
/* Hand-rolled rather than a schema library: the shapes are simple, this ships
   zero extra bytes to the browser, and a corrupt blob must degrade to defaults
   rather than throw into the render tree. */

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const rec = <T>(v: unknown): Record<string, T> =>
  isObj(v) ? (v as Record<string, T>) : {};

/**
 * Coerces anything into a valid AppState. Unknown fields are dropped, missing
 * fields fall back to defaults, and a wrong-typed field never propagates.
 */
export function parseState(raw: unknown): AppState {
  const base = defaultState();
  if (!isObj(raw)) return base;

  const health = isObj(raw.health) ? raw.health : {};
  const settings = isObj(raw.settings) ? raw.settings : {};

  return {
    version: typeof raw.version === 'number' ? raw.version : STATE_VERSION,
    updatedAt:
      typeof raw.updatedAt === 'string' ? raw.updatedAt : base.updatedAt,
    foundation: rec<boolean>(raw.foundation),
    foundationUnlockedAt:
      typeof raw.foundationUnlockedAt === 'string'
        ? raw.foundationUnlockedAt
        : undefined,
    foundationOverride: raw.foundationOverride === true,
    tasks: rec<TaskState>(raw.tasks),
    days: rec<DayLog>(raw.days),
    dsa: arr<DsaAttempt>(raw.dsa),
    deepWork: arr<DeepWorkSession>(raw.deepWork),
    runs: arr<RunLog>(raw.runs),
    work: arr<WorkAchievement>(raw.work),
    applications: arr<Application>(raw.applications),
    health: {
      supplements: arr<Supplement>(health.supplements),
      labs: arr<LabValue>(health.labs),
      nextTestDate:
        typeof health.nextTestDate === 'string'
          ? health.nextTestDate
          : undefined,
      sleep: rec<number>(health.sleep),
      adherence: rec<string[]>(health.adherence),
    },
    settings: { ...DEFAULT_SETTINGS, ...(settings as Partial<Settings>) },
    weeklyReviews: rec<WeeklyReview>(raw.weeklyReviews),
  };
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  P0: 'Critical',
  P1: 'High value',
  P2: 'Useful',
  P3: 'Optional',
};
