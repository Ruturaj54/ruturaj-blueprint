import { TOTAL_DAYS, clampDay, dateForDay, weekOfDay, isSunday } from './dates';
import type { MissionPhase } from './types';

/**
 * The 117-day mission: 21 Sep 2026 → 15 Jan 2027, ending just before the
 * two-year mark at Parallel Wireless on ~15 Jan 2027.
 *
 * Month 1 is the Foundation Gate. Months 2–4 only unlock once it clears, so
 * course-collecting cannot quietly consume the whole runway.
 */
export const MISSION_PHASES: readonly MissionPhase[] = [
  {
    id: 'm1',
    label: 'M1',
    title: 'Foundation Gate',
    startDay: 1,
    endDay: 30,
    focus: 'FINISH WHAT YOU ALREADY STARTED',
    description:
      'Close out the courses already in flight — Apna College Python/ML/DL, Five Minute Engineering AI, LSP, C, C++ and DSA basics. Nothing new gets added this month. Each subject is proven by an implementation, not a completion percentage.',
  },
  {
    id: 'm2',
    label: 'M2',
    title: 'SDE Fundamentals + AI Engineering',
    startDay: 31,
    endDay: 60,
    focus: 'DEPTH OVER COVERAGE',
    description:
      'DSA moves to daily patterns. Core CS (OS, networking, DBMS) gets formal treatment. Django/DRF and FastAPI move toward production shape, and the first real AI engineering work starts — embeddings, retrieval, evaluation.',
  },
  {
    id: 'm3',
    label: 'M3',
    title: 'Interview-Level Preparation',
    startDay: 61,
    endDay: 90,
    focus: 'MEDIUM-HEAVY DSA · SYSTEM DESIGN · SHIP THE AI PROJECT',
    description:
      'DSA shifts medium-heavy with timed sets. System design becomes a daily thread. The flagship AI/RAG project reaches a deployed, defensible state. Java/Spring Boot enters at interview depth only.',
  },
  {
    id: 'm4',
    label: 'M4',
    title: 'Interview Execution',
    startDay: 91,
    endDay: TOTAL_DAYS,
    focus: 'APPLY · MOCK · NEGOTIATE',
    description:
      'Company-specific preparation, mock interviews, behavioural and leadership stories, resume and portfolio polish, and applications going out in waves. Learning narrows to whatever the loops actually demand.',
  },
] as const;

export function phaseForDay(n: number): MissionPhase {
  const day = clampDay(n);
  const phase = MISSION_PHASES.find((p) => day >= p.startDay && day <= p.endDay);
  // The phases tile 1..TOTAL_DAYS with no gaps, so this is unreachable — but a
  // clamped day must still return something rather than crash the render tree.
  return phase ?? MISSION_PHASES[0]!;
}

export interface DayContext {
  day: number;
  date: string;
  week: number;
  phase: MissionPhase;
  /** Day index inside the phase, 1-indexed. */
  dayInPhase: number;
  isSunday: boolean;
  /** Sunday is review day — the weekly review is generated, not new material. */
  isReviewDay: boolean;
  daysLeft: number;
}

export function dayContext(n: number): DayContext {
  const day = clampDay(n);
  const date = dateForDay(day);
  const phase = phaseForDay(day);
  return {
    day,
    date,
    week: weekOfDay(day),
    phase,
    dayInPhase: day - phase.startDay + 1,
    isSunday: isSunday(date),
    isReviewDay: isSunday(date),
    daysLeft: Math.max(0, TOTAL_DAYS - day),
  };
}

/** Whole-mission completion from a set of completed day numbers. */
export function missionProgress(completedDays: number): number {
  return Math.round((completedDays / TOTAL_DAYS) * 100);
}
