import { missionTotalDays, clampDay, dateForDay, weekOfDay, isSunday } from './dates';
import type { MissionPhase } from './types';

/**
 * The general roadmap's four phases, scaled to however many days are left
 * between its Day 1 and the application target date. The shape is fixed
 * (foundation ≈ 26%, fundamentals + AI ≈ 30%, interview prep ≈ 26%,
 * execution ≈ 18%); the day numbers follow the real start date.
 */

const SHAPE = [
  { id: 'm1', label: 'P1', title: 'Foundation Gate', share: 0.26, focus: 'FINISH WHAT YOU ALREADY STARTED', description: 'Close out the courses already in flight — Apna College Prime AI/ML, the Five Minute Engineering core, PPA/C/C++, LSP and DSA basics. Nothing new gets added. Each subject is proven by an implementation, not a completion percentage.' },
  { id: 'm2', label: 'P2', title: 'SDE Fundamentals + AI Engineering', share: 0.3, focus: 'DEPTH OVER COVERAGE', description: 'DSA moves to daily patterns. OS, networking and DBMS get formal treatment. Docker, Kubernetes, Jenkins and CI/CD build on the pipelines you already own. The first real AI engineering work starts: embeddings, retrieval, evaluation.' },
  { id: 'm3', label: 'P3', title: 'Interview-Level Preparation', share: 0.26, focus: 'MEDIUM-HEAVY DSA · LLD · SYSTEM DESIGN · SHIP A PROJECT', description: 'DSA shifts medium-heavy with timed sets. Low-level and system design become a daily thread. The flagship project reaches a deployed, defensible state.' },
  { id: 'm4', label: 'P4', title: 'Interview Execution', share: 0.18, focus: 'APPLY · MOCK · NEGOTIATE', description: 'Company-specific preparation, mock interviews, behavioural stories, resume and portfolio polish, and applications going out in waves.' },
] as const;

export function missionPhases(): MissionPhase[] {
  const total = missionTotalDays();
  let start = 1;
  return SHAPE.map((s, i) => {
    const length = i === SHAPE.length - 1 ? total - start + 1 : Math.max(7, Math.round(total * s.share));
    const phase: MissionPhase = {
      id: s.id,
      label: s.label,
      title: s.title,
      startDay: start,
      endDay: Math.min(total, start + length - 1),
      focus: s.focus,
      description: s.description,
    };
    start = phase.endDay + 1;
    return phase;
  });
}

export function phaseForDay(n: number): MissionPhase {
  const day = clampDay(n);
  const phases = missionPhases();
  return phases.find((p) => day >= p.startDay && day <= p.endDay) ?? (phases[0] as MissionPhase);
}

export interface DayContext {
  day: number;
  date: string;
  week: number;
  phase: MissionPhase;
  dayInPhase: number;
  isSunday: boolean;
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
    daysLeft: Math.max(0, missionTotalDays() - day),
  };
}
