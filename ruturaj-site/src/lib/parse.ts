import type { DsaAttempt, DeepWorkSession, TaskState } from '@/engine/types';
import {
  STATE_VERSION,
  DEFAULT_SETTINGS,
  defaultState,
  type AppState,
  type Application,
  type DayLog,
  type LabValue,
  type RunLog,
  type Settings,
  type Supplement,
  type WeeklyReview,
  type WorkAchievement,
} from './schema';

/* Hand-rolled rather than a schema library: the shapes are simple, this ships
   zero extra bytes to the browser, and a corrupt blob must degrade to defaults
   rather than throw into the render tree. */

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const rec = <T>(v: unknown): Record<string, T> =>
  isObj(v) ? (v as Record<string, T>) : {};

const strings = (v: unknown): string[] => arr<unknown>(v).filter((x): x is string => typeof x === 'string');

/** Only finite positive numbers survive — a typo must not draw a 0 kg point. */
const numbers = (v: unknown): Record<string, number> =>
  Object.fromEntries(
    Object.entries(rec<unknown>(v)).filter(
      (e): e is [string, number] => typeof e[1] === 'number' && Number.isFinite(e[1]) && e[1] > 0,
    ),
  );

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
    dataEpoch: typeof raw.dataEpoch === 'number' ? raw.dataEpoch : 0,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : base.updatedAt,
    foundation: rec<boolean>(raw.foundation),
    foundationUnlockedAt:
      typeof raw.foundationUnlockedAt === 'string' ? raw.foundationUnlockedAt : undefined,
    foundationOverride: raw.foundationOverride === true,
    tasks: rec<TaskState>(raw.tasks),
    days: rec<DayLog>(raw.days),
    praiseSeen: rec<boolean>(raw.praiseSeen),
    habits: Object.fromEntries(
      Object.entries(rec<unknown>(raw.habits)).map(([d, ids]) => [d, strings(ids)]),
    ),
    dsa: arr<DsaAttempt>(raw.dsa),
    deepWork: arr<DeepWorkSession>(raw.deepWork),
    runs: arr<RunLog>(raw.runs),
    work: arr<WorkAchievement>(raw.work),
    applications: arr<Application>(raw.applications),
    health: {
      supplements: arr<Supplement>(health.supplements),
      labs: arr<LabValue>(health.labs),
      nextTestDate: typeof health.nextTestDate === 'string' ? health.nextTestDate : undefined,
      sleep: rec<number>(health.sleep),
      adherence: rec<string[]>(health.adherence),
      focus: strings(health.focus),
      weight: numbers(health.weight),
    },
    settings: { ...DEFAULT_SETTINGS, ...(settings as Partial<Settings>) },
    weeklyReviews: rec<WeeklyReview>(raw.weeklyReviews),
  };
}
