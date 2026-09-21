import type { Task, Priority } from './types';
import type { AppState } from '@/lib/schema';
import { ALL_TASKS, taskById } from '@/data/tasks';
import type { MissionPhase } from './types';

/**
 * §23 — the priority engine.
 *
 * Turns ~106 candidate tasks into a ranked shortlist so the app can answer one
 * question well: what is the highest-value thing to do next. Showing everything
 * is what the old app did, and it is why a 300-item checklist gets ignored.
 *
 * Every component is additive and named, so the UI can show *why* something
 * ranked where it did rather than presenting an unexplained number.
 */

export interface ScoreReason {
  label: string;
  points: number;
}

export interface ScoredTask {
  task: Task;
  score: number;
  reasons: ScoreReason[];
  blocked: boolean;
  blockedBy: string[];
}

export interface ScoreContext {
  state: AppState;
  phase: MissionPhase;
  /** DSA pattern ids currently scoring badly. */
  weakPatterns: string[];
  /** True when the last 7 days fell short of target — sheds P2/P3. */
  behindSchedule: boolean;
}

const PRIORITY_BONUS: Record<Priority, number> = {
  P0: 45,
  P1: 25,
  P2: 8,
  P3: 0,
};

/** Interview work matters more as the loops get closer. */
const INTERVIEW_WEIGHT_BY_PHASE: Record<MissionPhase['id'], number> = {
  m1: 5,
  m2: 10,
  m3: 20,
  m4: 25,
};

/** Portfolio work has to happen early enough to actually finish. */
const PORTFOLIO_WEIGHT_BY_PHASE: Record<MissionPhase['id'], number> = {
  m1: 0,
  m2: 15,
  m3: 15,
  m4: 5,
};

function unmetPrereqs(task: Task, state: AppState): string[] {
  if (!task.prereqs?.length) return [];
  return task.prereqs.filter((id) => state.tasks[id]?.status !== 'done');
}

export function scoreTask(task: Task, ctx: ScoreContext): ScoredTask {
  const reasons: ScoreReason[] = [];
  const blockedBy = unmetPrereqs(task, ctx.state);
  const status = ctx.state.tasks[task.id]?.status ?? 'todo';

  const add = (label: string, points: number) => {
    if (points !== 0) reasons.push({ label, points });
  };

  // Career value is the backbone of the score.
  add('Career value', task.careerValue * 8);
  add(`Priority ${task.priority}`, PRIORITY_BONUS[task.priority]);

  if (task.interviewCritical) {
    add('Interview-critical', INTERVIEW_WEIGHT_BY_PHASE[ctx.phase.id]);
  }
  if (task.portfolioCritical) {
    add('Portfolio-critical', PORTFOLIO_WEIGHT_BY_PHASE[ctx.phase.id]);
  }

  // Finishing beats starting. A half-done task is the cheapest win available.
  if (status === 'in_progress') add('Already in progress', 18);

  // A weak DSA pattern outranks a fresh one — this is the weakness engine
  // reaching into scheduling rather than just reporting.
  if (task.track === 'dsa') {
    const hit = ctx.weakPatterns.find((p) => task.id.includes(`dsa-${p}-`));
    if (hit) add('Weak pattern — needs work', 30);
  }

  // Long tasks are not worse, but on a 161-day budget they must justify
  // themselves. Roughly one point per 20 minutes.
  add('Time cost', -Math.round(task.estMinutes / 20));

  // §4 — shed optional work automatically when the week has gone badly.
  if (ctx.behindSchedule) {
    if (task.priority === 'P2') add('Behind schedule — deprioritised', -25);
    if (task.priority === 'P3') add('Behind schedule — shed', -60);
  }

  const score = reasons.reduce((sum, r) => sum + r.points, 0);

  return {
    task,
    score,
    reasons,
    blocked: blockedBy.length > 0,
    blockedBy,
  };
}

/** Everything still open, ranked. Completed and blocked work is excluded. */
export function rankTasks(ctx: ScoreContext): ScoredTask[] {
  return ALL_TASKS.filter((t) => {
    const status = ctx.state.tasks[t.id]?.status;
    return status !== 'done' && status !== 'skipped';
  })
    .map((t) => scoreTask(t, ctx))
    .filter((s) => !s.blocked)
    .sort((a, b) => b.score - a.score);
}

/** §23 — the top 1–3 only. More than three is a list, not a decision. */
export function nextUp(ctx: ScoreContext, count = 3): ScoredTask[] {
  return rankTasks(ctx).slice(0, count);
}

/** Blocked work, with the prerequisite titles resolved for display. */
export function blockedTasks(ctx: ScoreContext): Array<ScoredTask & { blockedByTitles: string[] }> {
  return ALL_TASKS.filter((t) => ctx.state.tasks[t.id]?.status !== 'done')
    .map((t) => scoreTask(t, ctx))
    .filter((s) => s.blocked)
    .map((s) => ({
      ...s,
      blockedByTitles: s.blockedBy.map((id) => taskById(id)?.title ?? id),
    }))
    .sort((a, b) => b.score - a.score);
}

/** Completion by track, for the readiness dashboard. */
export function trackCompletion(state: AppState): Record<string, { done: number; total: number }> {
  const out: Record<string, { done: number; total: number }> = {};
  for (const t of ALL_TASKS) {
    const bucket = (out[t.track] ??= { done: 0, total: 0 });
    bucket.total += 1;
    if (state.tasks[t.id]?.status === 'done') bucket.done += 1;
  }
  return out;
}
