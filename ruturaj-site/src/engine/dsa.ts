import type { DsaAttempt } from './types';
import type { AppState } from '@/lib/schema';
import { DSA_PATTERNS, type DsaPattern } from '@/data/tasks/dsa';
import { todayISO, parseDay } from './dates';

/**
 * §7 — the DSA weakness engine.
 *
 * Scores every pattern from logged attempts and surfaces the ones actually
 * costing interviews. Deliberately does not reward raw solve count: a pattern
 * with 40 solves you cannot redo cold is weaker than one with 8 you can.
 */

export interface PatternStats {
  pattern: DsaPattern;
  attempts: number;
  solved: number;
  hinted: number;
  failed: number;
  /** Clean solves over attempts. 1 when untouched, so it never reads as failing. */
  accuracy: number;
  avgMinutes: number;
  uniqueProblems: number;
  lastPracticed?: string;
  daysSincePractice: number;
  /** Higher is weaker. Drives both the UI and the priority engine. */
  weaknessScore: number;
  /** Progress toward the pattern's target problem count, 0–1. */
  coverage: number;
}

const DAY_MS = 86_400_000;

function daysBetween(from: string, to: string): number {
  return Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / DAY_MS);
}

export function patternStats(state: AppState): PatternStats[] {
  const today = todayISO();
  const byPattern = new Map<string, DsaAttempt[]>();
  for (const a of state.dsa) {
    const list = byPattern.get(a.pattern) ?? [];
    list.push(a);
    byPattern.set(a.pattern, list);
  }

  return DSA_PATTERNS.map((pattern) => {
    const attempts = byPattern.get(pattern.id) ?? [];
    const solved = attempts.filter((a) => a.outcome === 'solved').length;
    const hinted = attempts.filter((a) => a.outcome === 'solved_with_hint').length;
    const failed = attempts.filter((a) => a.outcome === 'failed').length;
    const uniqueProblems = new Set(attempts.map((a) => a.problem.toLowerCase().trim())).size;

    const accuracy = attempts.length === 0 ? 1 : solved / attempts.length;
    const avgMinutes =
      attempts.length === 0
        ? 0
        : Math.round(attempts.reduce((s, a) => s + a.minutes, 0) / attempts.length);

    const dates = attempts.map((a) => a.date).sort();
    const lastPracticed = dates.at(-1);
    const daysSincePractice = lastPracticed ? daysBetween(lastPracticed, today) : 999;

    const coverage = Math.min(1, uniqueProblems / pattern.targetProblems);

    // Weakness combines three independent failure modes: you get it wrong, you
    // have not covered it, or you have not touched it recently. Each is scaled
    // by how often the pattern actually shows up in interviews.
    const inaccuracy = (1 - accuracy) * 45;
    const gap = (1 - coverage) * 35;
    const staleness = Math.min(20, daysSincePractice * 1.4);
    const weight = pattern.weight / 10;
    const weaknessScore = Math.round((inaccuracy + gap + staleness) * weight);

    return {
      pattern,
      attempts: attempts.length,
      solved,
      hinted,
      failed,
      accuracy,
      avgMinutes,
      uniqueProblems,
      lastPracticed,
      daysSincePractice,
      weaknessScore,
      coverage,
    };
  }).sort((a, b) => b.weaknessScore - a.weaknessScore);
}

/** Pattern ids the priority engine should boost. */
export function weakPatternIds(state: AppState, count = 4): string[] {
  return patternStats(state)
    .filter((s) => s.weaknessScore > 25)
    .slice(0, count)
    .map((s) => s.pattern.id);
}

/**
 * One plain sentence explaining why a pattern is flagged, so the
 * recommendation is never an unexplained number.
 */
export function weaknessReason(s: PatternStats): string {
  if (s.attempts === 0) {
    return `Not started. Target is ${s.pattern.targetProblems} problems.`;
  }
  if (s.accuracy < 0.6) {
    const pct = Math.round(s.accuracy * 100);
    return `${pct}% clean solve rate across ${s.attempts} attempts — the pattern is not sticking.`;
  }
  if (s.coverage < 0.5) {
    return `Only ${s.uniqueProblems} of ${s.pattern.targetProblems} problems covered.`;
  }
  if (s.daysSincePractice > 14) {
    return `Not practised in ${s.daysSincePractice} days — retention decays fast.`;
  }
  return 'Holding steady.';
}

export interface DsaTotals {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  solvedClean: number;
  accuracy: number;
  last7: number;
  avgMinutes: number;
}

export function dsaTotals(state: AppState): DsaTotals {
  const all = state.dsa;
  const today = todayISO();
  const last7 = all.filter((a) => daysBetween(a.date, today) < 7).length;
  const solvedClean = all.filter((a) => a.outcome === 'solved').length;

  return {
    total: all.length,
    easy: all.filter((a) => a.difficulty === 'easy').length,
    medium: all.filter((a) => a.difficulty === 'medium').length,
    hard: all.filter((a) => a.difficulty === 'hard').length,
    solvedClean,
    accuracy: all.length === 0 ? 0 : solvedClean / all.length,
    last7,
    avgMinutes:
      all.length === 0 ? 0 : Math.round(all.reduce((s, a) => s + a.minutes, 0) / all.length),
  };
}

/** Consecutive days with at least one logged attempt, counting back from today. */
export function dsaStreak(state: AppState): number {
  const days = new Set(state.dsa.map((a) => a.date));
  let streak = 0;
  const cursor = parseDay(todayISO());
  // Today not being logged yet should not break a live streak, so start the
  // walk at yesterday when today is still empty.
  if (!days.has(todayISO())) cursor.setDate(cursor.getDate() - 1);
  for (;;) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (!days.has(iso)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
