import type { AppState } from '@/lib/schema';
import { dayContext, type DayContext } from './mission';
import { gateStatus } from './foundation';
import { rankTasks, type ScoredTask } from './priority';
import { weakPatternIds, patternStats } from './dsa';
import { isBehindSchedule } from './scoring';
import { FOUNDATION_SUBJECTS, SEQUENTIAL_TIERS } from '@/data/foundation';
import { currentDay, addDays } from './dates';
import type { FoundationMilestone, FoundationSubject, FoundationTier } from './types';

export { dayScore, dayExtras, plannedHits, executionStreak, isBehindSchedule } from './scoring';

/**
 * Turns state into "what should Ruturaj do today".
 *
 * Before the Foundation Gate opens this walks his courses in order; after it
 * opens the priority engine takes over. Either way the answer is three things,
 * and anything planned on an earlier day but not finished comes first — missed
 * work carries forward instead of silently dropping off the list.
 */

export interface FoundationMission {
  kind: 'foundation';
  subject: FoundationSubject;
  milestone: FoundationMilestone;
  /** Date this was originally planned on, when it is carried over unfinished. */
  carriedFrom?: string;
}

export interface TaskMission {
  kind: 'task';
  scored: ScoredTask;
  carriedFrom?: string;
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
  /** How many of today's missions are carried over from an earlier day. */
  carriedCount: number;
}

const MISSIONS_PER_DAY = 3;
/** How far back an unfinished plan still counts as carried over. */
const CARRY_LOOKBACK_DAYS = 7;

function isDone(state: AppState, id: string): boolean {
  const task = state.tasks[id]?.status;
  return Boolean(state.foundation[id]) || task === 'done' || task === 'skipped';
}

/**
 * Items planned on an earlier day and still open, mapped to the most recent
 * date they were planned for. This is what makes missed work reappear first.
 */
export function carriedOver(state: AppState, date: string): Map<string, string> {
  const out = new Map<string, string>();
  for (let i = 1; i <= CARRY_LOOKBACK_DAYS; i += 1) {
    const d = addDays(date, -i);
    const log = state.days[d];
    if (!log) continue;
    for (const id of log.planned) {
      if (!out.has(id) && !isDone(state, id)) out.set(id, d);
    }
  }
  return out;
}

type Slot = { subject: FoundationSubject; milestone: FoundationMilestone };

/**
 * Open mandatory milestones for one tier. Courses (tiers 1–2) come back in
 * module order — module 12 assumes module 11. Practice (tier 3) is
 * interleaved across subjects so C, C++, LB, DSA and LSP all move together.
 */
function openInTier(state: AppState, tier: FoundationTier): Slot[] {
  const subjects = FOUNDATION_SUBJECTS.filter((s) => s.tier === tier);
  const queues = subjects.map((subject) =>
    subject.milestones
      .filter((m) => m.mandatory && !state.foundation[m.id])
      .map((milestone) => ({ subject, milestone })),
  );
  if (SEQUENTIAL_TIERS.has(tier)) return queues.flat();

  const out: Slot[] = [];
  const longest = Math.max(0, ...queues.map((q) => q.length));
  for (let i = 0; i < longest; i += 1) {
    for (const q of queues) {
      const slot = q[i];
      if (slot) out.push(slot);
    }
  }
  return out;
}

function nextFoundationMissions(state: AppState, date: string): FoundationMission[] {
  const carried = carriedOver(state, date);
  const out: FoundationMission[] = [];
  const seen = new Set<string>();
  const take = ({ subject, milestone }: Slot) => {
    if (out.length >= MISSIONS_PER_DAY || seen.has(milestone.id)) return;
    seen.add(milestone.id);
    out.push({ kind: 'foundation', subject, milestone, carriedFrom: carried.get(milestone.id) });
  };

  const everything: Slot[] = FOUNDATION_SUBJECTS.flatMap((subject) =>
    subject.milestones.map((milestone) => ({ subject, milestone })),
  );

  // 1. Unfinished work from earlier days, in course order.
  for (const s of everything) {
    if (carried.has(s.milestone.id) && !state.foundation[s.milestone.id]) take(s);
  }
  // 2. Next in priority order. Flattening the tiers means a nearly finished
  //    tier tops up from the next one instead of leaving the day half empty —
  //    the "can be mixed" case.
  for (const tier of [1, 2, 3] as const) openInTier(state, tier).forEach(take);
  // 3. Every mandatory milestone is done: optional work, any tier.
  for (const s of everything) if (!state.foundation[s.milestone.id]) take(s);

  return out;
}

function nextTaskMissions(state: AppState, ctx: DayContext): TaskMission[] {
  const carried = carriedOver(state, ctx.date);
  const ranked = rankTasks({
    state,
    phase: ctx.phase,
    weakPatterns: weakPatternIds(state),
    behindSchedule: isBehindSchedule(state),
  });
  const ordered = [
    ...ranked.filter((s) => carried.has(s.task.id)),
    ...ranked.filter((s) => !carried.has(s.task.id)),
  ];
  return ordered
    .slice(0, MISSIONS_PER_DAY)
    .map((scored) => ({ kind: 'task', scored, carriedFrom: carried.get(scored.task.id) }));
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
  const gateOpen = gateStatus(state).unlocked;

  const missions: Mission[] = gateOpen
    ? nextTaskMissions(state, ctx)
    : nextFoundationMissions(state, ctx.date);

  const plannedIds = missions.map((m) =>
    m.kind === 'foundation' ? m.milestone.id : m.scored.task.id,
  );

  return {
    ctx,
    gateOpen,
    missions,
    dsa: buildDsaMission(state, ctx),
    completedToday: state.days[ctx.date]?.completed ?? [],
    plannedIds,
    estimatedMinutes: missions.reduce(
      (sum, m) =>
        sum + (m.kind === 'task' ? m.scored.task.estMinutes : m.milestone.estMinutes),
      0,
    ),
    carriedCount: missions.filter((m) => m.carriedFrom).length,
  };
}
