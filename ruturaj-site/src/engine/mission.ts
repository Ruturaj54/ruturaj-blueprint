import { TOTAL_DAYS, clampDay, dateForDay, weekOfDay, isSunday } from './dates';
import type { MissionPhase } from './types';

/**
 * The 161-day mission: 21 Sep 2026 → 28 Feb 2027. Exactly 23 weeks.
 *
 * Extended from the original 15 Jan target because the course load is real:
 * the Five Minute Engineering bootcamp alone is a 7–8 month syllabus, and the
 * foundation needs six weeks rather than four to clear honestly. The two-year
 * mark at Parallel Wireless still passes in mid-January, so applications can
 * start before the mission ends.
 *
 * Phase 1 is the Foundation Gate. Phases 2–4 only unlock once it clears, so
 * course-collecting cannot quietly consume the whole runway.
 */
export const MISSION_PHASES: readonly MissionPhase[] = [
  {
    id: 'm1',
    label: 'P1',
    title: 'Foundation Gate',
    startDay: 1,
    endDay: 42,
    focus: 'FINISH WHAT YOU ALREADY STARTED',
    description:
      'Six weeks to close out the courses already in flight — Apna College Prime AI/ML, the Five Minute Engineering bootcamp core, PPA/C/C++, LSP and DSA basics. Nothing new gets added. Each subject is proven by an implementation, not a completion percentage.',
  },
  {
    id: 'm2',
    label: 'P2',
    title: 'SDE Fundamentals + AI Engineering',
    startDay: 43,
    endDay: 91,
    focus: 'DEPTH OVER COVERAGE',
    description:
      'DSA moves to daily patterns. Core CS (OS, networking, DBMS) gets formal treatment. Django/DRF and FastAPI move toward production shape, and the first real AI engineering work starts — embeddings, retrieval, evaluation.',
  },
  {
    id: 'm3',
    label: 'P3',
    title: 'Interview-Level Preparation',
    startDay: 92,
    endDay: 133,
    focus: 'MEDIUM-HEAVY DSA · SYSTEM DESIGN · SHIP THE AI PROJECT',
    description:
      'DSA shifts medium-heavy with timed sets. System design becomes a daily thread. The flagship AI/RAG project reaches a deployed, defensible state. Java/Spring Boot enters at interview depth only.',
  },
  {
    id: 'm4',
    label: 'P4',
    title: 'Interview Execution',
    startDay: 134,
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
