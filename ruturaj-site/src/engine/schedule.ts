import type { Settings } from '@/lib/schema';
import { DEFAULT_SETTINGS } from '@/lib/schema';
import { ROUTINES, type DayType, type EntryKind, type StudyRole, type Condition } from '@/data/routine';
import { weekdayOf, DAY_START_HOUR } from './dates';

/**
 * Turns the day's work into the whole day's timetable.
 *
 * Every entry of the routine is returned (wake, exercise, office, meals,
 * sleep) and the study entries are filled with the day's items in order:
 * block 1, then block 2, then the optional final block. Capacity is real; a
 * long item spills into the next block, and only what fits nowhere today is
 * reported as continuing tomorrow. It is never silently dropped.
 */

export type ExerciseSlot = 'morning' | 'evening' | 'rest';

export type ItemKind = 'amazon' | 'revision' | 'course' | 'build' | 'dsa';

export interface SlotItem {
  id: string;
  title: string;
  context: string;
  minutes: number;
  kind: ItemKind;
  totalMinutes?: number;
  partial?: boolean;
  carried?: boolean;
}

export interface Slot {
  id: string;
  label: string;
  kind: EntryKind;
  study?: StudyRole;
  start: string;
  end: string;
  capacity: number;
  items: SlotItem[];
  used: number;
  note: string;
}

export interface DaySchedule {
  dayType: DayType;
  slots: Slot[];
  totalPlanned: number;
  totalCapacity: number;
  overflow: SlotItem[];
}

const HHMM = /^\d{1,2}:\d{2}$/;

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

const toHHMM = (minutes: number): string => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** Handles blocks that cross midnight, e.g. 23:30 → 01:00. */
export function blockMinutes(start: string, end: string): number {
  const a = toMinutes(start);
  const b = toMinutes(end);
  if (b === a) return 0;
  if (b > a) return b - a;
  // Crossing midnight (23:30 -> 01:00, sleep). An inverted pair from a bad
  // setting (20:30 -> 20:00) would read as 23.5 h, so over 14 h counts as empty.
  const wrapped = 24 * 60 - a + b;
  return wrapped > 14 * 60 ? 0 : wrapped;
}

/** "HH:MM", a Settings key, or a key plus a minute offset ("walkEnd+30"). */
export function resolveTime(ref: string, settings: Settings): string {
  if (HHMM.test(ref)) return ref;
  const match = /^([A-Za-z0-9]+)([+-]\d+)?$/.exec(ref);
  if (!match) return '00:00';
  const key = match[1] as keyof Settings;
  const isTime = (v: unknown): v is string => typeof v === 'string' && HHMM.test(v);
  const raw = settings[key];
  const fallback = DEFAULT_SETTINGS[key];
  const base = isTime(raw) ? raw : isTime(fallback) ? fallback : '00:00';
  return toHHMM(toMinutes(base) + Number(match[2] ?? 0));
}

export function dayTypeOf(iso: string): DayType {
  const dow = weekdayOf(iso);
  return dow === 6 ? 'saturday' : dow === 0 ? 'sunday' : 'weekday';
}

function conditionHolds(when: Condition | undefined, exercise: ExerciseSlot, block3: boolean): boolean {
  switch (when) {
    case undefined: return true;
    case 'am-run': return exercise === 'morning';
    case 'am-norun': return exercise !== 'morning';
    case 'pm-run': return exercise === 'evening';
    case 'pm-norun': return exercise !== 'evening';
    case 'block3': return block3;
    case 'noblock3': return !block3;
  }
}

/** The day's entries after conditions, with their study capacity in minutes. */
export function daySlots(settings: Settings, dayType: DayType, exercise: ExerciseSlot = settings.exerciseSlot): Slot[] {
  return ROUTINES[dayType]
    .filter((e) => conditionHolds(e.when, exercise, settings.studyBlock3Enabled))
    .map((e) => {
      const start = resolveTime(e.start, settings);
      const end = resolveTime(e.end, settings);
      const capacity =
        e.study === 'office'
          ? Math.round(settings.officeStudyHours * 60)
          : e.study && e.study !== 'review'
            ? blockMinutes(start, end)
            : 0;
      return { id: e.id, label: e.label, kind: e.kind, study: e.study, start, end, capacity, items: [], used: 0, note: e.note };
    });
}

/** Study minutes available on a day of this type. Office spare time is excluded. */
export function studyCapacity(settings: Settings, dayType: DayType, exercise: ExerciseSlot = settings.exerciseSlot): number {
  return daySlots(settings, dayType, exercise)
    .filter((s) => s.capacity > 0 && s.study !== 'office')
    .reduce((n, s) => n + s.capacity, 0);
}

/** Where each kind of work may go, in order of preference. */
const PLACEMENT: Record<ItemKind, StudyRole[]> = {
  amazon: ['course', 'deep', 'dsa', 'light'],
  revision: ['course', 'deep', 'dsa', 'light'],
  course: ['office', 'course', 'deep', 'light'],
  build: ['deep', 'course', 'light'],
  dsa: ['dsa', 'deep', 'course'],
};

/** A sliver shorter than this is not a plan, so a long item skips it. */
const MIN_PIECE_MINUTES = 20;

export function buildSchedule(
  settings: Settings,
  items: SlotItem[],
  dayType: DayType,
  exercise: ExerciseSlot = settings.exerciseSlot,
): DaySchedule {
  const slots = daySlots(settings, dayType, exercise);
  const overflow: SlotItem[] = [];

  for (const item of items) {
    const order = PLACEMENT[item.kind].flatMap((role) => slots.filter((x) => x.study === role && x.capacity > 0));
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
    for (const { slot, minutes } of pieces) slot.items.push({ ...item, minutes, totalMinutes: item.minutes, partial: split });
    if (remaining > 0) overflow.push({ ...item, minutes: remaining, totalMinutes: item.minutes, partial: true });
  }

  const study = slots.filter((x) => x.capacity > 0);
  return {
    dayType,
    slots,
    totalPlanned: study.reduce((n, x) => n + x.used, 0),
    totalCapacity: study.reduce((n, x) => n + x.capacity, 0),
    overflow,
  };
}

/** Minutes on the mission day's own clock: 01:00 sorts after 23:00. */
export function dayClock(hhmm: string): number {
  const m = toMinutes(hhmm);
  return m < DAY_START_HOUR * 60 ? m + 1440 : m;
}

/** The entry happening at `hhmm`, or null between entries. */
export function slotAt(slots: Slot[], hhmm: string): Slot | null {
  const now = dayClock(hhmm);
  for (const slot of slots) {
    if (blockMinutes(slot.start, slot.end) === 0) continue;
    const a = dayClock(slot.start);
    let b = dayClock(slot.end);
    if (b <= a) b += 1440;
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

/** Hours of sleep the weekday settings allow. */
export function weekdaySleepHours(settings: Settings): number {
  const end = settings.studyBlock3Enabled ? settings.studyBlock3End : settings.walkEnd;
  return Math.round((blockMinutes(end, settings.wakeTime) / 60) * 10) / 10;
}
