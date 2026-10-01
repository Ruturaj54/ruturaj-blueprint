import type { AppState, Settings } from '@/lib/schema';
import { DEFAULT_SETTINGS } from '@/lib/schema';
import { ROUTINES, type DayType, type EntryKind, type StudyRole } from '@/data/routine';
import type { ProofType } from './types';
import type { DailyPlan } from './planner';
import { weekdayOf, DAY_START_HOUR } from './dates';

/**
 * Turns today's missions into the whole day's timetable.
 *
 * Listing three tasks answers "what". It does not answer "when", which is the
 * question that decides whether the day happens. Every entry of the day's
 * routine is returned — wake, run, care, meals, office, sleep — and the study
 * entries are filled with missions matched to the kind of work they are:
 *
 *   office — watching and reading only; it must never compete with the job.
 *   course — lectures, notes, light implementation.
 *   deep   — implementation, projects, and DSA first.
 *   dsa    — weekends give DSA its own block.
 *   light  — late-evening revision: watching and reading only.
 *
 * Capacity is real. A long module spills from one block into the next rather
 * than being refused, and only what fits nowhere today is reported as
 * continuing tomorrow — it is never silently dropped.
 *
 * Mirrored by netlify/functions/_shared/schedule.mjs. Keep them in step.
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
  id: string;
  label: string;
  kind: EntryKind;
  study?: StudyRole;
  start: string;
  end: string;
  /** Study minutes available. Zero for everything that is not a study block. */
  capacity: number;
  items: SlotItem[];
  used: number;
  note: string;
}

export interface DaySchedule {
  dayType: DayType;
  /** Every entry of the day, in order. */
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

const toHHMM = (minutes: number): string => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** Handles blocks that cross midnight, e.g. 22:00 → 01:00. */
export function blockMinutes(start: string, end: string): number {
  const a = toMinutes(start);
  const b = toMinutes(end);
  return b > a ? b - a : 24 * 60 - a + b;
}

/** "HH:MM", a Settings key, or a key plus a minute offset ("morningRunEnd+30"). */
export function resolveTime(ref: string, settings: Settings): string {
  if (/^\d{1,2}:\d{2}$/.test(ref)) return ref;
  const match = /^([A-Za-z0-9]+)([+-]\d+)?$/.exec(ref);
  if (!match) return '00:00';
  const key = match[1] as keyof Settings;
  const isTime = (v: unknown): v is string => typeof v === 'string' && /^\d{1,2}:\d{2}$/.test(v);
  const raw = settings[key];
  const fallback = DEFAULT_SETTINGS[key];
  const base = isTime(raw) ? raw : isTime(fallback) ? fallback : '00:00';
  return toHHMM(toMinutes(base) + Number(match[2] ?? 0));
}

export function dayTypeOf(iso: string): DayType {
  const dow = weekdayOf(iso);
  return dow === 6 ? 'saturday' : dow === 0 ? 'sunday' : 'weekday';
}

/** Watching and reading are interruptible; building is not. */
const LOW_FOCUS: ProofType[] = ['watch', 'notes'];

/**
 * Where each kind of work may go, in order of preference. New course content
 * goes to the long blocks before the late revision block — on a weekend that
 * block comes after a four-hour ride.
 */
const PLACEMENT: Record<'course' | 'build', StudyRole[]> = {
  course: ['office', 'course', 'deep', 'light'],
  build: ['deep', 'course'],
};

export function buildSchedule(
  state: AppState,
  plan: DailyPlan,
  dayType: DayType = dayTypeOf(plan.ctx.date),
): DaySchedule {
  const s = state.settings;

  const slots: Slot[] = ROUTINES[dayType].map((e) => {
    const start = resolveTime(e.start, s);
    const end = resolveTime(e.end, s);
    const capacity =
      e.study === 'office'
        ? Math.round(s.officeStudyHours * 60)
        : e.study && e.study !== 'review'
          ? blockMinutes(start, end)
          : 0;
    return { id: e.id, label: e.label, kind: e.kind, study: e.study, start, end, capacity, items: [], used: 0, note: e.note };
  });

  // DSA is placed first and always: in its own block on weekends, otherwise at
  // the front of the night block. It is the highest-weight interview item and
  // the first thing that quietly disappears when a day gets busy.
  const dsaHome = slots.find((x) => x.study === 'dsa') ?? slots.find((x) => x.study === 'deep');
  if (dsaHome) {
    const minutes = plan.dsa.target * 25;
    dsaHome.items.push({ id: 'dsa-today', title: plan.dsa.headline, context: 'DSA', minutes, kind: 'dsa' });
    dsaHome.used += minutes;
  }

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

  const overflow = placeAll(pending, slots);
  const study = slots.filter((x) => x.capacity > 0);
  return {
    dayType,
    slots,
    totalPlanned: study.reduce((n, x) => n + x.used, 0),
    totalCapacity: study.reduce((n, x) => n + x.capacity, 0),
    overflow,
  };
}

/** A sliver shorter than this is not a plan, so a long mission skips it. */
const MIN_PIECE_MINUTES = 30;

/**
 * Places each mission into its preferred blocks, splitting it across blocks
 * when one is not enough. Returns whatever is left over, which continues
 * tomorrow.
 */
function placeAll(pending: SlotItem[], slots: Slot[]): SlotItem[] {
  const overflow: SlotItem[] = [];

  for (const item of pending) {
    const order = PLACEMENT[item.kind === 'course' ? 'course' : 'build'].flatMap((role) =>
      slots.filter((x) => x.study === role && x.capacity > 0),
    );
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

/**
 * Minutes on the mission day's own clock: the day starts at 04:00, so 01:00
 * sorts after 23:00 rather than before 07:00.
 */
export function dayClock(hhmm: string): number {
  const m = toMinutes(hhmm);
  return m < DAY_START_HOUR * 60 ? m + 1440 : m;
}

/** The entry happening at `hhmm`, or null between entries. */
export function slotAt(slots: Slot[], hhmm: string): Slot | null {
  const now = dayClock(hhmm);
  for (const slot of slots) {
    const a = dayClock(slot.start);
    let b = dayClock(slot.end);
    if (b <= a) b += 1440;
    // Sleep runs past the 04:00 boundary, so check the clock a day later too.
    if ((now >= a && now < b) || (now + 1440 >= a && now + 1440 < b)) return slot;
  }
  return null;
}

/** The first entry that has not started yet at `hhmm`. */
export function nextSlot(slots: Slot[], hhmm: string): Slot | null {
  const now = dayClock(hhmm);
  return slots.find((x) => dayClock(x.start) > now) ?? null;
}

export function formatRange(slot: Pick<Slot, 'start' | 'end'>): string {
  return `${slot.start} – ${slot.end}`;
}

export function formatHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
