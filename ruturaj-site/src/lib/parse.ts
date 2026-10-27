import type { DsaAttempt, DeepWorkSession, TaskState } from '@/engine/types';
import {
  STATE_VERSION,
  SETTINGS_VERSION,
  DEFAULT_SETTINGS,
  DEFAULT_PROGRAM,
  DEFAULT_AMAZON,
  PREFERENCE_KEYS,
  defaultState,
  type AppState,
  type AmazonItemLog,
  type AmazonStage,
  type Application,
  type DayLog,
  type LabValue,
  type Settings,
  type Supplement,
  type WeeklyReview,
  type WorkAchievement,
  type WorkoutLog,
} from './schema';

/* Hand-rolled rather than a schema library: the shapes are simple, this ships
   zero extra bytes, and a corrupt or hostile blob must degrade to defaults
   rather than throw into the render tree or a scheduled mail. */

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const objs = <T>(v: unknown): T[] => arr<unknown>(v).filter(isObj) as T[];
const rec = <T>(v: unknown): Record<string, T> => (isObj(v) ? (v as Record<string, T>) : {});
const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^\d{2}:\d{2}$/;
const iso = (v: unknown): string | undefined => (typeof v === 'string' && ISO.test(v) ? v : undefined);
const strings = (v: unknown): string[] => arr<unknown>(v).filter((x): x is string => typeof x === 'string');

/** Only finite positive numbers survive; a typo must not draw a 0 kg point. */
const numbers = (v: unknown): Record<string, number> =>
  Object.fromEntries(
    Object.entries(rec<unknown>(v)).filter(
      (e): e is [string, number] => typeof e[1] === 'number' && Number.isFinite(e[1]) && e[1] > 0,
    ),
  );

const STAGES: AmazonStage[] = ['awaiting_invite', 'interview_scheduled', 'interview_done'];
const OUTCOMES = ['independent', 'hint', 'reviewed'] as const;
const KINDS = ['run', 'walk', 'strength', 'mobility', 'rest'] as const;
const TASK_STATUS = ['todo', 'in_progress', 'done', 'skipped'] as const;

/** Keeps only known keys whose value has the default's type; times must look like times. */
function parseSettings(raw: unknown): Settings {
  const s = isObj(raw) ? raw : {};
  const version = num(s.settingsVersion) ?? 1;
  const out: Settings = { ...DEFAULT_SETTINGS };
  // The timetable keys changed meaning in the October 2026 redesign. An older
  // blob keeps its preferences only; its schedule described a day he no longer lives.
  const keys = version >= SETTINGS_VERSION ? (Object.keys(DEFAULT_SETTINGS) as Array<keyof Settings>) : [...PREFERENCE_KEYS];
  for (const k of keys) {
    const v = s[k];
    const d = DEFAULT_SETTINGS[k];
    if (typeof v !== typeof d) continue;
    if (typeof d === 'string' && HHMM.test(d) && !HHMM.test(v as string)) continue;
    if (typeof d === 'number' && !Number.isFinite(v as number)) continue;
    if (k === 'exerciseSlot' && v !== 'morning' && v !== 'evening') continue;
    (out as unknown as Record<string, unknown>)[k] = v;
  }
  out.officeStudyHours = Math.min(3, Math.max(0, out.officeStudyHours));
  out.dsaTargetPerDay = Math.min(10, Math.max(1, Math.round(out.dsaTargetPerDay)));
  out.deepWorkMinutes = Math.min(180, Math.max(10, Math.round(out.deepWorkMinutes)));
  if (!out.name.trim()) out.name = DEFAULT_SETTINGS.name;
  out.settingsVersion = SETTINGS_VERSION;
  return out;
}

function parseDays(raw: unknown): Record<string, DayLog> {
  const out: Record<string, DayLog> = {};
  for (const [date, v] of Object.entries(rec<unknown>(raw))) {
    if (!ISO.test(date) || !isObj(v)) continue;
    const closedAt = str(v.closedAt);
    const notes = str(v.notes);
    const blockers = str(v.blockers);
    const score = num(v.score);
    out[date] = {
      planned: strings(v.planned),
      completed: strings(v.completed),
      ...(closedAt ? { closedAt } : {}),
      ...(notes ? { notes } : {}),
      ...(blockers ? { blockers } : {}),
      ...(score !== undefined ? { score } : {}),
    };
  }
  return out;
}

function parseTasks(raw: unknown): Record<string, TaskState> {
  const out: Record<string, TaskState> = {};
  for (const [id, v] of Object.entries(rec<unknown>(raw))) {
    if (!isObj(v)) continue;
    const status = TASK_STATUS.find((s) => s === v.status);
    if (!status) continue;
    out[id] = { ...(v as Partial<TaskState>), status };
  }
  return out;
}

function parseAmazonItems(raw: unknown): Record<string, AmazonItemLog> {
  const out: Record<string, AmazonItemLog> = {};
  for (const [key, v] of Object.entries(rec<unknown>(raw))) {
    if (!isObj(v)) continue;
    const doneOn = iso(v.doneOn);
    if (!doneOn) continue;
    const outcome = OUTCOMES.find((o) => o === v.outcome);
    const note = str(v.note);
    const revisitOn = iso(v.revisitOn);
    const minutes = num(v.minutes);
    const history = objs<Record<string, unknown>>(v.history)
      .filter((h) => iso(h.on))
      .map((h) => {
        const o = OUTCOMES.find((x) => x === h.outcome);
        const r = iso(h.revisitOn);
        return { on: h.on as string, ...(o ? { outcome: o } : {}), ...(r ? { revisitOn: r } : {}) };
      });
    out[key] = {
      doneOn,
      ...(outcome ? { outcome } : {}),
      ...(minutes !== undefined ? { minutes } : {}),
      ...(note ? { note } : {}),
      ...(revisitOn ? { revisitOn } : {}),
      revisits: num(v.revisits) ?? 0,
      ...(history.length ? { history } : {}),
    };
  }
  return out;
}

function parseWorkouts(raw: unknown): WorkoutLog[] {
  return objs<Record<string, unknown>>(raw)
    .filter((w) => typeof w.id === 'string' && iso(w.date))
    .map((w) => ({
      id: w.id as string,
      date: w.date as string,
      slot: w.slot === 'evening' ? 'evening' : 'morning',
      // Pre-redesign entries were runs only and carried no kind.
      kind: KINDS.find((k) => k === w.kind) ?? 'run',
      minutes: num(w.minutes) ?? 0,
      ...(typeof w.km === 'number' && w.km > 0 ? { km: w.km } : {}),
      ...(Array.isArray(w.parts) ? { parts: strings(w.parts) } : {}),
    }));
}

/** Coerces anything into a valid AppState. Unknown fields are dropped. */
export function parseState(raw: unknown): AppState {
  const base = defaultState();
  if (!isObj(raw)) return base;

  const health = isObj(raw.health) ? raw.health : {};
  const program = isObj(raw.program) ? raw.program : {};
  const amazon = isObj(raw.amazon) ? raw.amazon : {};
  const startedOn = iso(program.startedOn);
  const amazonCompletedOn = iso(program.amazonCompletedOn);
  const generalStartedOn = iso(program.generalStartedOn);
  const interviewDate = iso(amazon.interviewDate);
  const interviewNote = str(amazon.interviewNote);
  const windowDays = num(program.amazonWindowDays);

  return {
    version: num(raw.version) ?? STATE_VERSION,
    dataEpoch: num(raw.dataEpoch) ?? 0,
    updatedAt: str(raw.updatedAt) ?? base.updatedAt,
    program: {
      ...DEFAULT_PROGRAM,
      ...(startedOn ? { startedOn } : {}),
      phase: program.phase === 'general' ? 'general' : 'amazon',
      amazonWindowDays: windowDays !== undefined && windowDays >= 1 ? Math.round(windowDays) : DEFAULT_PROGRAM.amazonWindowDays,
      amazonExtendedDays: Math.max(0, num(program.amazonExtendedDays) ?? 0),
      ...(amazonCompletedOn ? { amazonCompletedOn } : {}),
      ...(generalStartedOn ? { generalStartedOn } : {}),
    },
    amazon: {
      stage: STAGES.find((s) => s === amazon.stage) ?? DEFAULT_AMAZON.stage,
      oaDate: iso(amazon.oaDate) ?? DEFAULT_AMAZON.oaDate,
      ...(interviewDate ? { interviewDate } : {}),
      ...(interviewNote ? { interviewNote } : {}),
      items: parseAmazonItems(amazon.items),
      extras: Object.fromEntries(
        Object.entries(rec<unknown>(amazon.extras)).filter((e): e is [string, string] => Boolean(iso(e[1]))),
      ),
      solidTopics: strings(amazon.solidTopics),
    },
    foundation: Object.fromEntries(Object.entries(rec<unknown>(raw.foundation)).filter((e) => e[1] === true)) as Record<string, boolean>,
    foundationUnlockedAt: str(raw.foundationUnlockedAt),
    foundationOverride: raw.foundationOverride === true,
    tasks: parseTasks(raw.tasks),
    days: parseDays(raw.days),
    praiseSeen: Object.fromEntries(Object.entries(rec<unknown>(raw.praiseSeen)).filter((e) => e[1] === true)) as Record<string, boolean>,
    habits: Object.fromEntries(Object.entries(rec<unknown>(raw.habits)).map(([d, ids]) => [d, strings(ids)])),
    dsa: objs<DsaAttempt>(raw.dsa).filter((a) => typeof a.problem === 'string' && iso(a.date)),
    deepWork: objs<DeepWorkSession>(raw.deepWork).filter((d) => iso(d.date) && typeof d.actualMinutes === 'number'),
    runs: parseWorkouts(raw.runs),
    exerciseOverrides: Object.fromEntries(
      Object.entries(rec<unknown>(raw.exerciseOverrides)).filter(
        (e): e is [string, 'morning' | 'evening' | 'rest'] =>
          ISO.test(e[0]) && (e[1] === 'morning' || e[1] === 'evening' || e[1] === 'rest'),
      ),
    ),
    work: objs<WorkAchievement>(raw.work).filter((w) => typeof w.raw === 'string'),
    applications: objs<Application>(raw.applications).filter((a) => typeof a.company === 'string'),
    health: {
      supplements: objs<Supplement>(health.supplements),
      labs: objs<LabValue>(health.labs).filter((l) => typeof l.marker === 'string'),
      nextTestDate: iso(health.nextTestDate),
      sleep: numbers(health.sleep),
      adherence: Object.fromEntries(Object.entries(rec<unknown>(health.adherence)).map(([d, ids]) => [d, strings(ids)])),
      focus: strings(health.focus),
      weight: numbers(health.weight),
    },
    settings: parseSettings(raw.settings),
    weeklyReviews: Object.fromEntries(Object.entries(rec<unknown>(raw.weeklyReviews)).filter((e) => isObj(e[1]))) as Record<string, WeeklyReview>,
  };
}
