import type { AppState } from '@/lib/schema';
import type { FoundationMilestone, FoundationSubject } from './types';
import { APNA_SUBJECTS } from '@/data/foundation';
import { programInfo } from './program';
import { daysBetween } from './dates';
import { daySlots, dayTypeOf, roleCapacity, type SlotItem } from './schedule';
import { exerciseSlotFor } from './fitness';

/**
 * The parallel lecture: while surprise prep is the daily programme, the
 * after-dinner lecture block holds the next Apna College module in course
 * order, one module per lecture block. Ticking it is the same act as ticking
 * that module on the Roadmap (`state.foundation`), so nothing is counted twice
 * and the course carries straight on when the general roadmap starts.
 *
 * It pauses when an interview is ten days away or less: then every block
 * belongs to prep, which is the tracker's own advice.
 */

const INTERVIEW_FOCUS_DAYS = 10;

export interface LectureModule {
  subject: FoundationSubject;
  milestone: FoundationMilestone;
}

/** True when tonight's lecture block holds an Apna module rather than prep. */
export function lectureActive(state: AppState, date: string): boolean {
  if (!state.settings.parallelLecture) return false;
  const info = programInfo(state, date);
  if (info.started && info.phase !== 'amazon') return false;
  const interview = state.amazon.interviewDate;
  if (interview) {
    const days = daysBetween(date, interview);
    if (days >= 0 && days <= INTERVIEW_FOCUS_DAYS) return false;
  }
  return true;
}

/** Apna College modules not yet ticked, mandatory first, in course order. */
export function openApnaModules(state: AppState): LectureModule[] {
  const all = APNA_SUBJECTS.flatMap((subject) => subject.milestones.map((milestone) => ({ subject, milestone })));
  const open = all.filter((m) => !state.foundation[m.milestone.id]);
  return [...open.filter((m) => m.milestone.mandatory), ...open.filter((m) => !m.milestone.mandatory)];
}

/** Minutes the lecture blocks hold on a date (0 when the lecture is not active). */
export function lectureMinutes(state: AppState, date: string): number {
  if (!lectureActive(state, date)) return 0;
  return roleCapacity(state.settings, dayTypeOf(date), 'lecture', exerciseSlotFor(state, date));
}

/**
 * The modules for the date's lecture blocks: the next one in course order per
 * block, its minutes capped at the block. A 90-minute module in a 75-minute
 * block is tonight's lecture all the same; it stays open until it is ticked.
 */
export function lecturePlan(state: AppState, date: string): Array<LectureModule & { minutes: number }> {
  if (!lectureActive(state, date)) return [];
  const blocks = daySlots(state.settings, dayTypeOf(date), exerciseSlotFor(state, date)).filter(
    (s) => s.study === 'lecture' && s.capacity > 0,
  );
  const open = openApnaModules(state);
  return blocks
    .map((block, i) => {
      const next = open[i];
      return next ? { ...next, minutes: Math.min(next.milestone.estMinutes, block.capacity) } : null;
    })
    .filter((x): x is LectureModule & { minutes: number } => x !== null);
}

export function lectureSlotItems(plan: ReturnType<typeof lecturePlan>): SlotItem[] {
  return plan.map((m) => ({
    id: m.milestone.id,
    title: m.milestone.title,
    context: 'Apna College',
    minutes: m.minutes,
    kind: 'lecture',
  }));
}

/** Ticks or unticks a module from the lecture card. Apply inside storage.update. */
export function toggleLecture(draft: AppState, id: string, done: boolean, date: string, plannedIds: string[]): void {
  if (done) draft.foundation[id] = true;
  else delete draft.foundation[id];
  const log = (draft.days[date] ??= { planned: plannedIds, completed: [] });
  const set = new Set(log.completed);
  if (done) set.add(id);
  else set.delete(id);
  log.completed = [...set];
}
