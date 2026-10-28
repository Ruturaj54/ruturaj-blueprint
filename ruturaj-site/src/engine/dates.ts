/**
 * All dates are IST calendar dates in `YYYY-MM-DD` form.
 *
 * `todayISO` is computed from the IST offset explicitly, so the same code
 * gives the same answer in his browser (IST) and in a Netlify function (UTC).
 * Every parse of a bare date goes through `parseDay`, which pins the clock to
 * local midday: `new Date('YYYY-MM-DD')` is UTC and lands on the previous day
 * for anyone east of Greenwich.
 */

const IST_OFFSET_MINUTES = 330;
const MS_PER_DAY = 86_400_000;

/**
 * A mission day begins at 04:00, not midnight: the final study block runs to
 * 01:00, so a problem solved at 00:40 belongs to the day it was planned in.
 */
export const DAY_START_HOUR = 4;

/** The date he wants to be applying systematically from. */
export const TARGET_DATE = '2027-03-10';

const pad = (n: number): string => String(n).padStart(2, '0');

export function parseDay(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export function formatISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Today's mission date in IST, rolling over at 04:00. */
export function todayISO(now: Date = new Date()): string {
  const shifted = new Date(now.getTime() + IST_OFFSET_MINUTES * 60_000 - DAY_START_HOUR * 3_600_000);
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/**
 * The IST calendar date, with no 04:00 shift. Used only where he thinks in
 * calendar days, such as choosing which date is Day 1 after midnight.
 */
export function istDateISO(now: Date = new Date()): string {
  const shifted = new Date(now.getTime() + IST_OFFSET_MINUTES * 60_000);
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/** The IST wall clock as "HH:MM". */
export function istClock(now: Date = new Date()): string {
  const shifted = new Date(now.getTime() + IST_OFFSET_MINUTES * 60_000);
  return `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
}

/** Minutes since IST midnight. */
export function istMinutes(now: Date = new Date()): number {
  const [h, m] = istClock(now).split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function addDays(iso: string, delta: number): string {
  const d = parseDay(iso);
  d.setDate(d.getDate() + delta);
  return formatISO(d);
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / MS_PER_DAY);
}

/* ---------- the general-roadmap mission anchor ----------------------------- */

let generalStart: string | null = null;

/** Called by storage whenever state changes, so day math follows the program. */
export function configureMission(start: string | null | undefined): void {
  generalStart = start ?? null;
}

/** Day 1 of the general roadmap, or today while it has not started. */
export function missionStart(): string {
  return generalStart ?? todayISO();
}

export function missionStarted(): boolean {
  return generalStart !== null;
}

/** Days in the general mission: from its Day 1 to the target date, never under 60. */
export function missionTotalDays(): number {
  return Math.max(60, daysBetween(missionStart(), TARGET_DATE) + 1);
}

export function dateForDay(n: number): string {
  return addDays(missionStart(), n - 1);
}

export function dayForDate(iso: string): number {
  return daysBetween(missionStart(), iso) + 1;
}

export function clampDay(n: number): number {
  const total = missionTotalDays();
  if (n < 1) return 1;
  if (n > total) return total;
  return n;
}

export function currentDay(): number {
  return clampDay(dayForDate(todayISO()));
}

export function daysRemaining(from: number = currentDay()): number {
  return Math.max(0, missionTotalDays() - from);
}

/* ---------- calendar helpers ------------------------------------------------ */

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

export function weekOfDay(n: number): number {
  return Math.ceil(n / 7);
}

/** Monday-anchored ISO date of the week containing `iso`. */
export function weekStartISO(iso: string): string {
  const dow = weekdayOf(iso);
  return addDays(iso, -(dow === 0 ? 6 : dow - 1));
}

export function formatLong(iso: string): string {
  return parseDay(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatShort(iso: string): string {
  return parseDay(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatWeekday(iso: string): string {
  return parseDay(iso).toLocaleDateString('en-IN', { weekday: 'long' });
}
