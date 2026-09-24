import type { AppState } from '@/lib/schema';
import type { ProofType } from './types';
import type { DailyPlan } from './planner';

/**
 * Turns today's missions into an actual timetable.
 *
 * Listing three tasks answers "what". It does not answer "when", which is the
 * question that decides whether the day happens. This places each mission into
 * one of the configured blocks, matched to the kind of work it is:
 *
 *   Office spare time — watching and reading only. Low-focus, interruptible,
 *     and it must never compete with the actual job.
 *   Block 1 (evening) — course work: lectures, notes, light implementation.
 *   Block 2 (night)   — deep work: implementation, projects, DSA.
 *
 * Capacity is real. A long module spills from one block into the next rather
 * than being refused, and only what fits nowhere today is reported as
 * continuing tomorrow — it is never silently dropped.
 */

export interface SlotItem {
  id: string;
  title: string;
  context: string;
  /** Minutes placed in this block. */
  minutes: number;
  kind: 'course' | 'build' | 'dsa';
  /** Full length of the mission, when it is split across blocks or days. */
  totalMinutes?: number;
  /** True when this is one piece of a longer mission. */
  partial?: boolean;
  /** Carried over unfinished from an earlier day. */
  carried?: boolean;
}

export interface Slot {
  id: 'office' | 'block1' | 'run' | 'block2';
  label: string;
  start: string;
  end: string;
  capacity: number;
  items: SlotItem[];
  used: number;
  note?: string;
}

export interface DaySchedule {
  slots: Slot[];
  totalPlanned: number;
  totalCapacity: number;
  /** Work that does not fit in today's blocks and continues tomorrow. */
  overflow: SlotItem[];
}

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** Handles blocks that cross midnight, e.g. 22:00 → 02:00. */
export function blockMinutes(start: string, end: string): number {
  const a = toMinutes(start);
  const b = toMinutes(end);
  return b > a ? b - a : 24 * 60 - a + b;
}

/** Watching and reading are interruptible; building is not. */
const LOW_FOCUS: ProofType[] = ['watch', 'notes'];

export function buildSchedule(state: AppState, plan: DailyPlan): DaySchedule {
  const s = state.settings;

  const office: Slot = {
    id: 'office',
    label: 'Office — spare capacity',
    start: s.officeStart,
    end: s.officeEnd,
    capacity: Math.round(s.officeStudyHours * 60),
    items: [],
    used: 0,
    note: 'Only if the actual work is covered. Watching and reading, nothing that needs a long run-up.',
  };

  const block1: Slot = {
    id: 'block1',
    label: 'Block 1 — course',
    start: s.studyBlock1Start,
    end: s.studyBlock1End,
    capacity: blockMinutes(s.studyBlock1Start, s.studyBlock1End),
    items: [],
    used: 0,
  };

  const run: Slot = {
    id: 'run',
    label: 'Evening run + dinner',
    start: s.eveningRunTime,
    end: s.studyBlock2Start,
    capacity: blockMinutes(s.eveningRunTime, s.studyBlock2Start),
    items: [],
    used: 0,
    note: 'Protected. This is recovery, not slack to be raided when the day runs late.',
  };

  const block2: Slot = {
    id: 'block2',
    label: 'Block 2 — deep work',
    start: s.studyBlock2Start,
    end: s.studyBlock2End,
    capacity: blockMinutes(s.studyBlock2Start, s.studyBlock2End),
    items: [],
    used: 0,
  };

  // DSA is placed first and always, at the front of the night block. It is the
  // highest-weight interview item and the first thing that quietly disappears
  // when a day gets busy.
  const dsaMinutes = plan.dsa.target * 25;
  const dsaItem: SlotItem = {
    id: 'dsa-today',
    title: plan.dsa.headline,
    context: 'DSA',
    minutes: dsaMinutes,
    kind: 'dsa',
  };
  block2.items.push(dsaItem);
  block2.used += dsaMinutes;

  const pending: SlotItem[] = plan.missions.map((m) =>
    m.kind === 'foundation'
      ? {
          id: m.milestone.id,
          title: m.milestone.title,
          context: m.subject.name,
          minutes: m.milestone.estMinutes,
          kind: LOW_FOCUS.includes(m.milestone.proof) ? 'course' : 'build',
          carried: Boolean(m.carriedFrom),
        }
      : {
          id: m.scored.task.id,
          title: m.scored.task.title,
          context: m.scored.task.track,
          minutes: m.scored.task.estMinutes,
          kind: LOW_FOCUS.includes(m.scored.task.proof) ? 'course' : 'build',
          carried: Boolean(m.carriedFrom),
        },
  );

  const overflow = placeAll(pending, { office, block1, block2 });

  const slots = [office, block1, run, block2];
  return {
    slots,
    totalPlanned: slots.reduce((n, x) => n + x.used, 0),
    totalCapacity: slots.filter((x) => x.id !== 'run').reduce((n, x) => n + x.capacity, 0),
    overflow,
  };
}

/** A sliver shorter than this is not a plan, so a long mission skips it. */
const MIN_PIECE_MINUTES = 30;

/**
 * Places each mission into its preferred blocks, splitting it across blocks
 * when one is not enough. Watching and reading prefer office spare time;
 * building needs the long evening and night runs and never goes to the office.
 * Returns whatever is left over, which continues tomorrow.
 */
function placeAll(
  pending: SlotItem[],
  { office, block1, block2 }: { office: Slot; block1: Slot; block2: Slot },
): SlotItem[] {
  const overflow: SlotItem[] = [];

  for (const item of pending) {
    const order = item.kind === 'course' ? [office, block1, block2] : [block2, block1];
    let remaining = item.minutes;
    const pieces: Array<{ slot: Slot; minutes: number }> = [];

    for (const slot of order) {
      if (remaining <= 0) break;
      const take = Math.min(slot.capacity - slot.used, remaining);
      if (take <= 0 || (take < MIN_PIECE_MINUTES && take < remaining)) continue;
      pieces.push({ slot, minutes: take });
      slot.used += take;
      remaining -= take;
    }

    const split = pieces.length > 1 || remaining > 0;
    for (const { slot, minutes } of pieces) {
      slot.items.push({ ...item, minutes, totalMinutes: item.minutes, partial: split });
    }
    if (remaining > 0) {
      overflow.push({ ...item, minutes: remaining, totalMinutes: item.minutes, partial: true });
    }
  }

  return overflow;
}

export function formatRange(slot: Slot): string {
  return `${slot.start} – ${slot.end}`;
}

export function formatHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
