/**
 * All mission dates are IST-local calendar dates in `YYYY-MM-DD` form.
 *
 * Every parse goes through `parseDay`, which pins the clock to midday. Parsing a
 * bare `YYYY-MM-DD` with `new Date()` treats it as UTC, which lands on the
 * previous calendar day for anyone east of Greenwich — the exact class of bug
 * that made the old app's day counter drift.
 */

export const MISSION_START = '2026-09-24';
export const MISSION_END = '2027-03-03';
export const TOTAL_DAYS = 161;

const MS_PER_DAY = 86_400_000;

export function parseDay(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Hour at which a new mission day begins. Not midnight: the deep-work block
 * runs 22:00–02:00, so a DSA problem solved at 01:15 belongs to the day it was
 * planned in, not the next one. With a midnight boundary, half of every night
 * block landed on the wrong day and the end-of-day mail could never see it.
 */
export const DAY_START_HOUR = 4;

/** Today's mission date — local time, with the day rolling over at 04:00. */
export function todayISO(): string {
  return formatISO(new Date(Date.now() - DAY_START_HOUR * 3_600_000));
}

/** Calendar date for mission day `n` (1-indexed). */
export function dateForDay(n: number): string {
  const d = parseDay(MISSION_START);
  d.setDate(d.getDate() + (n - 1));
  return formatISO(d);
}

/** Mission day number for a calendar date. May fall outside 1..TOTAL_DAYS. */
export function dayForDate(iso: string): number {
  const start = parseDay(MISSION_START);
  const target = parseDay(iso);
  return Math.round((target.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

/** Today's mission day, clamped into the mission window. */
export function currentDay(): number {
  return clampDay(dayForDate(todayISO()));
}

export function clampDay(n: number): number {
  if (n < 1) return 1;
  if (n > TOTAL_DAYS) return TOTAL_DAYS;
  return n;
}

/** Days left until the interview deadline, floored at zero. */
export function daysRemaining(from: number = currentDay()): number {
  return Math.max(0, TOTAL_DAYS - from);
}

export function addDays(iso: string, delta: number): string {
  const d = parseDay(iso);
  d.setDate(d.getDate() + delta);
  return formatISO(d);
}

/** 0 = Sunday. */
export function weekdayOf(iso: string): number {
  return parseDay(iso).getDay();
}

export function isSunday(iso: string): boolean {
  return weekdayOf(iso) === 0;
}

export function isWeekend(iso: string): boolean {
  const d = weekdayOf(iso);
  return d === 0 || d === 6;
}

/** Mission week number, 1-indexed. */
export function weekOfDay(n: number): number {
  return Math.ceil(n / 7);
}

/** Monday-anchored ISO date of the week containing `iso`. */
export function weekStartISO(iso: string): string {
  const dow = weekdayOf(iso);
  const backToMonday = dow === 0 ? 6 : dow - 1;
  return addDays(iso, -backToMonday);
}

export function formatLong(iso: string): string {
  return parseDay(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatShort(iso: string): string {
  return parseDay(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}
