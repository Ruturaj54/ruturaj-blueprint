import type { AppState } from '@/lib/schema';
import { todayISO, addDays, daysBetween, missionTotalDays, dayForDate, clampDay, TARGET_DATE } from './dates';

/**
 * Where he is in the programme: Day 1 is whatever date he pressed Start on,
 * the Amazon intensive runs first, and the general roadmap begins the day the
 * Amazon phase is marked complete. Nothing here is hard-coded to a calendar.
 */

export interface AmazonWindow {
  day: number;
  windowDays: number;
  endsOn: string;
  /** Days left in the window including today; 0 once it is over. */
  daysLeft: number;
  /** True once today is past the window and the phase is still Amazon. */
  overrun: boolean;
}

export interface ProgramInfo {
  started: boolean;
  startedOn: string;
  /** Days since Day 1, 1-indexed. 0 before start. */
  day: number;
  phase: 'amazon' | 'general';
  amazon: AmazonWindow;
  general: { started: boolean; startedOn: string | null; day: number; totalDays: number; daysLeft: number };
  /** Days from today to the application target date. */
  daysToTarget: number;
}

export function programInfo(state: AppState, today: string = todayISO()): ProgramInfo {
  const p = state.program;
  const started = Boolean(p.startedOn);
  const startedOn = p.startedOn ?? today;
  const day = started ? Math.max(1, daysBetween(startedOn, today) + 1) : 0;

  const windowDays = p.amazonWindowDays + p.amazonExtendedDays;
  const endsOn = addDays(startedOn, windowDays - 1);
  const overrun = started && p.phase === 'amazon' && today > endsOn;

  const generalStarted = p.phase === 'general' && Boolean(p.generalStartedOn);
  const totalDays = missionTotalDays();
  const generalDay = generalStarted ? clampDay(dayForDate(today)) : 0;

  return {
    started,
    startedOn,
    day,
    phase: p.phase,
    amazon: {
      day: Math.max(1, daysBetween(startedOn, today) + 1),
      windowDays,
      endsOn,
      // Inclusive of today: on the last day of the window this reads 1.
      daysLeft: overrun ? 0 : Math.max(0, daysBetween(today, endsOn) + 1),
      overrun,
    },
    general: {
      started: generalStarted,
      startedOn: p.generalStartedOn ?? null,
      day: generalDay,
      totalDays,
      daysLeft: generalStarted ? Math.max(0, totalDays - generalDay) : totalDays,
    },
    daysToTarget: Math.max(0, daysBetween(today, TARGET_DATE)),
  };
}

/* ---------- mutations (apply inside storage.update) ------------------------ */

/** The explicit Day 1 action. Idempotent: pressing it twice changes nothing. */
export function startProgram(draft: AppState, today: string = todayISO()): void {
  if (draft.program.startedOn) return;
  draft.program.startedOn = today;
  draft.program.phase = 'amazon';
}

/** Ends the Amazon intensive and makes the general roadmap the daily programme. */
export function completeAmazonPhase(draft: AppState, today: string = todayISO()): void {
  draft.program.amazonCompletedOn = today;
  draft.program.phase = 'general';
  draft.program.generalStartedOn ??= today;
}

/** Puts Amazon back as the daily priority, e.g. when the interview call arrives. */
export function reactivateAmazonPhase(draft: AppState): void {
  draft.program.phase = 'amazon';
  delete draft.program.amazonCompletedOn;
}

export function extendAmazonWindow(draft: AppState, days: number): void {
  draft.program.amazonExtendedDays = Math.max(0, draft.program.amazonExtendedDays + days);
}

export function setAmazonWindow(draft: AppState, days: number): void {
  draft.program.amazonWindowDays = Math.max(1, Math.round(days));
  draft.program.amazonExtendedDays = 0;
}
