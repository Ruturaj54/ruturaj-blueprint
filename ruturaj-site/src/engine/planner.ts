import type { AppState } from '@/lib/schema';
import { dayContext, type DayContext } from './mission';
import { gateStatus } from './foundation';
import { nextUp, type ScoredTask } from './priority';
import { weakPatternIds, patternStats } from './dsa';
import { FOUNDATION_SUBJECTS } from '@/data/foundation';
import { currentDay, todayISO, addDays } from './dates';
import type { FoundationMilestone, FoundationSubject } from './types';

/**
 * Turns state into "what should Ruturaj do today".
 *
 * Before the Foundation Gate opens this walks the eight foundation subjects in
 * order; after it opens the priority engine takes over. Either way the answer
 * is at most three things, because a list of thirty is the same as no list.
 */

export interface FoundationMission {
  kind: 'foundation';
  subject: FoundationSubject;
  milestone: FoundationMilestone;
}

export interface TaskMission {
  kind: 'task';
  scored: ScoredTask;
}

export type Mission = FoundationMission | TaskMission;

export interface DsaMission {
  headline: string;
  pattern?: string;
  note: string;
  target: number;
}

export interface DailyPlan {
  ctx: DayContext;
  gateOpen: boolean;
  missions: Mission[];
  dsa: DsaMission;
  /** Already done today, for the planned-vs-actual view. */
  completedToday: string[];
  plannedIds: string[];
  estimatedMinutes: number;
}

/**
 * Walks the subjects in Ruturaj's stated priority order — Apna College, then
 * Five Minute Engineering, then his own PPA/LB/LSP/DSA practice.
 *
 * Within a tier it round-robins so one subject cannot starve the rest, and it
 * only drops to the next tier once the current one has no mandatory work left.
 * Optional milestones are picked up last, across all tiers — that is the
 * "can be mixed" case: nothing sits idle if the priority tier is exhausted.
 */
function nextFoundationMissions(state: AppState, count: number): FoundationMission[] {
  const out: FoundationMission[] = [];
  const open = (m: { id: string }) => !state.foundation[m.id];

  for (const tier of [1, 2, 3] as const) {
    const subjects = FOUNDATION_SUBJECTS.filter((s) => s.tier === tier);
    for (const subject of subjects) {
      if (out.length >= count) return out;
      const next = subject.milestones.find((m) => open(m) && m.mandatory);
      if (next && !out.some((o) => o.milestone.id === next.id)) {
        out.push({ kind: 'foundation', subject, milestone: next });
      }
    }
    // Only move to the next tier once this one has nothing mandatory left.
    if (out.length > 0) return out;
  }

  // Everything mandatory is done — fall back to optional work, any tier.
  for (const subject of FOUNDATION_SUBJECTS) {
    if (out.length >= count) return out;
    const next = subject.milestones.find(open);
    if (next && !out.some((o) => o.milestone.id === next.id)) {
      out.push({ kind: 'foundation', subject, milestone: next });
    }
  }
  return out;
}

function buildDsaMission(state: AppState, ctx: DayContext): DsaMission {
  const target = state.settings.dsaTargetPerDay;

  if (ctx.isSunday) {
    return {
      headline: 'Weekly timed set',
      note: 'Three problems under time, no hints. Log your solve times — that number is the one that matters.',
      target: 3,
    };
  }

  const weak = weakPatternIds(state, 1);
  if (weak.length > 0) {
    const stats = patternStats(state).find((s) => s.pattern.id === weak[0]);
    if (stats) {
      return {
        headline: `${stats.pattern.name} — ${target} problems`,
        pattern: stats.pattern.id,
        note: `Flagged as your weakest pattern. ${stats.uniqueProblems} of ${stats.pattern.targetProblems} covered so far.`,
        target,
      };
    }
  }

  return {
    headline: `${target} problems, pattern-tagged`,
    note: 'Then re-solve one older problem cold. Retention is the metric, not the running total.',
    target,
  };
}

export function buildPlan(state: AppState, day: number = currentDay()): DailyPlan {
  const ctx = dayContext(day);
  const gate = gateStatus(state);
  const gateOpen = gate.unlocked;
  const date = ctx.date;

  let missions: Mission[];
  if (!gateOpen) {
    missions = nextFoundationMissions(state, 3);
  } else {
    missions = nextUp(
      {
        state,
        phase: ctx.phase,
        weakPatterns: weakPatternIds(state),
        behindSchedule: isBehindSchedule(state),
      },
      3,
    ).map((scored) => ({ kind: 'task', scored }));
  }

  const log = state.days[date];
  const plannedIds = missions.map((m) =>
    m.kind === 'foundation' ? m.milestone.id : m.scored.task.id,
  );

  const estimatedMinutes = missions.reduce(
    (sum, m) =>
      sum + (m.kind === 'task' ? m.scored.task.estMinutes : m.milestone.estMinutes),
    0,
  );

  return {
    ctx,
    gateOpen,
    missions,
    dsa: buildDsaMission(state, ctx),
    completedToday: log?.completed ?? [],
    plannedIds,
    estimatedMinutes,
  };
}

/**
 * Behind schedule = fewer than half the planned items closed across the last
 * seven logged days. Drives automatic shedding of P2/P3 work.
 */
export function isBehindSchedule(state: AppState): boolean {
  const today = todayISO();
  let planned = 0;
  let completed = 0;
  for (let i = 1; i <= 7; i += 1) {
    const log = state.days[addDays(today, -i)];
    if (!log) continue;
    planned += log.planned.length;
    completed += log.completed.length;
  }
  if (planned < 5) return false; // too little history to judge
  return completed / planned < 0.5;
}

/** Daily score, 0–100: what was closed against what was planned. */
export function dayScore(state: AppState, date: string): number | undefined {
  const log = state.days[date];
  if (!log || log.planned.length === 0) return undefined;
  return Math.round((log.completed.length / log.planned.length) * 100);
}

/** Consecutive days scoring 50 or better, counting back from yesterday. */
export function executionStreak(state: AppState): number {
  let streak = 0;
  const today = todayISO();
  for (let i = 0; i < 365; i += 1) {
    const date = addDays(today, -i);
    const score = dayScore(state, date);
    if (score === undefined) {
      if (i === 0) continue; // today may not be scored yet
      break;
    }
    if (score < 50) break;
    streak += 1;
  }
  return streak;
}
