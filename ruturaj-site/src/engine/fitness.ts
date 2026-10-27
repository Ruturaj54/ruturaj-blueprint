import type { AppState, WorkoutLog } from '@/lib/schema';
import { SESSIONS, WEEKLY_SESSION, sessionById, type Session } from '@/data/fitness';
import { todayISO, addDays, weekdayOf } from './dates';
import type { ExerciseSlot } from './schedule';

/** Which slot exercise takes on a date: his default, or the day's override. */
export function exerciseSlotFor(state: AppState, date: string): ExerciseSlot {
  const dow = weekdayOf(date);
  // Weekends are morning by design: the Saturday long run and the Sunday walk.
  if (dow === 0 || dow === 6) return state.exerciseOverrides[date] === 'rest' ? 'rest' : 'morning';
  return state.exerciseOverrides[date] ?? state.settings.exerciseSlot;
}

export interface TodaySession {
  date: string;
  session: Session;
  slot: ExerciseSlot;
  /** The log for this date, if any. */
  logged: WorkoutLog | null;
  done: boolean;
}

export function sessionFor(state: AppState, date: string = todayISO()): TodaySession {
  const slot = exerciseSlotFor(state, date);
  const id = WEEKLY_SESSION[weekdayOf(date)] ?? 'run-easy';
  const session = sessionById(id) ?? (SESSIONS[0] as Session);
  const logged = state.runs.find((r) => r.date === date && r.kind !== 'rest') ?? null;
  return { date, session, slot, logged, done: Boolean(logged) };
}

export interface FitnessWeek {
  days: Array<{ date: string; logged: WorkoutLog | null; planned: Session }>;
  sessions: number;
  minutes: number;
  km: number;
}

/** The last seven days ending today. */
export function fitnessWeek(state: AppState, today: string = todayISO()): FitnessWeek {
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i)).map((date) => ({
    date,
    logged: state.runs.find((r) => r.date === date && r.kind !== 'rest') ?? null,
    planned: sessionById(WEEKLY_SESSION[weekdayOf(date)] ?? 'run-easy') ?? (SESSIONS[0] as Session),
  }));
  const logs = days.map((d) => d.logged).filter((l): l is WorkoutLog => Boolean(l));
  return {
    days,
    sessions: logs.length,
    minutes: logs.reduce((n, l) => n + l.minutes, 0),
    km: Math.round(logs.reduce((n, l) => n + (l.km ?? 0), 0) * 10) / 10,
  };
}

/** Consecutive days with a logged session, counting back from today or yesterday. */
export function fitnessStreak(state: AppState, today: string = todayISO()): number {
  const dates = new Set(state.runs.filter((r) => r.kind !== 'rest').map((r) => r.date));
  let streak = 0;
  let cursor = dates.has(today) ? today : addDays(today, -1);
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function logWorkout(
  draft: AppState,
  input: { date: string; slot: 'morning' | 'evening'; kind: WorkoutLog['kind']; minutes: number; km?: number; parts?: string[] },
): void {
  draft.runs.push({
    id: `wo-${Date.now()}`,
    date: input.date,
    slot: input.slot,
    kind: input.kind,
    minutes: Math.max(0, Math.round(input.minutes)),
    ...(input.km && input.km > 0 ? { km: Math.round(input.km * 100) / 100 } : {}),
    ...(input.parts?.length ? { parts: input.parts } : {}),
  });
}

export function setExerciseOverride(draft: AppState, date: string, slot: ExerciseSlot | null): void {
  if (slot === null || slot === draft.settings.exerciseSlot) delete draft.exerciseOverrides[date];
  else draft.exerciseOverrides[date] = slot;
}
